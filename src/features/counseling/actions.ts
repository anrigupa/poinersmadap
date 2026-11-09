"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { sanitizeSearchQuery } from "@/lib/security/guards";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";
import { getTeachersAction } from "@/features/teachers/actions";
import { getStudentsAction } from "@/features/students/actions";
import {
  CounselingRecordItem,
  StudentCounselingProfile,
  CounselorDashboardData,
  CounselorAccessResult,
  CoachingStudentItem,
  CounselorStudentOption,
} from "@/features/counseling/types";
import {
  getAllStudentAchievementsAction,
  getAllMeritDeductionsAction,
} from "@/features/student-merits/actions";
import { counselingFormSchema, CounselingFormData } from "@/features/counseling/schemas";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// In-memory counseling records store for zero-config / development mode
let IN_MEMORY_COUNSELING_RECORDS: CounselingRecordItem[] = [
  {
    id: "cnsl-001",
    studentId: "stu-1",
    studentName: "Muhammad Rizky Pratama",
    studentNis: "10293",
    className: "XI MIPA 2",
    counselorId: "usr-guru-01",
    counselorName: "Siti Rahmawati, S.Pd",
    counselingType: "Bimbingan Kedisiplinan",
    description: "Siswa telah mengikuti konseling motivasi dan menyelesaikan tugas bakti lingkungan sekolah selama 3 hari berturut-turut.",
    counselingDate: "2026-11-03T10:00:00",
    pointReduction: 10,
    previousPoints: 35,
    resultingPoints: 25,
    reductionReason: "Penyelesaian tugas pembinaan budi pekerti dan komitmen disiplin.",
    evidenceNotes: "Surat pernyataan komitmen disiplin tertandatangani + laporan kegiatan piket kebersihan.",
    action: "Konseling & Pengurangan Poin",
    createdAt: "2026-11-03T10:30:00",
  },
  {
    id: "cnsl-002",
    studentId: "stu-2",
    studentName: "Aditya Pratama Putra",
    studentNis: "10294",
    className: "XII IPS 1",
    counselorId: "usr-guru-01",
    counselorName: "Siti Rahmawati, S.Pd",
    counselingType: "Konseling Individu",
    description: "Pembinaan terkait keterlambatan berulang. Siswa berkomitmen bangun lebih awal dan mengatur jadwal belajar malam.",
    counselingDate: "2026-11-01T09:15:00",
    pointReduction: 5,
    previousPoints: 50,
    resultingPoints: 45,
    reductionReason: "Kehadiran tepat waktu selama 7 hari kerja berturut-turut.",
    evidenceNotes: "Buku absensi apel pagi piket sekolah terverifikasi.",
    action: "Konseling & Pengurangan Poin",
    createdAt: "2026-11-01T09:45:00",
  },
  {
    id: "cnsl-003",
    studentId: "stu-8",
    studentName: "Rian Hidayat",
    studentNis: "10300",
    className: "XII MIPA 3",
    counselorId: "usr-guru-01",
    counselorName: "Siti Rahmawati, S.Pd",
    counselingType: "Konferensi Kasus (Case Conference)",
    description: "Sesi konseling tahap awal bersama orang tua mengenai pelanggaran berat. Siswa menandatangani surat komitmen perbaikan.",
    counselingDate: "2026-10-30T13:00:00",
    pointReduction: 0,
    previousPoints: 110,
    resultingPoints: 110,
    reductionReason: null,
    evidenceNotes: "Berita acara konseling orang tua dan guru BK.",
    action: "Bimbingan Konseling",
    createdAt: "2026-10-30T14:00:00",
  },
];

// -------------------------------------------------------------
// 1. CHECK COUNSELOR ACCESS
// -------------------------------------------------------------
export async function getCounselorAccessStatusAction(
  userId?: string
): Promise<CounselorAccessResult> {
  const session = await getCurrentSession();
  if (!session || !session.user) {
    return {
      isCounselor: false,
      message: "Akses hanya dimiliki oleh Guru BK.",
    };
  }

  // Admin has overarching access to counselor features
  if (session.user.role === "admin") {
    return {
      isCounselor: true,
      teacher: {
        id: session.user.id,
        profileId: session.user.id,
        fullName: session.user.fullName || "Administrator BK",
        nip: "-",
        teacherType: "counselor",
        specialization: "guru_bk",
      },
    };
  }

  // Only Guru or Admin can hold counselor status (Admin already returned above)
  if (session.user.role !== "guru") {
    return {
      isCounselor: false,
      message: "Akses hanya dimiliki oleh Guru BK.",
    };
  }

  // Prevent userId parameter tampering (HIGH-03): Guru must always use their own session.user.id
  const effectiveUserId = sanitizeSearchQuery(session.user.id);

  // Check in Supabase teachers table
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: teacher, error } = await supabase
        .from("teachers")
        .select(`
          id,
          profile_id,
          nip,
          teacher_type,
          specialization,
          profiles:profile_id (
            full_name
          )
        `)
        .or(`profile_id.eq.${effectiveUserId},id.eq.${effectiveUserId}`)
        .maybeSingle();

      if (!error && teacher) {
        const isCounselor =
          teacher.teacher_type === "counselor" ||
          teacher.specialization === "guru_bk";

        if (isCounselor) {
          const profile = Array.isArray(teacher.profiles)
            ? teacher.profiles[0]
            : teacher.profiles;
          return {
            isCounselor: true,
            teacher: {
              id: teacher.id,
              profileId: teacher.profile_id,
              fullName: profile?.full_name || session.user.fullName || "Guru BK",
              nip: teacher.nip,
              teacherType: teacher.teacher_type || "counselor",
              specialization: teacher.specialization || "guru_bk",
            },
          };
        } else {
          return {
            isCounselor: false,
            message: "Akses hanya dimiliki oleh Guru BK.",
          };
        }
      }
    } catch (err) {
      console.warn("Counselor check in Supabase failed, using fallback:", err);
    }
  }

  // Fallback: check teachers repository
  try {
    const teachersRes = await getTeachersAction({ pageSize: 100 });
    const matched = teachersRes.items.find(
      (t) =>
        t.profileId === effectiveUserId ||
        t.id === effectiveUserId ||
        (session.user.email && t.email === session.user.email)
    );

    const isCounselor =
      matched?.teacher_type === "counselor" ||
      matched?.specialization === "guru_bk";

    if (isCounselor && matched) {
      return {
        isCounselor: true,
        teacher: {
          id: matched.id,
          profileId: matched.profileId,
          fullName: matched.fullName,
          nip: matched.nip,
          teacherType: matched.teacher_type,
          specialization: matched.specialization,
        },
      };
    }
  } catch (err) {
    console.warn("Fallback teacher check error:", err);
  }

  return {
    isCounselor: false,
    message: "Akses hanya dimiliki oleh Guru BK.",
  };
}

// -------------------------------------------------------------
// 2. GET COUNSELING RECORDS HISTORY (SEC-IDOR-01 HARDENED)
// -------------------------------------------------------------
export async function getCounselingRecordsAction(
  studentId?: string
): Promise<CounselingRecordItem[]> {
  // 1. Remove unauthenticated access & enforce active session
  const session = await getCurrentSession();
  if (!session) {
    throw new Error(
      "Akses ditolak: Anda harus login terlebih dahulu untuk mengakses riwayat konseling."
    );
  }

  // 2. Enforce role validation: strictly Admin or Counselor (Guru BK)
  const access = await getCounselorAccessStatusAction();
  if (!access.isCounselor) {
    throw new Error(
      "Akses ditolak: Hanya Guru BK atau Administrator yang berwenang mengakses catatan konseling siswa."
    );
  }

  // 3. Strict scope filtering & sanitization
  const cleanStudentId = studentId ? sanitizeSearchQuery(studentId) : undefined;
  let records: CounselingRecordItem[] = [];

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      let query = supabase
        .from("counseling_records")
        .select(`
          id,
          student_id,
          counselor_id,
          counseling_type,
          notes,
          counseling_date,
          status,
          created_at,
          students:student_id (
            id,
            nis,
            class_name,
            profiles:profile_id (
              full_name
            )
          ),
          teachers:counselor_id (
            id,
            profiles:profile_id (
              full_name
            )
          )
        `)
        .order("counseling_date", { ascending: false });

      if (cleanStudentId) {
        query = query.eq("student_id", cleanStudentId);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        records = data.map((d: any) => {
          const student = d.students || {};
          const studentProfile = Array.isArray(student.profiles)
            ? student.profiles[0]
            : student.profiles;

          const teacher = d.teachers || {};
          const teacherProfile = Array.isArray(teacher.profiles)
            ? teacher.profiles[0]
            : teacher.profiles;

          return {
            id: d.id,
            studentId: d.student_id,
            studentName: studentProfile?.full_name || "Siswa",
            studentNis: student.nis || "-",
            className: student.class_name || "-",
            counselorId: d.counselor_id || "-",
            counselorName: teacherProfile?.full_name || "Guru BK",
            counselingType: d.counseling_type || "Bimbingan Konseling",
            description: d.notes || "",
            notes: d.notes || "",
            status: d.status || "completed",
            counselingDate: d.counseling_date,
            pointReduction: 0,
            previousPoints: 0,
            resultingPoints: 0,
            reductionReason: null,
            evidenceNotes: null,
            action: d.counseling_type || "Bimbingan Konseling",
            createdAt: d.created_at,
          };
        });
        return records;
      }
    } catch (err) {
      console.warn("Supabase counseling_records fetch failed, using fallback:", err);
    }
  }

  // Fallback to in-memory records if DB empty or unavailable (Development mode only)
  if (records.length === 0 && process.env.NODE_ENV === "development") {
    if (cleanStudentId) {
      return IN_MEMORY_COUNSELING_RECORDS.filter((r) => r.studentId === cleanStudentId);
    }
    return [...IN_MEMORY_COUNSELING_RECORDS];
  }

  return records;
}

// -------------------------------------------------------------
// 3. GET COUNSELOR DASHBOARD DATA
// -------------------------------------------------------------
export async function getCounselorDashboardDataAction(): Promise<CounselorDashboardData> {
  const access = await getCounselorAccessStatusAction();

  if (!access.isCounselor) {
    return {
      access,
      summary: {
        totalPendingMerits: 0,
        totalApprovedMerits: 0,
        totalApprovedReductions: 0,
        totalStudentsInCoaching: 0,
      },
      achievements: [],
      reductions: [],
      coachingStudents: [],
      availableStudents: [],
      counselingHistory: [],
    };
  }

  // 1. Fetch all student achievements (Section 2)
  let achievements: any[] = [];
  try {
    achievements = await getAllStudentAchievementsAction();
  } catch (err) {
    console.warn("Failed fetching counselor achievements:", err);
  }

  // 2. Fetch all student reductions (Section 4)
  let reductions: any[] = [];
  try {
    reductions = await getAllMeritDeductionsAction();
  } catch (err) {
    console.warn("Failed fetching counselor reductions:", err);
  }

  // 3. Fetch counseling records history (Strict counseling_records query)
  let counselingHistory: CounselingRecordItem[] = [];
  try {
    counselingHistory = await getCounselingRecordsAction();
  } catch (err) {
    console.warn("Failed fetching counselor history:", err);
  }

  // 4. Fetch available students and calculate effective discipline & merits
  const studentsRes = await getStudentsAction({
    pageSize: 200,
    sortBy: "fullName",
    sortOrder: "asc",
  });

  // Fetch all active violations count per student if live
  const studentViolationsCountMap = new Map<string, number>();
  if (isSupabaseLive()) {
    try {
      const supabase = createAdminClient();
      const { data: vList } = await supabase
        .from("student_violations")
        .select("student_id")
        .neq("status", "cancelled");

      if (vList) {
        for (const v of vList) {
          studentViolationsCountMap.set(
            v.student_id,
            (studentViolationsCountMap.get(v.student_id) || 0) + 1
          );
        }
      }
    } catch (err) {
      console.warn("Failed to fetch student_violations count, using point approximation:", err);
    }
  }

  const availableStudents: CounselorStudentOption[] = studentsRes.items.map((s) => {
    const studentMerits = achievements
      .filter((a) => a.studentId === s.id && a.status === "approved")
      .reduce((sum, a) => sum + (a.meritPoints || 0), 0);

    const studentReductions = reductions
      .filter((r) => r.studentId === s.id)
      .reduce((sum, r) => sum + (r.reductionPoints || 0), 0);

    const availableMerits = Math.max(0, studentMerits - studentReductions);
    const rawViolations = s.totalViolationPoints || 0;
    const effectivePoints = Math.max(0, rawViolations - studentReductions);

    return {
      id: s.id,
      fullName: s.fullName,
      nis: s.nis,
      nisn: s.nisn,
      className: s.className,
      totalViolationPoints: rawViolations,
      totalMeritPoints: studentMerits,
      availableMerits: availableMerits,
      effectivePoints: effectivePoints,
      status: s.status,
    };
  });

  // 5. Calculate Coaching Students (Section 5)
  // SP1, SP2, SP3, or BK Monitoring based on effective discipline points
  const coachingStudents: CoachingStudentItem[] = availableStudents
    .map((s) => {
      const studentHistory = counselingHistory.filter((c) => c.studentId === s.id);
      const latestNote = studentHistory[0]?.description || studentHistory[0]?.action || null;
      const count = studentHistory.length;

      let disciplineStatus: "SP1" | "SP2" | "SP3 (Kepala Sekolah)" | "BK Monitoring" | "Aman" = "Aman";
      let statusColor: "rose" | "orange" | "amber" | "blue" | "emerald" = "emerald";

      if (s.effectivePoints >= 151) {
        disciplineStatus = "SP3 (Kepala Sekolah)";
        statusColor = "rose";
      } else if (s.effectivePoints >= 76) {
        disciplineStatus = "SP2";
        statusColor = "orange";
      } else if (s.effectivePoints >= 36) {
        disciplineStatus = "SP1";
        statusColor = "amber";
      } else if (s.effectivePoints >= 15 || count > 0) {
        disciplineStatus = "BK Monitoring";
        statusColor = "blue";
      }

      const totalReductions = reductions
        .filter((r) => r.studentId === s.id)
        .reduce((sum, r) => sum + (r.reductionPoints || 0), 0);

      const rawViolationsCount =
        studentViolationsCountMap.get(s.id) ??
        (s.totalViolationPoints > 0 ? Math.ceil(s.totalViolationPoints / 10) : 0);

      return {
        id: s.id,
        studentName: s.fullName,
        studentNis: s.nis,
        studentNisn: s.nisn,
        className: s.className,
        totalViolations: rawViolationsCount,
        totalViolationPoints: s.totalViolationPoints,
        totalReductionPoints: totalReductions,
        effectivePoints: s.effectivePoints,
        disciplineStatus,
        statusColor,
        totalMeritPoints: s.totalMeritPoints,
        availableMerits: s.availableMerits,
        latestCounselingNote: latestNote,
        counselingRecordsCount: count,
      };
    })
    .filter((cs) => cs.disciplineStatus !== "Aman" || cs.counselingRecordsCount > 0)
    .sort((a, b) => b.effectivePoints - a.effectivePoints);

  // 6. Section 1 Summary Cards
  const summary = {
    totalPendingMerits: achievements.filter((a) => a.status === "pending").length,
    totalApprovedMerits: achievements.filter((a) => a.status === "approved").length,
    totalApprovedReductions: reductions.length,
    totalStudentsInCoaching: coachingStudents.length,
  };

  return {
    access,
    summary,
    achievements,
    reductions,
    coachingStudents,
    availableStudents,
    counselingHistory,
  };
}

// -------------------------------------------------------------
// 3. GET STUDENT COUNSELING PROFILE
// -------------------------------------------------------------
export async function getStudentCounselingProfileAction(
  studentId: string
): Promise<StudentCounselingProfile | null> {
  const access = await getCounselorAccessStatusAction();
  if (!access.isCounselor) {
    throw new Error("Akses ditolak: Hanya Guru BK atau Administrator yang berwenang mengakses profil konseling siswa.");
  }

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: student, error } = await supabase
        .from("students")
        .select(`
          id,
          profile_id,
          nis,
          nisn,
          class_name,
          total_violation_points,
          status,
          profiles:profile_id (
            full_name
          )
        `)
        .eq("id", studentId)
        .maybeSingle();

      if (!error && student) {
        const profile = Array.isArray(student.profiles)
          ? student.profiles[0]
          : student.profiles;

        // Fetch violation occurrences
        const { data: violations } = await supabase
          .from("student_violations")
          .select(`
            id,
            points,
            incident_date,
            status,
            violation_types:violation_type_id (
              name,
              code,
              violation_categories:category_id (name)
            )
          `)
          .eq("student_id", studentId)
          .order("incident_date", { ascending: false });

        const mappedViolations = (violations || []).map((v: any) => {
          const vType = v.violation_types || {};
          const vCat = vType.violation_categories || {};
          return {
            id: v.id,
            violationName: vType.name || "Pelanggaran Siswa",
            ruleCode: vType.code || "V-01",
            categoryName: vCat.name || "Umum",
            points: v.points || 0,
            incidentDate: v.incident_date,
            status: v.status || "confirmed",
          };
        });

        const totalPoints = student.total_violation_points || 0;
        const disciplineStatus = getDisciplinaryLevel(totalPoints);

        return {
          id: student.id,
          profileId: student.profile_id,
          studentName: profile?.full_name || "Siswa",
          nis: student.nis || "-",
          nisn: student.nisn || "-",
          className: student.class_name,
          totalPoints,
          totalViolations: mappedViolations.length,
          currentDisciplineStatus: disciplineStatus,
          recentViolations: mappedViolations,
        };
      }
    } catch (err) {
      console.warn("Supabase student profile lookup failed, using fallback:", err);
    }
  }

  // Fallback lookup from students action
  const studentsRes = await getStudentsAction({ pageSize: 200 });
  const matched = studentsRes.items.find((s) => s.id === studentId);
  if (!matched) return null;

  const totalPoints = matched.totalViolationPoints || 0;
  const disciplineStatus = getDisciplinaryLevel(totalPoints);

  return {
    id: matched.id,
    profileId: matched.profileId,
    studentName: matched.fullName,
    nis: matched.nis,
    nisn: matched.nisn,
    className: matched.className,
    totalPoints,
    totalViolations: totalPoints > 0 ? Math.ceil(totalPoints / 10) : 0,
    currentDisciplineStatus: disciplineStatus,
    recentViolations: [],
  };
}

// -------------------------------------------------------------
// 5. RECORD COUNSELING SESSION (Strict Schema Alignment)
// -------------------------------------------------------------
export async function recordCounselingSessionAction(
  data: CounselingFormData
): Promise<{ success: boolean; message: string; data?: CounselingRecordItem }> {
  const parsed = counselingFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data input tidak valid.",
    };
  }

  const access = await getCounselorAccessStatusAction();
  if (!access.isCounselor) {
    return {
      success: false,
      message: "Akses hanya dimiliki oleh Guru BK.",
    };
  }

  const session = await getCurrentSession();
  const {
    studentId,
    counselingType,
    description,
    counselingDate,
    evidenceNotes,
  } = parsed.data;

  // 1. Fetch current student profile
  const studentProfile = await getStudentCounselingProfileAction(studentId);
  if (!studentProfile) {
    return {
      success: false,
      message: "Data siswa tidak ditemukan.",
    };
  }

  const counselorName = access.teacher?.fullName || session?.user?.fullName || "Guru BK";
  const sessionDate = counselingDate || new Date().toISOString();

  const combinedNotes = [
    description.trim(),
    evidenceNotes?.trim() ? `[Catatan Tambahan: ${evidenceNotes.trim()}]` : null,
  ]
    .filter(Boolean)
    .join("\n\n");

  const newRecord: CounselingRecordItem = {
    id: `cnsl-${Date.now()}`,
    studentId: studentProfile.id,
    studentName: studentProfile.studentName,
    studentNis: studentProfile.nis,
    className: studentProfile.className,
    counselorId: access.teacher?.id || "usr-guru-01",
    counselorName,
    counselingType,
    description: combinedNotes,
    notes: combinedNotes,
    status: "completed",
    counselingDate: sessionDate,
    pointReduction: 0,
    previousPoints: studentProfile.totalPoints,
    resultingPoints: studentProfile.totalPoints,
    reductionReason: null,
    evidenceNotes: evidenceNotes || null,
    action: counselingType,
    createdAt: new Date().toISOString(),
  };

  // 2. Persist to Supabase if live
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // Resolve valid teacher id (strictly teachers.id!)
      let teacherDbId: string | null = null;
      if (access.teacher?.id && access.teacher.id.length === 36 && access.teacher.id !== session?.user?.id) {
        teacherDbId = access.teacher.id;
      }
      if (!teacherDbId && session?.user?.id) {
        const { data: teacherRow } = await supabase
          .from("teachers")
          .select("id")
          .or(`profile_id.eq.${session.user.id},id.eq.${session.user.id}`)
          .maybeSingle();

        if (teacherRow?.id) {
          teacherDbId = teacherRow.id;
        }
      }
      // Fallback: designated counselor teacher
      if (!teacherDbId) {
        const { data: defaultCounselor } = await supabase
          .from("teachers")
          .select("id")
          .or("teacher_type.eq.counselor,specialization.eq.guru_bk")
          .limit(1)
          .maybeSingle();

        if (defaultCounselor?.id) {
          teacherDbId = defaultCounselor.id;
        }
      }
      if (!teacherDbId) {
        const { data: anyTeacher } = await supabase
          .from("teachers")
          .select("id")
          .limit(1)
          .maybeSingle();
        if (anyTeacher?.id) {
          teacherDbId = anyTeacher.id;
        }
      }

      if (!teacherDbId) {
        return {
          success: false,
          message: "Akses ditolak: Data pengajar Guru BK tidak ditemukan dalam sistem.",
        };
      }

      // STRICT SCHEMA ALIGNMENT:
      // Allowed columns in public.counseling_records:
      // - student_id
      // - counselor_id
      // - counseling_date
      // - counseling_type
      // - notes
      // - status
      const counselingPayload = {
        student_id: studentId,
        counselor_id: teacherDbId,
        counseling_date: sessionDate,
        counseling_type: counselingType,
        notes: combinedNotes,
        status: "completed",
      };

      const { data: inserted, error: insertError } = await supabase
        .from("counseling_records")
        .insert(counselingPayload)
        .select()
        .single();

      if (insertError) {
        console.error("Supabase counseling_records insert error:", insertError);
        return {
          success: false,
          message: `Gagal menyimpan catatan konseling: ${insertError.message}`,
        };
      }

      if (inserted) {
        newRecord.id = inserted.id;
        newRecord.counselorId = inserted.counselor_id;
      }
    } catch (err: any) {
      console.error("Supabase counseling persistence exception:", err);
      return {
        success: false,
        message: `Terjadi kesalahan saat menyimpan catatan konseling: ${err.message}`,
      };
    }
  }

  // 3. Fallback memory update (Dev mode)
  IN_MEMORY_COUNSELING_RECORDS.unshift(newRecord);

  try {
    revalidatePath("/guru/counseling");
    revalidatePath("/guru");
    revalidatePath("/admin/students");
    revalidatePath("/siswa");
  } catch {
    // Graceful no-op when executed outside active request lifecycle
  }

  return {
    success: true,
    message: `Sesi bimbingan konseling untuk ${studentProfile.studentName} berhasil dicatat.`,
    data: newRecord,
  };
}
