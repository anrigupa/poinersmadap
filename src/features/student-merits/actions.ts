"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import { getStudentsAction } from "@/features/students/actions";
import { calculateViolationLevel } from "@/features/student-dashboard/actions";
import {
  StudentMeritsDashboardData,
  StudentAchievementItem,
  PointReductionItem,
  MeritBalanceSummary,
  DisciplineStatusSummary,
  AchievementCategory,
} from "@/features/student-merits/types";
import {
  submitAchievementSchema,
  convertMeritsSchema,
} from "@/features/student-merits/schemas";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function formatIndonesianDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Makassar",
    }).format(d) + " WITA";
  } catch {
    return isoString;
  }
}

// In-memory store fallback for environments where Supabase migration hasn't run yet
let IN_MEMORY_STUDENT_MERITS: StudentAchievementItem[] = [
  {
    id: "merit-001",
    studentId: "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd", // Fikri
    achievementName: "Juara 1 Lomba Debat Bahasa Indonesia Tingkat Kabupaten",
    category: "Akademik",
    description: "Meraih Medali Emas pada kompetisi debat antar SMA/SMK se-Kabupaten Pangkep.",
    evidenceUrl: "https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800",
    meritPoints: 25,
    status: "approved",
    submissionDate: "2026-10-15T08:30:00.000Z",
    formattedDate: "15 Okt 2026, 16:30 WITA",
    verifiedByName: "Dra. Siti Rahmawati (Guru BK)",
    verifiedAt: "2026-10-16T09:00:00.000Z",
  },
  {
    id: "merit-002",
    studentId: "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd", // Fikri
    achievementName: "Petugas Pengibar Bendera Pusaka (Paskibra) Hari Kemerdekaan",
    category: "Paskibra",
    description: "Bertugas sebagai pengibar bendera utama pada upacara bendera 17 Agustus 2026.",
    evidenceUrl: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800",
    meritPoints: 15,
    status: "approved",
    submissionDate: "2026-08-20T10:00:00.000Z",
    formattedDate: "20 Agu 2026, 18:00 WITA",
    verifiedByName: "Ahmad Fauzi, S.Pd (Waka Kesiswaan)",
    verifiedAt: "2026-08-21T07:30:00.000Z",
  },
  {
    id: "merit-003",
    studentId: "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd", // Fikri
    achievementName: "Hafalan Al-Qur'an Juz 30 (Tahfidz Camp)",
    category: "Tahfidz",
    description: "Telah menyelesaikan tasmi' hafalan Juz 30 dengan predikat Mutqin.",
    evidenceUrl: null,
    meritPoints: 10,
    status: "approved",
    submissionDate: "2026-09-10T14:15:00.000Z",
    formattedDate: "10 Sep 2026, 22:15 WITA",
    verifiedByName: "Muhammad Badrun Barli, S.Pd",
    verifiedAt: "2026-09-11T08:00:00.000Z",
  },
  {
    id: "merit-004",
    studentId: "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd", // Fikri
    achievementName: "Juara 3 Turnamen Futsal Antar Sekolah Pelajar Sulsel",
    category: "Ekstrakurikuler",
    description: "Mewakili tim futsal SMAN 2 Pangkep meraih juara 3 tingkat provinsi.",
    evidenceUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
    meritPoints: 0,
    status: "pending",
    submissionDate: "2026-11-04T11:00:00.000Z",
    formattedDate: "04 Nov 2026, 19:00 WITA",
    verifiedByName: null,
    verifiedAt: null,
  },
  {
    id: "merit-005",
    studentId: "stu-2", // Aditya Pratama Putra
    achievementName: "Juara 2 Lomba Pidato Bahasa Inggris (English Speech Contest)",
    category: "Akademik",
    description: "Meraih juara 2 pidato bahasa Inggris tingkat SMA se-Sulsel di Universitas Negeri Makassar.",
    evidenceUrl: "https://images.unsplash.com/photo-1544531585-9847b68c8c86?w=800",
    meritPoints: 0,
    status: "pending",
    submissionDate: "2026-11-05T09:30:00.000Z",
    formattedDate: "05 Nov 2026, 17:30 WITA",
    verifiedByName: null,
    verifiedAt: null,
  },
  {
    id: "merit-006",
    studentId: "stu-1", // Muhammad Rizky Pratama
    achievementName: "Ketua Panitia Kemah Bakti Pramuka Penegak",
    category: "Ekstrakurikuler",
    description: "Memimpin pelaksanaan kemah bakti gabungan pramuka penegak kwartir cabang.",
    evidenceUrl: null,
    meritPoints: 15,
    status: "approved",
    submissionDate: "2026-09-28T08:00:00.000Z",
    formattedDate: "28 Sep 2026, 16:00 WITA",
    verifiedByName: "Muhammad Badrun Barli, S.Pd",
    verifiedAt: "2026-09-29T10:00:00.000Z",
  },
  {
    id: "merit-007",
    studentId: "stu-3", // Siti Nurhaliza
    achievementName: "Hafalan Al-Qur'an 3 Juz (Tasmi' Tahfidz)",
    category: "Tahfidz",
    description: "Tasmi' kelulusan tahfidz 3 juz (Juz 30, 29, 28) kategori mutqin.",
    evidenceUrl: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=800",
    meritPoints: 20,
    status: "approved",
    submissionDate: "2026-10-10T11:00:00.000Z",
    formattedDate: "10 Okt 2026, 19:00 WITA",
    verifiedByName: "Muhammad Badrun Barli, S.Pd",
    verifiedAt: "2026-10-11T08:30:00.000Z",
  },
  {
    id: "merit-008",
    studentId: "stu-2", // Aditya Pratama Putra
    achievementName: "Partisipasi Bakti Sosial Pemuda Peduli Lingkungan",
    category: "Sosial",
    description: "Kegiatan penanaman mangrove pesisir pantai bersama komunitas pemuda.",
    evidenceUrl: null,
    meritPoints: 0,
    status: "rejected",
    submissionDate: "2026-10-12T14:00:00.000Z",
    formattedDate: "12 Okt 2026, 22:00 WITA",
    verifiedByName: "Muhammad Badrun Barli, S.Pd",
    verifiedAt: "2026-10-13T09:00:00.000Z",
    rejectionReason: "Sertifikat tidak mencantumkan cap resmi penyelenggara dan surat tugas sekolah.",
  },
];

let IN_MEMORY_POINT_REDUCTIONS: PointReductionItem[] = [
  {
    id: "red-001",
    date: "2026-10-20T10:00:00.000Z",
    formattedDate: "20 Okt 2026, 18:00 WITA",
    violationOrReason: "Pemutihan Prestasi: Konversi Poin Juara 1 Debat Bahasa Indonesia",
    originalPoints: 20,
    reductionPoints: 10,
    remainingPoints: 10,
    approvedBy: "Dra. Siti Rahmawati (Guru BK)",
  },
];

/**
 * Internal helper: Verifies that a staff user is either an Administrator or a Guru BK (counselor).
 * Remediates HIGH-04: Prevents regular subject teachers (guru_mapel) from accessing BK merit verification.
 */
async function isAuthorizedCounselorOrAdmin(
  session: NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>
): Promise<boolean> {
  if (session.user.role === "admin") return true;
  if (session.user.role !== "guru") return false;

  if (
    session.user.teacherType === "counselor" ||
    session.user.specialization === "guru_bk"
  ) {
    return true;
  }

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();
      const { data: teacher } = await supabase
        .from("teachers")
        .select("teacher_type, specialization")
        .eq("profile_id", session.user.id)
        .maybeSingle();

      if (
        teacher &&
        (teacher.teacher_type === "counselor" || teacher.specialization === "guru_bk")
      ) {
        return true;
      }
    } catch {
      // Fallback check failed
    }
  }

  return false;
}

// ----------------------------------------------------------------------------
// 1. GET STUDENT MERITS DASHBOARD DATA
// ----------------------------------------------------------------------------
export async function getStudentMeritsData(
  overrideProfileId?: string,
  overrideNis?: string,
  overrideStudentId?: string
): Promise<StudentMeritsDashboardData> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Akses ditolak: Anda harus login terlebih dahulu.");
  }

  const isStudent = session.user.role === "siswa";

  // Staff inspecting another student must be Admin or Guru BK
  if (!isStudent && (overrideProfileId || overrideNis || overrideStudentId)) {
    const allowed = await isAuthorizedCounselorOrAdmin(session);
    if (!allowed) {
      throw new Error("Akses ditolak: Hanya Guru BK atau Administrator yang berwenang mengakses data prestasi siswa lain.");
    }
  }

  // Strict personal isolation (HIGH-02): Students can NEVER override target IDs
  const currentUserId = isStudent ? session.user.id : (overrideProfileId || session.user.id);
  const currentNis = isStudent ? session.user.nis : (overrideNis || session.user.nis);
  const effectiveOverrideStudentId = isStudent ? undefined : overrideStudentId;

  // 1. Resolve Student Record
  const studentsRes = await getStudentsAction({ pageSize: 200 });
  let student = studentsRes.items.find((s) => {
    if (effectiveOverrideStudentId) {
      return s.id === effectiveOverrideStudentId;
    }
    return s.profileId === currentUserId || (currentNis && s.nis === currentNis);
  });

  // Prevent first-row fallback leakage (HIGH-02): Never fall back to studentsRes.items[0] for students in production
  if (!student) {
    if (isStudent && process.env.NODE_ENV !== "development") {
      throw new Error("Data profil siswa tidak ditemukan untuk akun ini.");
    }
    if (!isStudent || process.env.NODE_ENV === "development") {
      student = studentsRes.items[0];
    }
  }

  const studentId = student?.id || session.user.id;

  // 2. Fetch Achievements
  let achievements: StudentAchievementItem[] = [];

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data, error } = await supabase
        .from("student_merits")
        .select(`
          id,
          student_id,
          achievement_name,
          category,
          description,
          evidence_url,
          merit_points,
          status,
          submission_date,
          verified_at,
          rejection_reason,
          profiles:verified_by (full_name)
        `)
        .eq("student_id", studentId)
        .order("submission_date", { ascending: false });

      if (!error && data && data.length > 0) {
        achievements = data.map((d: any) => {
          const profile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
          return {
            id: d.id,
            studentId: d.student_id,
            achievementName: d.achievement_name,
            category: d.category as AchievementCategory,
            description: d.description || "",
            evidenceUrl: d.evidence_url,
            meritPoints: d.merit_points || 0,
            status: d.status,
            submissionDate: d.submission_date,
            formattedDate: formatIndonesianDate(d.submission_date),
            verifiedByName: profile?.full_name || null,
            verifiedAt: d.verified_at,
            rejectionReason: d.rejection_reason,
          };
        });
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback to in-memory store if DB query returned nothing (Development mode only)
  if (achievements.length === 0 && process.env.NODE_ENV === "development") {
    achievements = IN_MEMORY_STUDENT_MERITS.filter(
      (m) => m.studentId === studentId || studentId.includes("27e6ca1e")
    );
    if (achievements.length === 0 && IN_MEMORY_STUDENT_MERITS.length > 0) {
      // Re-map demo data for this student
      achievements = IN_MEMORY_STUDENT_MERITS.map((m) => ({
        ...m,
        studentId,
      }));
    }
  }

  // 3. Fetch Reductions / Pemutihan Audit Log
  let reductions: PointReductionItem[] = [];

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // Authoritative Ledger: Query strictly from merit_deductions
      const { data: mData, error: mErr } = await supabase
        .from("merit_deductions")
        .select("*")
        .eq("student_id", studentId)
        .order("deduction_date", { ascending: false });

      if (!mErr && mData && mData.length > 0) {
        reductions = mData.map((m: any) => ({
          id: m.id,
          date: m.deduction_date,
          formattedDate: formatIndonesianDate(m.deduction_date),
          violationOrReason: m.deduction_reason,
          originalPoints: m.original_points || 0,
          reductionPoints: m.reduction_points || 0,
          remainingPoints: m.remaining_points || 0,
          approvedBy: m.approved_by || "Guru BK / Admin",
        }));
      }
    } catch {
      // Fallback below
    }
  }

  // Fallback reductions if empty (Development mode only)
  if (reductions.length === 0 && process.env.NODE_ENV === "development") {
    reductions = [...IN_MEMORY_POINT_REDUCTIONS];
  }

  // 4. Calculate Merit Balances (Section 2)
  const totalApprovedMerits = achievements
    .filter((a) => a.status === "approved")
    .reduce((sum, a) => sum + (a.meritPoints || 0), 0);

  // Total merit points converted into reductions
  const usedMeritPoints = reductions.reduce(
    (sum, r) => sum + r.reductionPoints,
    0
  );

  const availableMeritPoints = Math.max(0, totalApprovedMerits - usedMeritPoints);

  const meritBalance: MeritBalanceSummary = {
    totalMeritPoints: totalApprovedMerits,
    usedMeritPoints: usedMeritPoints,
    availableMeritPoints: availableMeritPoints,
  };

  // 5. Calculate Discipline Status (Section 4)
  // Total Violation Points: Sum of all recorded violations in DB (NEVER deleted)
  let totalRawViolationPoints = student?.totalViolationPoints ?? 20;

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: vData } = await supabase
        .from("student_violations")
        .select("points")
        .eq("student_id", studentId);

      if (vData && vData.length > 0) {
        const sumPoints = vData.reduce((acc, v) => acc + (Number(v.points) || 0), 0);
        if (sumPoints > 0) {
          totalRawViolationPoints = sumPoints;
        }
      }
    } catch {
      // use student.totalViolationPoints
    }
  }

  // Total Reduction Points: Sum of all reduction points
  const totalReductionPoints = usedMeritPoints;

  // Formula: Effective Discipline Points = Total Violation Points - Total Reduction Points
  // Constraint: Effective Points cannot be negative
  const effectiveDisciplinePoints = Math.max(
    0,
    totalRawViolationPoints - totalReductionPoints
  );

  const levelInfo = await calculateViolationLevel(effectiveDisciplinePoints);

  const disciplineStatus: DisciplineStatusSummary = {
    totalViolationPoints: totalRawViolationPoints,
    totalReductionPoints: totalReductionPoints,
    effectiveDisciplinePoints: effectiveDisciplinePoints,
    statusLevel: levelInfo.level,
    levelColor: levelInfo.levelColor,
    levelDescription: levelInfo.levelDescription,
    sanctionAuthority: levelInfo.sanctionAuthority,
    progressBarPercent: levelInfo.progressBarPercent,
  };

  return {
    student: {
      id: studentId,
      fullName: student?.fullName || "Fikri",
      nis: student?.nis || "10595",
      nisn: student?.nisn || "0064604750",
      className: student?.className || "X MIPA 1",
    },
    achievements,
    meritBalance,
    reductions,
    disciplineStatus,
  };
}

// ----------------------------------------------------------------------------
// 2. SUBMIT ACHIEVEMENT ACTION (SECTION 5)
// ----------------------------------------------------------------------------
export async function submitAchievementAction(formData: unknown) {
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: "Akses ditolak: Anda harus login untuk mengajukan prestasi.",
    };
  }

  const parsed = submitAchievementSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data pengajuan prestasi tidak valid.",
    };
  }

  const { achievementName, category, description, evidenceUrl } = parsed.data;

  // Resolve student id
  const studentsRes = await getStudentsAction({ pageSize: 200 });
  const student = studentsRes.items.find(
    (s) => s.profileId === session.user.id || (session.user.nis && s.nis === session.user.nis)
  );

  if (!student && process.env.NODE_ENV !== "development") {
    return {
      success: false,
      message: "Data profil siswa tidak ditemukan untuk akun ini.",
    };
  }

  const studentId = student?.id || "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd";
  const now = new Date().toISOString();

  const newAchievement: StudentAchievementItem = {
    id: `merit-${Date.now()}`,
    studentId,
    achievementName,
    category: category as AchievementCategory,
    description,
    evidenceUrl: evidenceUrl || null,
    meritPoints: 0, // Assigned upon approval by Admin / Guru BK
    status: "pending",
    submissionDate: now,
    formattedDate: formatIndonesianDate(now),
    verifiedByName: null,
    verifiedAt: null,
    rejectionReason: null,
  };

  // Attempt database persistence
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: inserted, error } = await supabase
        .from("student_merits")
        .insert({
          student_id: studentId,
          achievement_name: achievementName,
          category,
          description,
          evidence_url: evidenceUrl || null,
          merit_points: 0,
          status: "pending",
          submission_date: now,
        })
        .select()
        .single();

      if (!error && inserted) {
        newAchievement.id = inserted.id;
      }
    } catch (err: any) {
      console.warn("Supabase student_merits insert failed, persisting in-memory:", err.message);
    }
  }

  // Also push to in-memory store so it shows immediately across session
  IN_MEMORY_STUDENT_MERITS.unshift(newAchievement);

  revalidatePath("/siswa/merits");
  revalidatePath("/siswa");
  revalidatePath("/admin/students");

  return {
    success: true,
    message: "Pengajuan prestasi berhasil dikirim! Menunggu verifikasi dari Admin atau Guru BK.",
    data: newAchievement,
  };
}

// ----------------------------------------------------------------------------
// 3. APPLY MERIT REDUCTION ACTION (SEC-IDOR-03 HARDENED: GURU BK / ADMIN ONLY)
// ----------------------------------------------------------------------------
export async function applyMeritReductionAction(formData: unknown) {
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: "Akses ditolak: Anda harus login terlebih dahulu.",
    };
  }

  // SEC-IDOR-03 Hardening: Restrict execution strictly to Counselor (Guru BK) and Admin.
  // Self-service pemutihan is not permitted; reductions must be conducted through Guru BK counseling.
  const isAuthorized = await isAuthorizedCounselorOrAdmin(session);
  if (!isAuthorized) {
    return {
      success: false,
      message:
        "Akses ditolak: Hanya Guru BK atau Administrator yang berwenang melakukan pemutihan poin siswa. Pengajuan pemutihan poin diproses melalui sesi bimbingan bersama Guru BK.",
    };
  }

  const parsed = convertMeritsSchema.safeParse(formData);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Data konversi tidak valid.",
    };
  }

  const { pointsToConvert, reason, studentId: requestedStudentId } = parsed.data;

  if (!requestedStudentId) {
    return {
      success: false,
      message: "ID siswa target wajib disertakan untuk memproses pemutihan poin.",
    };
  }

  const targetStudentId = requestedStudentId;

  // Fetch current merits data
  const currentData = await getStudentMeritsData(
    undefined,
    undefined,
    targetStudentId
  );
  const { availableMeritPoints } = currentData.meritBalance;
  const { effectiveDisciplinePoints, totalViolationPoints } = currentData.disciplineStatus;

  if (availableMeritPoints <= 0) {
    return {
      success: false,
      message: `Siswa (${currentData.student.fullName}) tidak memiliki Saldo Poin Prestasi yang tersedia untuk pemutihan.`,
    };
  }

  if (pointsToConvert > availableMeritPoints) {
    return {
      success: false,
      message: `Poin yang dikonversi (${pointsToConvert}) melebihi saldo prestasi tersedia (${availableMeritPoints}).`,
    };
  }

  if (effectiveDisciplinePoints <= 0) {
    return {
      success: false,
      message: `Poin pelanggaran efektif siswa (${currentData.student.fullName}) sudah 0 (Status Disiplin Sangat Baik). Tidak diperlukan pemutihan.`,
    };
  }

  // Ensure effective points cannot be negative
  const actualReduction = Math.min(pointsToConvert, effectiveDisciplinePoints);
  const originalPoints = effectiveDisciplinePoints;
  const remainingPoints = Math.max(0, originalPoints - actualReduction);
  const now = new Date().toISOString();

  const approverName = session.user.fullName
    ? (session.user.role === "admin"
        ? `Administrator (${session.user.fullName})`
        : `Guru BK: ${session.user.fullName}`)
    : "Guru BK";

  const reductionRecord: PointReductionItem = {
    id: `red-${Date.now()}`,
    date: now,
    formattedDate: formatIndonesianDate(now),
    violationOrReason: `Pemutihan Prestasi: ${reason}`,
    originalPoints,
    reductionPoints: actualReduction,
    remainingPoints,
    approvedBy: approverName,
  };

  // Persist to Supabase
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // 1. Update students table total_violation_points & total_merit_points
      // NOTE: We NEVER delete records from student_violations!
      await supabase
        .from("students")
        .update({
          total_violation_points: remainingPoints,
          updated_at: now,
        })
        .eq("id", currentData.student.id);

      // 2. Insert into merit_deductions or counseling_records
      await supabase.from("merit_deductions").insert({
        student_id: currentData.student.id,
        deduction_reason: `Pemutihan Prestasi: ${reason}`,
        original_points: originalPoints,
        reduction_points: actualReduction,
        remaining_points: remainingPoints,
        approved_by: approverName,
        deduction_date: now,
      });
    } catch (err: any) {
      console.warn("Supabase merit reduction persistence fallback:", err.message);
    }
  }

  // Save to in-memory audit log
  IN_MEMORY_POINT_REDUCTIONS.unshift(reductionRecord);

  revalidatePath("/siswa/merits");
  revalidatePath("/siswa");
  revalidatePath("/admin/students");
  revalidatePath("/guru");
  revalidatePath("/guru/counseling");

  return {
    success: true,
    message: `Berhasil mengonversi ${actualReduction} poin prestasi menjadi pemutihan poin pelanggaran untuk ${currentData.student.fullName}! Poin pelanggaran efektif siswa kini ${remainingPoints} poin.`,
    data: reductionRecord,
  };
}

// ----------------------------------------------------------------------------
// 4. VERIFY / APPROVE ACHIEVEMENT ACTION (ADMIN / GURU BK ONLY)
// ----------------------------------------------------------------------------
export async function verifyAchievementAction(
  achievementId: string,
  status: "approved" | "rejected",
  meritPoints: number = 10,
  rejectionReason?: string
) {
  const session = await getCurrentSession();
  if (!session || !(await isAuthorizedCounselorOrAdmin(session))) {
    return {
      success: false,
      message: "Akses ditolak: Hanya Admin atau Guru BK yang dapat memverifikasi prestasi.",
    };
  }

  const clampedMeritPoints = Math.min(100, Math.max(0, Math.floor(Number(meritPoints) || 0)));
  const now = new Date().toISOString();
  const verifierName = session.user.fullName || (session.user.role === "admin" ? "Administrator" : "Guru BK");

  // In-memory update
  const index = IN_MEMORY_STUDENT_MERITS.findIndex((m) => m.id === achievementId);
  if (index !== -1) {
    IN_MEMORY_STUDENT_MERITS[index] = {
      ...IN_MEMORY_STUDENT_MERITS[index],
      status,
      meritPoints: status === "approved" ? clampedMeritPoints : 0,
      verifiedByName: verifierName,
      verifiedAt: now,
      rejectionReason: status === "rejected" ? (rejectionReason || "Tidak memenuhi kriteria bukti") : null,
    };
  }

  // Supabase update
  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      await supabase
        .from("student_merits")
        .update({
          status,
          merit_points: status === "approved" ? clampedMeritPoints : 0,
          verified_by: session.user.id,
          verified_at: now,
          rejection_reason: status === "rejected" ? rejectionReason : null,
          updated_at: now,
        })
        .eq("id", achievementId);
    } catch (err: any) {
      console.warn("Supabase student_merits update failed:", err.message);
    }
  }

  revalidatePath("/siswa/merits");
  revalidatePath("/siswa");
  revalidatePath("/admin/students");
  revalidatePath("/guru/counseling");

  return {
    success: true,
    message: `Status prestasi berhasil diperbarui menjadi ${status === "approved" ? "Disetujui" : "Ditolak"}.`,
  };
}

// ----------------------------------------------------------------------------
// 5. GET ALL ACHIEVEMENTS FOR COUNSELOR (SECTION 2)
// ----------------------------------------------------------------------------
export interface CounselorAchievementItem extends StudentAchievementItem {
  studentName: string;
  studentNis: string;
  className: string;
}

export async function getAllStudentAchievementsAction(): Promise<CounselorAchievementItem[]> {
  const session = await getCurrentSession();
  if (!session || !(await isAuthorizedCounselorOrAdmin(session))) {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Akses ditolak: Hanya Guru BK atau Administrator.");
    }
  }

  const studentsRes = await getStudentsAction({ pageSize: 100 });
  const studentMap = new Map(studentsRes.items.map((s) => [s.id, s]));

  let results: CounselorAchievementItem[] = [];

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data, error } = await supabase
        .from("student_merits")
        .select(`
          id,
          student_id,
          achievement_name,
          category,
          description,
          evidence_url,
          merit_points,
          status,
          submission_date,
          verified_at,
          rejection_reason,
          profiles:verified_by (full_name),
          students:student_id (
            id,
            nis,
            class_name,
            profiles:profile_id (full_name)
          )
        `)
        .order("submission_date", { ascending: false });

      if (!error && data && data.length > 0) {
        results = data.map((d: any) => {
          const vProfile = Array.isArray(d.profiles) ? d.profiles[0] : d.profiles;
          const sObj = d.students || {};
          const sProf = Array.isArray(sObj.profiles) ? sObj.profiles[0] : sObj.profiles;
          const sFallback = studentMap.get(d.student_id);

          return {
            id: d.id,
            studentId: d.student_id,
            studentName: sProf?.full_name || sFallback?.fullName || "Siswa",
            studentNis: sObj.nis || sFallback?.nis || "-",
            className: sObj.class_name || sFallback?.className || "-",
            achievementName: d.achievement_name,
            category: d.category as AchievementCategory,
            description: d.description || "",
            evidenceUrl: d.evidence_url,
            meritPoints: d.merit_points || 0,
            status: d.status,
            submissionDate: d.submission_date,
            formattedDate: formatIndonesianDate(d.submission_date),
            verifiedByName: vProfile?.full_name || null,
            verifiedAt: d.verified_at,
            rejectionReason: d.rejection_reason,
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch all achievements failed:", err);
    }
  }

  if (results.length === 0 && process.env.NODE_ENV === "development") {
    // Map in-memory items (Development mode only)
    results = IN_MEMORY_STUDENT_MERITS.map((item) => {
      const s = studentMap.get(item.studentId);
      const isFikri = item.studentId.includes("27e6ca1e");
      return {
        ...item,
        studentName: s?.fullName || (isFikri ? "Fikri" : "Siswa"),
        studentNis: s?.nis || (isFikri ? "10595" : "-"),
        className: s?.className || (isFikri ? "X MIPA 1" : "-"),
      };
    });
  }

  return results;
}

// ----------------------------------------------------------------------------
// 6. GET ALL MERIT DEDUCTIONS FOR COUNSELOR (SECTION 4)
// ----------------------------------------------------------------------------
export interface CounselorReductionItem extends PointReductionItem {
  studentName: string;
  studentNis: string;
  className: string;
}

export async function getAllMeritDeductionsAction(): Promise<CounselorReductionItem[]> {
  const session = await getCurrentSession();
  if (!session || !(await isAuthorizedCounselorOrAdmin(session))) {
    if (process.env.NODE_ENV !== "development") {
      throw new Error("Akses ditolak: Hanya Guru BK atau Administrator.");
    }
  }

  const studentsRes = await getStudentsAction({ pageSize: 100 });
  const studentMap = new Map(studentsRes.items.map((s) => [s.id, s]));

  let results: CounselorReductionItem[] = [];

  if (isSupabaseLive()) {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      // Query strictly from public.merit_deductions (Authoritative Pemutihan Ledger)
      const { data: mData, error: mErr } = await supabase
        .from("merit_deductions")
        .select(`
          id,
          student_id,
          deduction_date,
          deduction_reason,
          original_points,
          reduction_points,
          remaining_points,
          approved_by,
          students:student_id (
            id,
            nis,
            class_name,
            profiles:profile_id (full_name)
          )
        `)
        .order("deduction_date", { ascending: false });

      if (!mErr && mData && mData.length > 0) {
        results = mData.map((m: any) => {
          const sObj = m.students || {};
          const sProf = Array.isArray(sObj.profiles) ? sObj.profiles[0] : sObj.profiles;
          const sFallback = studentMap.get(m.student_id);

          return {
            id: m.id,
            studentId: m.student_id,
            studentName: sProf?.full_name || sFallback?.fullName || "Siswa",
            studentNis: sObj.nis || sFallback?.nis || "-",
            className: sObj.class_name || sFallback?.className || "-",
            date: m.deduction_date,
            formattedDate: formatIndonesianDate(m.deduction_date),
            violationOrReason: m.deduction_reason,
            originalPoints: m.original_points || 0,
            reductionPoints: m.reduction_points || 0,
            remainingPoints: m.remaining_points || 0,
            approvedBy: m.approved_by || "Guru BK / Admin",
          };
        });
      }
    } catch (err) {
      console.warn("Supabase fetch all reductions failed:", err);
    }
  }

  if (results.length === 0 && process.env.NODE_ENV === "development") {
    results = IN_MEMORY_POINT_REDUCTIONS.map((item) => {
      const s = studentMap.get("27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd");
      return {
        ...item,
        studentId: "27e6ca1e-4a4e-4c61-84d6-72683c3ec7dd",
        studentName: s?.fullName || "Fikri",
        studentNis: s?.nis || "10595",
        className: s?.className || "X MIPA 1",
      };
    });
  }

  return results;
}
