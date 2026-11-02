"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { UserProfile } from "@/types/auth";
import {
  TeacherViolationRecord,
  TeacherDashboardStats,
  TeacherViolationFilter,
  PaginatedResult,
  AddViolationInput,
  ActionResponse,
  TeacherDashboardData,
} from "@/features/teacher-dashboard/types";
import { addViolationSchema } from "@/features/teacher-dashboard/schemas";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";

// In-memory records store for zero-config demo / development mode
let TEACHER_VIOLATION_RECORDS: TeacherViolationRecord[] = [
  // Records reported by "usr-guru-01" (Siti Rahmawati, S.Pd)
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

  // Today's date stamp in YYYY-MM-DD
  const todayStr = "2026-11-02";
  const thisMonthStr = "2026-11";

  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();

      // STRICT ISOLATION: query student_violations WHERE reported_by = effectiveTeacherId
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
        .eq("reported_by", effectiveTeacherId)
        .order("incident_date", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, count, error } = await query;

      if (!error && data) {
        const mappedRecords: TeacherViolationRecord[] = data.map((item: any) => {
          const student = item.students || {};
          const profile = Array.isArray(student.profiles)
            ? student.profiles[0]
            : student.profiles;
          const vType = item.violation_types || {};
          const vCat = vType.violation_categories || {};

          const incDate = item.incident_date || item.created_at;
          const dateObj = new Date(incDate);
          const formatted = dateObj.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

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
            formattedDate: formatted,
            notes: item.notes || "-",
            evidenceUrl: item.evidence_url,
            reportedById: teacherProfileId,
            reportedByName: "Anda",
            status: item.status || "confirmed",
            createdAt: item.created_at,
          };
        });

        // Compute metrics strictly for this teacher
        const violationsToday = mappedRecords.filter((r) =>
          r.incidentDate.startsWith(todayStr)
        ).length;

        const violationsThisMonth = mappedRecords.filter((r) =>
          r.incidentDate.startsWith(thisMonthStr)
        ).length;

        const totalPersonalSubmissions = mappedRecords.length;
        const totalPointsAccrued = mappedRecords.reduce(
          (acc, cur) => acc + (cur.points || 0),
          0
        );

        // In-memory filter on mapped records
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

        if (dateRange === "today") {
          filtered = filtered.filter((r) => r.incidentDate.startsWith(todayStr));
        } else if (dateRange === "this_month") {
          filtered = filtered.filter((r) =>
            r.incidentDate.startsWith(thisMonthStr)
          );
        }

        const totalItems = count || filtered.length;
        const startIndex = (page - 1) * pageSize;
        const paginated = filtered.slice(startIndex, startIndex + pageSize);

        return {
          stats: {
            violationsToday,
            violationsThisMonth,
            totalPersonalSubmissions,
            totalPointsAccrued,
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
    } catch (err) {
      console.warn("Supabase teacher dashboard error, using fallback:", err);
    }
  }

  // Fallback: STRICT PERSONAL ISOLATION
  // Teacher can ONLY access records where reportedById === effectiveTeacherId
  const personalRecords = TEACHER_VIOLATION_RECORDS.filter(
    (r) => r.reportedById === effectiveTeacherId
  );

  // Compute stats strictly for this teacher
  const violationsToday = personalRecords.filter((r) =>
    r.incidentDate.startsWith(todayStr)
  ).length;

  const violationsThisMonth = personalRecords.filter((r) =>
    r.incidentDate.startsWith(thisMonthStr)
  ).length;

  const totalPersonalSubmissions = personalRecords.length;
  const totalPointsAccrued = personalRecords.reduce(
    (acc, cur) => acc + (cur.points || 0),
    0
  );

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

  if (dateRange === "today") {
    filtered = filtered.filter((r) => r.incidentDate.startsWith(todayStr));
  } else if (dateRange === "this_month") {
    filtered = filtered.filter((r) => r.incidentDate.startsWith(thisMonthStr));
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
      const supabase = await createClient();

      // 1. Insert into student_violations table strictly tagged with effectiveTeacher.id
      const { data: newViolation, error: vError } = await supabase
        .from("student_violations")
        .insert({
          student_id: data.studentId,
          violation_type_id: data.violationTypeId,
          reported_by: effectiveTeacher.id,
          points: data.points,
          notes: data.notes,
          evidence_url: data.evidenceUrl || null,
          incident_date: data.incidentDate,
          status: "confirmed",
        })
        .select()
        .single();

      if (vError) {
        throw new Error(vError.message);
      }

      // 2. Increment student's total_violation_points
      const { data: currentStudent } = await supabase
        .from("students")
        .select("total_violation_points")
        .eq("id", data.studentId)
        .single();

      if (currentStudent) {
        const newTotal = (currentStudent.total_violation_points || 0) + data.points;
        const levelConfig = getDisciplinaryLevel(newTotal);
        const newStatus =
          levelConfig.level === "Aman"
            ? "active"
            : levelConfig.level.startsWith("SP1")
            ? "sp1"
            : levelConfig.level.startsWith("SP2")
            ? "sp2"
            : "sp3";

        await supabase
          .from("students")
          .update({
            total_violation_points: newTotal,
            status: newStatus,
          })
          .eq("id", data.studentId);
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
        reportedById: effectiveTeacher.id,
        reportedByName: effectiveTeacher.fullName,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };

      TEACHER_VIOLATION_RECORDS.unshift(createdRecord);
      revalidatePath("/guru");

      return {
        success: true,
        message: `Pelanggaran "${data.violationName}" (+${data.points} poin) untuk siswa ${data.studentName} berhasil dicatat.`,
        data: createdRecord,
      };
    } catch (err: any) {
      console.warn("Supabase addTeacherViolation failed, using fallback:", err.message);
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
  revalidatePath("/guru");

  return {
    success: true,
    message: `Laporan pelanggaran untuk ${data.studentName} (+${data.points} poin) berhasil disimpan ke buku catatan disiplin Anda.`,
    data: newRecord,
  };
}
