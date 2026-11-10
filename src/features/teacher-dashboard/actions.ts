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
import { sanitizeSearchQuery } from "@/lib/security/guards";
import { UserProfile } from "@/types/auth";
import {
  TeacherViolationRecord,
  TeacherDashboardStats,
  TeacherViolationFilter,
  PaginatedResult,
  AddViolationInput,
  ActionResponse,
  TeacherDashboardData,
  HomeroomClassData,
  HomeroomStudentItem,
  HomeroomDisciplineSummary,
} from "@/features/teacher-dashboard/types";
import { addViolationSchema } from "@/features/teacher-dashboard/schemas";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";
import { getTeachersAction } from "@/features/teachers/actions";
import { getStudentsAction } from "@/features/students/actions";
import {
  getMakassarDateBounds,
  isDateWithinMakassarRange,
  formatMakassarDate,
} from "@/lib/dateUtils";

// In-memory records store for zero-config demo / development mode
let TEACHER_VIOLATION_RECORDS: TeacherViolationRecord[] = [
  // Records reported by "usr-guru-01" (Siti Rahmawati, S.Pd)
  {
    id: "rec-tv-100",
    studentId: "stu-3",
    studentNis: "10295",
    studentName: "Dewi Anggraini",
    className: "XI MIPA 1",
    violationTypeId: "rule-102",
    ruleCode: "K-02",
    violationName: "Atribut seragam sekolah tidak lengkap (Dasi/Sabuk/Kaos Kaki)",
    categoryName: "Ringan",
    categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    points: 5,
    incidentDate: "2026-11-06T09:15:00",
    formattedDate: "06 Nov 2026, 09:15 WITA",
    notes: "Tidak mengenakan kaos kaki putih standar saat jam pelajaran pertama.",
    evidenceUrl: null,
    reportedById: "usr-guru-01",
    reportedByName: "Siti Rahmawati, S.Pd",
    status: "confirmed",
    createdAt: "2026-11-06T09:20:00",
  },
  {
    id: "rec-tv-101",
    studentId: "stu-1",
    studentNis: "10293",
    studentName: "Muhammad Rizky Pratama",
    className: "XI MIPA 2",
    violationTypeId: "rule-102",
    ruleCode: "K-02",
    violationName: "Atribut seragam sekolah tidak lengkap (Dasi/Sabuk/Kaos Kaki)",
    categoryName: "Ringan",
    categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    points: 5,
    incidentDate: "2026-11-02T07:15:00",
    formattedDate: "02 Nov 2026, 07:15 WITA",
    notes: "Siswa kedapatan tidak mengenakan dasi upacara saat apel pagi.",
    evidenceUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600",
    reportedById: "usr-guru-01",
    reportedByName: "Siti Rahmawati, S.Pd",
    status: "confirmed",
    createdAt: "2026-11-02T07:20:00",
  },
  {
    id: "rec-tv-102",
    studentId: "stu-4",
    studentNis: "10296",
    studentName: "Fajar Maulana",
    className: "XII IPS 2",
    violationTypeId: "rule-105",
    ruleCode: "S-01",
    violationName: "Meninggalkan jam pelajaran tanpa izin dari guru piket / mapel (Membolos)",
    categoryName: "Sedang",
    categoryColor: "bg-amber-50 text-amber-700 border-amber-200",
    points: 15,
    incidentDate: "2026-11-02T10:30:00",
    formattedDate: "02 Nov 2026, 10:30 WITA",
    notes: "Ditemukan berada di kantin belakang saat jam fisika berlangsung.",
    evidenceUrl: null,
    reportedById: "usr-guru-01",
    reportedByName: "Siti Rahmawati, S.Pd",
    status: "confirmed",
    createdAt: "2026-11-02T10:35:00",
  },
  {
    id: "rec-tv-103",
    studentId: "stu-2",
    studentNis: "10294",
    studentName: "Aditya Pratama Putra",
    className: "XII IPS 1",
    violationTypeId: "rule-101",
    ruleCode: "K-01",
    violationName: "Terlambat hadir di sekolah lebih dari 10 menit",
    categoryName: "Ringan",
    categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    points: 5,
    incidentDate: "2026-11-01T07:45:00",
    formattedDate: "01 Nov 2026, 07:45 WITA",
    notes: "Terlambat 20 menit karena ban bocor di perempatan Majene.",
    evidenceUrl: null,
    reportedById: "usr-guru-01",
    reportedByName: "Siti Rahmawati, S.Pd",
    status: "confirmed",
    createdAt: "2026-11-01T07:50:00",
  },
  {
    id: "rec-tv-104",
    studentId: "stu-8",
    studentNis: "10300",
    studentName: "Rian Hidayat",
    className: "XII MIPA 3",
    violationTypeId: "rule-109",
    ruleCode: "B-01",
    violationName: "Membawa atau merokok / vaping di dalam lingkungan sekolah",
    categoryName: "Berat",
    categoryColor: "bg-rose-50 text-rose-700 border-rose-200",
    points: 40,
    incidentDate: "2026-10-28T12:30:00",
    formattedDate: "28 Okt 2026, 12:30 WITA",
    notes: "Merokok pod vape di toilet barat lantai 2 bersama siswa lain.",
    evidenceUrl: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600",
    reportedById: "usr-guru-01",
    reportedByName: "Siti Rahmawati, S.Pd",
    status: "confirmed",
    createdAt: "2026-10-28T13:00:00",
  },
  // Record reported by another teacher (usr-guru-02) to verify personal data isolation
  {
    id: "rec-tv-201",
    studentId: "stu-6",
    studentNis: "10298",
    studentName: "Bagus Prasetyo",
    className: "X RPL 1",
    violationTypeId: "rule-103",
    ruleCode: "K-03",
    violationName: "Rambut tidak rapi atau dicat warna selain hitam",
    categoryName: "Ringan",
    categoryColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    points: 5,
    incidentDate: "2026-11-02T08:00:00",
    formattedDate: "02 Nov 2026, 08:00 WITA",
    notes: "Rambut bagian depan melewati alis mata.",
    evidenceUrl: null,
    reportedById: "usr-guru-02",
    reportedByName: "Drs. Joko Susilo, M.Pd",
    status: "confirmed",
    createdAt: "2026-11-02T08:05:00",
  },
];

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -------------------------------------------------------------
// GET TEACHER DASHBOARD DATA (STRICT PERSONAL ISOLATION)
// -------------------------------------------------------------

export async function getTeacherDashboardData(
  teacherProfileId: string,
  filter: TeacherViolationFilter = {}
): Promise<{
  stats: TeacherDashboardStats;
  recentSubmissions: PaginatedResult<TeacherViolationRecord>;
}> {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    throw new Error("Akses ditolak: Hanya Guru atau Admin yang berhak mengakses riwayat laporan ini.");
  }

  // Enforce personal data isolation: teachers can ONLY view their own submissions
  const effectiveTeacherId = session.user.role === "admin" ? teacherProfileId : session.user.id;

  const {
    search = "",
    status,
    dateRange = "all",
    page = 1,
    pageSize = 10,
  } = filter;

  const dateBounds = getMakassarDateBounds(dateRange);

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // Flow: authenticated user / effectiveTeacherId -> profile_id -> teachers table -> teachers.id
      let resolvedTeacherId: string | null = null;
      if (session.user.role === "guru" && session.user.teacherId && session.user.id === effectiveTeacherId) {
        resolvedTeacherId = session.user.teacherId;
      }

      if (!resolvedTeacherId) {
        const { data: teacherRow, error: teacherLookupError } = await supabase
          .from("teachers")
          .select("id")
          .or(`profile_id.eq.${effectiveTeacherId},id.eq.${effectiveTeacherId}`)
          .maybeSingle();

        if (teacherLookupError) {
          console.warn("Supabase teacher lookup error, checking fallback:", teacherLookupError.message);
        } else if (teacherRow?.id) {
          resolvedTeacherId = teacherRow.id;
        }
      }

      // If no corresponding teacher record exists in DB, check fallback records before returning zero
      if (!resolvedTeacherId) {
        const hasFallback = TEACHER_VIOLATION_RECORDS.some(
          (r) =>
            r.reportedById === effectiveTeacherId ||
            r.reportedById === session.user.id ||
            (session.user.teacherId && r.reportedById === session.user.teacherId)
        );
        if (!hasFallback) {
          return {
            stats: {
              violationsToday: 0,
              violationsThisMonth: 0,
              totalPersonalSubmissions: 0,
              totalPointsAccrued: 0,
              studentsHandledCount: 0,
            },
            recentSubmissions: {
              items: [],
              totalItems: 0,
              page: 1,
              pageSize,
              totalPages: 1,
            },
          };
        }
      }

      // STRICT ISOLATION: query student_violations WHERE reported_by = resolvedTeacherId (teachers.id)
      if (resolvedTeacherId) {
        let query = supabase
          .from("student_violations")
          .select(
            `
            id,
            student_id,
            violation_type_id,
            points,
            notes,
            evidence_url,
            incident_date,
            status,
            created_at,
            students:student_id (
              id,
              nis,
              class_name,
              profiles:profile_id (full_name)
            ),
            violation_types:violation_type_id (
              id,
              code,
              name,
              violation_categories:category_id (name, color_code)
            )
          `,
            { count: "exact" }
          )
          .eq("reported_by", resolvedTeacherId)
          .order("incident_date", { ascending: false });

        if (status && status !== "all") {
          query = query.eq("status", status);
        }

        // DATABASE FILTERING: incident_date >= startIso AND incident_date <= endIso in Asia/Makassar
        if (dateBounds) {
          query = query
            .gte("incident_date", dateBounds.startIso)
            .lte("incident_date", dateBounds.endIso);
        }

        const { data, count, error } = await query;

        if (error) {
          console.warn("Supabase teacher dashboard query error, falling back to local records:", error.message);
        } else if (data) {
          const mappedRecords: TeacherViolationRecord[] = data.map((item: any) => {
            const student = item.students || {};
            const profile = Array.isArray(student.profiles)
              ? student.profiles[0]
              : student.profiles;
            const vType = item.violation_types || {};
            const vCat = vType.violation_categories || {};

            const incDate = item.incident_date || item.created_at;

            return {
              id: item.id,
              studentId: item.student_id,
              studentNis: student.nis || "-",
              studentName: profile?.full_name || "Siswa",
              className: student.class_name || "-",
              violationTypeId: item.violation_type_id,
              ruleCode: vType.code || "V-01",
              violationName: vType.name || "Pelanggaran Siswa",
              categoryName: vCat.name || "Umum",
              categoryColor: vCat.color_code,
              points: item.points || 5,
              incidentDate: incDate,
              formattedDate: formatMakassarDate(incDate),
              notes: item.notes || "-",
              evidenceUrl: item.evidence_url,
              reportedById: resolvedTeacherId,
              reportedByName: session.user.fullName || "Anda",
              status: item.status || "confirmed",
              createdAt: item.created_at,
            };
          });

          // Overall teacher metrics calculated across school calendar
          const todayBounds = getMakassarDateBounds("today")!;
          const monthBounds = getMakassarDateBounds("this_month")!;

          const [todayRes, monthRes, totalRes, allTeacherRowsRes] = await Promise.all([
            supabase
              .from("student_violations")
              .select("*", { count: "exact", head: true })
              .eq("reported_by", resolvedTeacherId)
              .gte("incident_date", todayBounds.startIso)
              .lte("incident_date", todayBounds.endIso),
            supabase
              .from("student_violations")
              .select("*", { count: "exact", head: true })
              .eq("reported_by", resolvedTeacherId)
              .gte("incident_date", monthBounds.startIso)
              .lte("incident_date", monthBounds.endIso),
            supabase
              .from("student_violations")
              .select("*", { count: "exact", head: true })
              .eq("reported_by", resolvedTeacherId),
            supabase
              .from("student_violations")
              .select("points, student_id")
              .eq("reported_by", resolvedTeacherId),
          ]);

          const violationsToday = todayRes.count ?? 0;
          const violationsThisMonth = monthRes.count ?? 0;
          const totalPersonalSubmissions = totalRes.count ?? 0;
          const totalPointsAccrued =
            allTeacherRowsRes.data?.reduce((acc, cur) => acc + (cur.points || 0), 0) ?? 0;
          const studentsHandledCount = new Set(
            allTeacherRowsRes.data?.map((r) => r.student_id)
          ).size;

          // In-memory filter on mapped records for search text
          let filtered = mappedRecords;
          if (search.trim()) {
            const s = search.toLowerCase();
            filtered = filtered.filter(
              (r) =>
                r.studentName.toLowerCase().includes(s) ||
                r.studentNis.includes(s) ||
                r.className.toLowerCase().includes(s) ||
                r.violationName.toLowerCase().includes(s) ||
                r.ruleCode.toLowerCase().includes(s)
            );
          }

          const totalItems = filtered.length;
          const startIndex = (page - 1) * pageSize;
          const paginated = filtered.slice(startIndex, startIndex + pageSize);

          return {
            stats: {
              violationsToday,
              violationsThisMonth,
              totalPersonalSubmissions,
              totalPointsAccrued,
              studentsHandledCount,
            },
            recentSubmissions: {
              items: paginated,
              totalItems,
              page,
              pageSize,
              totalPages: Math.ceil(totalItems / pageSize) || 1,
            },
          };
        }
      }
    } catch (err: any) {
      console.warn("Supabase teacher dashboard request failed, gracefully falling back to local records:", err?.message || err);
    }
  }

  // Fallback: STRICT PERSONAL ISOLATION (Development mode only)
  if (process.env.NODE_ENV !== "development") {
    return {
      stats: {
        violationsToday: 0,
        violationsThisMonth: 0,
        totalPersonalSubmissions: 0,
        totalPointsAccrued: 0,
        studentsHandledCount: 0,
      },
      recentSubmissions: {
        items: [],
        totalItems: 0,
        page,
        pageSize,
        totalPages: 1,
      },
    };
  }

  // Teacher can ONLY access records where reportedById === effectiveTeacherId or session identifiers
  const personalRecords = TEACHER_VIOLATION_RECORDS.filter(
    (r) =>
      r.reportedById === effectiveTeacherId ||
      r.reportedById === session.user.id ||
      (session.user.teacherId && r.reportedById === session.user.teacherId)
  );

  // Compute stats strictly for this teacher with timezone helper
  const violationsToday = personalRecords.filter((r) =>
    isDateWithinMakassarRange(r.incidentDate, "today")
  ).length;

  const violationsThisMonth = personalRecords.filter((r) =>
    isDateWithinMakassarRange(r.incidentDate, "this_month")
  ).length;

  const totalPersonalSubmissions = personalRecords.length;
  const totalPointsAccrued = personalRecords.reduce(
    (acc, cur) => acc + (cur.points || 0),
    0
  );
  const studentsHandledCount = new Set(personalRecords.map((r) => r.studentId)).size;

  // Apply search and filters
  let filtered = [...personalRecords];

  if (search.trim()) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.studentName.toLowerCase().includes(s) ||
        r.studentNis.includes(s) ||
        r.className.toLowerCase().includes(s) ||
        r.violationName.toLowerCase().includes(s) ||
        r.ruleCode.toLowerCase().includes(s)
    );
  }

  if (status && status !== "all") {
    filtered = filtered.filter((r) => r.status === status);
  }

  if (dateRange && dateRange !== "all") {
    filtered = filtered.filter((r) =>
      isDateWithinMakassarRange(r.incidentDate, dateRange)
    );
  }

  // Sort by incidentDate descending
  filtered.sort(
    (a, b) =>
      new Date(b.incidentDate).getTime() - new Date(a.incidentDate).getTime()
  );

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (page - 1) * pageSize;
  const paginated = filtered.slice(startIndex, startIndex + pageSize);

  return {
    stats: {
      violationsToday,
      violationsThisMonth,
      totalPersonalSubmissions,
      totalPointsAccrued,
      studentsHandledCount,
    },
    recentSubmissions: {
      items: paginated,
      totalItems,
      page,
      pageSize,
      totalPages,
    },
  };
}

// -------------------------------------------------------------
// QUICK ACTION: ADD VIOLATION
// -------------------------------------------------------------

export async function addTeacherViolationAction(
  teacherProfile: UserProfile,
  rawInput: unknown
): Promise<ActionResponse<TeacherViolationRecord>> {
  const session = await getCurrentSession();
  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    return {
      success: false,
      message: "Akses ditolak: Hanya Guru atau Admin yang berhak mencatat pelanggaran siswa.",
    };
  }

  // Prevent reporter spoofing: use authenticated session user
  const effectiveTeacher = session.user;

  const parsed = addViolationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: lengkapi data siswa, aturan, dan kronologis.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data: AddViolationInput = parsed.data;

  // Format date readable
  const incDate = new Date(data.incidentDate);
  const formattedDate = incDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WITA";

  const categoryColor =
    data.categoryName === "Berat"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : data.categoryName === "Sedang"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // Flow: authenticated user -> profile_id -> teachers table -> teachers.id
      let teacherDbId: string | null = effectiveTeacher.teacherId || null;
      if (!teacherDbId) {
        const { data: teacherRow } = await supabase
          .from("teachers")
          .select("id")
          .or(`profile_id.eq.${effectiveTeacher.id},id.eq.${effectiveTeacher.id}`)
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

      // Resolve canonical rule points from violation_types table to prevent client point tampering (MEDIUM-01)
      let canonicalPoints = data.points;
      const { data: ruleRow } = await supabase
        .from("violation_types")
        .select("points")
        .eq("id", data.violationTypeId)
        .maybeSingle();
      if (ruleRow && typeof ruleRow.points === "number" && ruleRow.points > 0) {
        canonicalPoints = ruleRow.points;
      }

      // 1. Insert into student_violations table strictly tagged with teachers.id
      const { data: newViolation, error: vError } = await supabase
        .from("student_violations")
        .insert({
          student_id: data.studentId,
          violation_type_id: data.violationTypeId,
          reported_by: teacherDbId, // Strictly teachers.id! Never profile_id
          points: canonicalPoints,
          notes: data.notes,
          evidence_url: data.evidenceUrl || null,
          incident_date: data.incidentDate,
          status: "confirmed",
        })
        .select()
        .single();

      if (vError) {
        return {
          success: false,
          message: `Gagal mencatat pelanggaran di database: ${vError.message}`,
        };
      }

      // 2. Increment student's total_violation_points
      const { data: currentStudent, error: sFetchError } = await supabase
        .from("students")
        .select("total_violation_points")
        .eq("id", data.studentId)
        .single();

      if (sFetchError || !currentStudent) {
        return {
          success: false,
          message: `Gagal memperbarui total poin siswa: ${sFetchError?.message || "Data siswa tidak ditemukan"}`,
        };
      }

      const newTotal = (currentStudent.total_violation_points || 0) + canonicalPoints;
      const levelConfig = getDisciplinaryLevel(newTotal);
      const newStatus =
        levelConfig.level === "Aman"
          ? "active"
          : levelConfig.level.startsWith("SP1")
          ? "sp1"
          : levelConfig.level.startsWith("SP2")
          ? "sp2"
          : "sp3";

      const { error: studentUpdateError } = await supabase
        .from("students")
        .update({
          total_violation_points: newTotal,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.studentId);

      if (studentUpdateError) {
        return {
          success: false,
          message: `Gagal memperbarui status siswa: ${studentUpdateError.message}`,
        };
      }

      const createdRecord: TeacherViolationRecord = {
        id: newViolation.id,
        studentId: data.studentId,
        studentNis: data.studentNis,
        studentName: data.studentName,
        className: data.className,
        violationTypeId: data.violationTypeId,
        ruleCode: data.ruleCode,
        violationName: data.violationName,
        categoryName: data.categoryName,
        categoryColor,
        points: data.points,
        incidentDate: data.incidentDate,
        formattedDate,
        notes: data.notes,
        evidenceUrl: data.evidenceUrl || null,
        reportedById: teacherDbId,
        reportedByName: effectiveTeacher.fullName,
        status: "confirmed",
        createdAt: newViolation.created_at || new Date().toISOString(),
      };

      safeRevalidatePath("/guru");
      safeRevalidatePath("/guru/history");
      safeRevalidatePath("/guru/report");
      safeRevalidatePath("/admin/students");
      safeRevalidatePath("/admin");
      safeRevalidatePath("/siswa");

      return {
        success: true,
        message: `Pelanggaran "${data.violationName}" (+${data.points} poin) untuk siswa ${data.studentName} berhasil dicatat.`,
        data: createdRecord,
      };
    } catch (err: any) {
      console.error("Database addTeacherViolation error:", err);
      return {
        success: false,
        message: `Terjadi kesalahan saat menyimpan pelanggaran: ${err.message || err}`,
      };
    }
  }

  // Fallback in-memory insertion
  const newRecord: TeacherViolationRecord = {
    id: `rec-tv-${Date.now()}`,
    studentId: data.studentId,
    studentNis: data.studentNis,
    studentName: data.studentName,
    className: data.className,
    violationTypeId: data.violationTypeId,
    ruleCode: data.ruleCode,
    violationName: data.violationName,
    categoryName: data.categoryName,
    categoryColor,
    points: data.points,
    incidentDate: data.incidentDate,
    formattedDate,
    notes: data.notes,
    evidenceUrl: data.evidenceUrl || null,
    reportedById: effectiveTeacher.id,
    reportedByName: effectiveTeacher.fullName,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };

  TEACHER_VIOLATION_RECORDS.unshift(newRecord);
  safeRevalidatePath("/guru");

  return {
    success: true,
    message: `Laporan pelanggaran untuk ${data.studentName} (+${data.points} poin) berhasil disimpan ke buku catatan disiplin Anda.`,
    data: newRecord,
  };
}

// -------------------------------------------------------------
// GET HOMEROOM CLASS DATA (KELAS BINAAN)
// -------------------------------------------------------------

export async function getHomeroomClassDataAction(
  userId?: string
): Promise<HomeroomClassData> {
  const defaultEmptySummary: HomeroomDisciplineSummary = {
    totalStudents: 0,
    studentsWithoutViolations: 0,
    studentsWithViolations: 0,
    averageViolationPoints: 0,
  };

  const session = await getCurrentSession();
  if (!session || (session.user.role !== "guru" && session.user.role !== "admin")) {
    return {
      isHomeroom: false,
      assignedClass: null,
      message: "Akses hanya dimiliki oleh wali kelas.",
      summary: defaultEmptySummary,
      students: [],
    };
  }

  // Prevent userId parameter tampering (HIGH-03): only Admin may inspect another teacher's homeroom class
  const effectiveUserId = sanitizeSearchQuery(
    session.user.role === "admin" && userId ? userId : session.user.id
  );

  if (!effectiveUserId) {
    return {
      isHomeroom: false,
      assignedClass: null,
      message: "Akses hanya dimiliki oleh wali kelas.",
      summary: defaultEmptySummary,
      students: [],
    };
  }

  let assignedClass: string | null = null;

  // 1. Check teacher profile in Supabase
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: teacherData, error } = await supabase
        .from("teachers")
        .select("id, profile_id, assigned_class, specialization")
        .or(`profile_id.eq.${effectiveUserId},id.eq.${effectiveUserId}`)
        .maybeSingle();

      if (!error && teacherData?.assigned_class) {
        assignedClass = teacherData.assigned_class;
      }
    } catch (err) {
      console.warn("Error fetching teacher in getHomeroomClassDataAction:", err);
    }
  }

  // 2. Fallback check from teacher repository if not found in DB
  if (!assignedClass) {
    try {
      const teachersRes = await getTeachersAction({ pageSize: 100 });
      const matchedTeacher = teachersRes.items.find(
        (t) =>
          t.profileId === effectiveUserId ||
          t.id === effectiveUserId ||
          (session?.user?.email && t.email === session.user.email)
      );

      if (matchedTeacher?.assignedClass) {
        assignedClass = matchedTeacher.assignedClass;
      }
    } catch (err) {
      console.warn("Fallback teacher lookup error:", err);
    }
  }

  // Access Control: Teacher must have an assignedClass to be a Homeroom Teacher (Wali Kelas)
  if (!assignedClass || assignedClass.trim() === "" || assignedClass === "null") {
    return {
      isHomeroom: false,
      assignedClass: null,
      message: "Akses hanya dimiliki oleh wali kelas.",
      summary: defaultEmptySummary,
      students: [],
    };
  }

  // Normalize class name (e.g., "Wali Kelas XI MIPA 2" -> "XI MIPA 2")
  const normalizedClass = assignedClass.replace(/^wali\s*kelas\s*/i, "").trim();

  // 3. Fetch students in the homeroom class reusing getStudentsAction
  let studentsRes = await getStudentsAction({
    className: normalizedClass,
    pageSize: 200,
    sortBy: "fullName",
    sortOrder: "asc",
  });

  // If no students found with normalized class, try the raw assignedClass string
  if (studentsRes.items.length === 0 && normalizedClass !== assignedClass) {
    studentsRes = await getStudentsAction({
      className: assignedClass,
      pageSize: 200,
      sortBy: "fullName",
      sortOrder: "asc",
    });
  }

  // 4. Fetch violation occurrences count for students
  const studentIds = studentsRes.items.map((s) => s.id);
  const violationCounts: Record<string, number> = {};

  if (isSupabaseLive() && studentIds.length > 0) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: violations } = await supabase
        .from("student_violations")
        .select("student_id")
        .in("student_id", studentIds);

      if (violations) {
        for (const v of violations) {
          violationCounts[v.student_id] = (violationCounts[v.student_id] || 0) + 1;
        }
      }
    } catch (err) {
      console.warn("Error fetching violation counts for homeroom students:", err);
    }
  }

  // 5. Map student roster
  const rosterStudents: HomeroomStudentItem[] = studentsRes.items.map((s) => {
    let totalViolations = 0;
    if (violationCounts[s.id] !== undefined) {
      totalViolations = violationCounts[s.id];
    } else {
      // In-memory or demo fallback
      const memRecords = TEACHER_VIOLATION_RECORDS.filter(
        (r) => r.studentId === s.id || (s.nis && r.studentNis === s.nis)
      );
      if (memRecords.length > 0) {
        totalViolations = memRecords.length;
      } else if ((s.totalViolationPoints || 0) > 0) {
        totalViolations = Math.max(1, Math.round((s.totalViolationPoints || 0) / 10));
      }
    }

    return {
      id: s.id,
      studentName: s.fullName,
      nisn: s.nisn || s.nis || "-",
      nis: s.nis,
      className: s.className || normalizedClass,
      totalViolations,
      totalPoints: s.totalViolationPoints || 0,
      status: s.status,
    };
  });

  // 6. Calculate Discipline Summary
  const totalStudents = rosterStudents.length;
  const studentsWithoutViolations = rosterStudents.filter(
    (s) => s.totalViolations === 0 && s.totalPoints === 0
  ).length;
  const studentsWithViolations = rosterStudents.filter(
    (s) => s.totalViolations > 0 || s.totalPoints > 0
  ).length;
  const totalPointsSum = rosterStudents.reduce((sum, s) => sum + s.totalPoints, 0);
  const averageViolationPoints =
    totalStudents > 0 ? Number((totalPointsSum / totalStudents).toFixed(1)) : 0;

  return {
    isHomeroom: true,
    assignedClass: normalizedClass,
    summary: {
      totalStudents,
      studentsWithoutViolations,
      studentsWithViolations,
      averageViolationPoints,
    },
    students: rosterStudents,
  };
}
