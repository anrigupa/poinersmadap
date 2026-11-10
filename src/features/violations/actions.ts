"use server";

import { revalidatePath } from "next/cache";

function safeRevalidatePath(path: string, type?: "page" | "layout") {
  try {
    revalidatePath(path, type);
  } catch {
    // Non-request context
  }
}
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  RecordViolationInput,
  RecordViolationResult,
  ActionResponse,
  TopViolationItem,
} from "@/features/violations/types";
import { recordViolationSchema } from "@/features/violations/schemas";
import { getStudentsAction, applyStudentViolationPoints } from "@/features/students/actions";
import { getViolationsAction } from "@/features/rules/actions";
import { addTeacherViolationAction } from "@/features/teacher-dashboard/actions";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function recordStudentViolationAction(
  rawInput: unknown
): Promise<ActionResponse<RecordViolationResult>> {
  // -----------------------------------------------------------
  // 1. ROLE SECURITY: Verify Authentication & Authorization
  // -----------------------------------------------------------
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: "Akses ditolak: Anda harus login untuk mencatat pelanggaran siswa.",
    };
  }

  const { role } = session.user;
  if (role !== "guru" && role !== "admin") {
    return {
      success: false,
      message: "Akses dibatasi: Hanya akun Guru atau Admin yang berhak mencatat pelanggaran siswa.",
    };
  }

  // -----------------------------------------------------------
  // 2. INPUT VALIDATION
  // -----------------------------------------------------------
  const parsed = recordViolationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa data siswa, aturan, dan catatan kronologi.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data: RecordViolationInput = parsed.data;

  // -----------------------------------------------------------
  // 3. RESOLVE STUDENT DETAILS (LINK STUDENT)
  // -----------------------------------------------------------
  const studentsRes = await getStudentsAction({ pageSize: 100 });
  const student = studentsRes.items.find((s) => s.id === data.studentId);
  if (!student) {
    return {
      success: false,
      message: "Data siswa yang dipilih tidak ditemukan dalam sistem.",
    };
  }

  // -----------------------------------------------------------
  // 4. RESOLVE VIOLATION RULE DETAILS
  // -----------------------------------------------------------
  const rulesRes = await getViolationsAction({ pageSize: 100 });
  const rule = rulesRes.items.find((r) => r.id === data.violationTypeId);
  if (!rule) {
    return {
      success: false,
      message: "Pasal atau jenis pelanggaran yang dipilih tidak valid.",
    };
  }

  // -----------------------------------------------------------
  // 5. CALCULATE POINTS & DETERMINE STATUS ESCALATION
  // -----------------------------------------------------------
  const previousPoints = student.totalViolationPoints;
  // Always enforce authoritative rule points from the database catalogue (MEDIUM-01)
  const addedPoints = rule.points;
  const newTotalPoints = previousPoints + addedPoints;
  const previousStatus = student.status;

  // Disciplinary thresholds via unified constant:
  // 0-35: active, 36-75: sp1, 76-150: sp2, 151+: sp3
  const levelConfig = getDisciplinaryLevel(newTotalPoints);
  const newStatus =
    levelConfig.level === "Aman"
      ? "active"
      : levelConfig.level.startsWith("SP1")
      ? "sp1"
      : levelConfig.level.startsWith("SP2")
      ? "sp2"
      : "sp3";

  const sanctionEscalated = newStatus !== previousStatus;

  // Formatted date
  const incDate = new Date(data.incidentDate);
  const formattedDate = incDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WITA";

  const reporter = session.user;
  const violationId = `rec-viol-${Date.now()}`;

  // -----------------------------------------------------------
  // 6. SAVE VIOLATION & UPDATE STUDENT TOTAL POINTS
  // -----------------------------------------------------------
  if (!isSupabaseLive()) {
    return {
      success: false,
      message: "Database Supabase tidak terhubung. Tidak dapat mencatat pelanggaran.",
    };
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // Flow: authenticated user -> profile_id -> teachers table -> teachers.id
    let teacherDbId: string | null = session.user.teacherId || null;
    if (!teacherDbId) {
      const { data: teacherRow } = await supabase
        .from("teachers")
        .select("id")
        .or(`profile_id.eq.${reporter.id},id.eq.${reporter.id}`)
        .maybeSingle();

      if (teacherRow?.id) {
        teacherDbId = teacherRow.id;
      }
    }

    if (!teacherDbId) {
      return {
        success: false,
        message: "Akses ditolak: Data pengajar tidak ditemukan dalam tabel guru.",
      };
    }

    // A. Save violation with links to student and teacher (strictly teachers.id)
    const { data: inserted, error: insertError } = await supabase
      .from("student_violations")
      .insert({
        student_id: student.id,
        violation_type_id: rule.id,
        reported_by: teacherDbId, // Strictly teachers.id! Never profile_id!
        points: addedPoints,
        notes: data.notes + (data.location ? ` [Lokasi: ${data.location}]` : ""),
        evidence_url: data.evidenceUrl || null,
        incident_date: data.incidentDate,
        status: "confirmed",
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        message: `Gagal mencatat pelanggaran di database: ${insertError.message}`,
      };
    }

    // B. Update student total points and status
    const { error: studentUpdateError } = await supabase
      .from("students")
      .update({
        total_violation_points: newTotalPoints,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", student.id);

    if (studentUpdateError) {
      return {
        success: false,
        message: `Gagal memperbarui total poin siswa: ${studentUpdateError.message}`,
      };
    }

    safeRevalidatePath("/guru");
    safeRevalidatePath("/guru/history");
    safeRevalidatePath("/guru/report");
    safeRevalidatePath("/admin/students");
    safeRevalidatePath("/admin");
    safeRevalidatePath("/siswa");

    const result: RecordViolationResult = {
      violationId: inserted?.id || violationId,
      studentId: student.id,
      studentName: student.fullName,
      studentNis: student.nis,
      className: student.className,
      previousPoints,
      addedPoints,
      newTotalPoints,
      previousStatus,
      newStatus,
      sanctionEscalated,
      ruleCode: rule.code,
      violationName: rule.name,
      categoryName: rule.categoryName,
      reportedByName: reporter.fullName,
      reportedByNip: reporter.nip,
      incidentDate: data.incidentDate,
      formattedDate,
      notes: data.notes,
      location: data.location,
      evidenceUrl: data.evidenceUrl,
      createdAt: inserted?.created_at || new Date().toISOString(),
    };

    return {
      success: true,
      message: `Pelanggaran "${rule.name}" (+${addedPoints} poin) berhasil dicatat untuk ${student.fullName}. Total poin saat ini: ${newTotalPoints}.`,
      data: result,
    };
  } catch (err: any) {
    console.error("Database recordStudentViolation error:", err);
    return {
      success: false,
      message: `Terjadi kesalahan saat menyimpan pelanggaran: ${err.message || err}`,
    };
  }
}

// -------------------------------------------------------------
// GET TOP 5 VIOLATIONS (DYNAMIC LIVE RANKING FROM SUPABASE)
// -------------------------------------------------------------

export async function getTopViolationsAction(): Promise<TopViolationItem[]> {
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data, error } = await supabase
        .from("student_violations")
        .select(`
          id,
          violation_type_id,
          points,
          status,
          violation_types:violation_type_id (
            id,
            name,
            code,
            points,
            violation_categories:category_id (name)
          )
        `)
        .neq("status", "cancelled");

      if (error) {
        console.warn("Supabase top violations query error:", error.message);
      } else if (data) {
        if (data.length === 0) {
          return [];
        }

        const map = new Map<
          string,
          {
            violationId: string;
            violationName: string;
            code?: string;
            categoryName?: string;
            count: number;
            points?: number;
          }
        >();

        data.forEach((row: any) => {
          const vType = Array.isArray(row.violation_types)
            ? row.violation_types[0]
            : row.violation_types;
          const cat = Array.isArray(vType?.violation_categories)
            ? vType?.violation_categories[0]
            : vType?.violation_categories;

          const key = row.violation_type_id || vType?.name || "unknown";
          const name = vType?.name || "Pelanggaran Tata Tertib";
          const code = vType?.code;
          const categoryName = cat?.name || "Umum";
          const points = Number(row.points) || Number(vType?.points) || 5;

          const existing = map.get(key);
          if (existing) {
            existing.count += 1;
          } else {
            map.set(key, {
              violationId: key,
              violationName: name,
              code,
              categoryName,
              count: 1,
              points,
            });
          }
        });

        const sorted = Array.from(map.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map((item, index) => ({
            ranking: index + 1,
            ...item,
          }));

        return sorted;
      }
    } catch (err) {
      console.warn("Error in getTopViolationsAction:", err);
    }
  }

  // Fallback demo violations only in development mode
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  return [
    {
      ranking: 1,
      violationId: "v-1",
      violationName: "Terlambat Hadir di Sekolah",
      code: "DIS-01",
      categoryName: "Kedisiplinan & Waktu",
      count: 125,
      points: 5,
    },
    {
      ranking: 2,
      violationId: "v-2",
      violationName: "Tidak Memakai Atribut Seragam Lengkap",
      code: "RPA-01",
      categoryName: "Kerapian & Seragam",
      count: 98,
      points: 5,
    },
    {
      ranking: 3,
      violationId: "v-3",
      violationName: "Rambut Tidak Sesuai Ketentuan",
      code: "RPA-02",
      categoryName: "Kerapian & Seragam",
      count: 76,
      points: 10,
    },
    {
      ranking: 4,
      violationId: "v-4",
      violationName: "Keluar Kelas / Tidak Masuk Tanpa Izin",
      code: "DIS-03",
      categoryName: "Kedisiplinan & Waktu",
      count: 54,
      points: 20,
    },
    {
      ranking: 5,
      violationId: "v-5",
      violationName: "Membawa & Menggunakan HP Saat Jam Pelajaran",
      code: "ETK-01",
      categoryName: "Etika & Perilaku",
      count: 31,
      points: 10,
    },
  ];
}

