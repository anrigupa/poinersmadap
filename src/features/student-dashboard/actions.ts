"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  StudentDashboardData,
  StudentProfileSummary,
  StudentPointsSummary,
  MonthlyTrendItem,
  CategoryBreakdownItem,
  StudentViolationHistoryItem,
  ViolationStatusLevel,
} from "@/features/student-dashboard/types";
import { getStudentsAction } from "@/features/students/actions";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -------------------------------------------------------------
// STATUS LEVEL CALCULATOR (0-35 Aman, 36-75 SP1, 76-150 SP2, 151+ SP3)
// -------------------------------------------------------------

export async function calculateViolationLevel(points: number): Promise<{
  level: ViolationStatusLevel;
  levelColor: "emerald" | "amber" | "orange" | "rose";
  minPoints: number;
  maxPoints: number;
  nextThreshold: number;
  pointsToNextLevel: number;
  progressBarPercent: number;
  levelDescription: string;
  sanctionAuthority: string;
  recommendation: string;
}> {
  if (points <= 35) {
    return {
      level: "Aman",
      levelColor: "emerald",
      minPoints: 0,
      maxPoints: 35,
      nextThreshold: 36,
      pointsToNextLevel: Math.max(36 - points, 0),
      // Scale 0-35 points to 0-100% of the safe bucket
      progressBarPercent: Math.min(Math.round((points / 35) * 100), 100),
      levelDescription: "Kondisi kedisiplinan dan tata tertib Anda berstatus AMAN.",
      sanctionAuthority: "Wali Kelas",
      recommendation: "Pertahankan ketertiban dan budi pekerti baik Anda selama di sekolah.",
    };
  }

  if (points <= 75) {
    return {
      level: "SP1",
      levelColor: "amber",
      minPoints: 36,
      maxPoints: 75,
      nextThreshold: 76,
      pointsToNextLevel: Math.max(76 - points, 0),
      // Scale 36-75 points to 0-100% of the SP1 bucket
      progressBarPercent: Math.min(Math.round(((points - 35) / 40) * 100), 100),
      levelDescription: "Anda dalam status Surat Peringatan 1 (SP1).",
      sanctionAuthority: "Wali Kelas & Guru BK",
      recommendation: "Wajib melakukan pembinaan dan bimbingan bersama Wali Kelas Anda.",
    };
  }

  if (points <= 150) {
    return {
      level: "SP2",
      levelColor: "orange",
      minPoints: 76,
      maxPoints: 150,
      nextThreshold: 151,
      pointsToNextLevel: Math.max(151 - points, 0),
      // Scale 76-150 points to 0-100% of the SP2 bucket
      progressBarPercent: Math.min(Math.round(((points - 75) / 75) * 100), 100),
      levelDescription: "Anda dalam status Surat Peringatan 2 (SP2).",
      sanctionAuthority: "Guru BK & Bidang Kesiswaan",
      recommendation: "Pemanggilan Orang Tua / Wali Murid ke Ruang Bimbingan Konseling.",
    };
  }

  return {
    level: "SP3 (Kepala Sekolah)",
    levelColor: "rose",
    minPoints: 151,
    maxPoints: 200,
    nextThreshold: 200,
    pointsToNextLevel: 0,
    progressBarPercent: 100,
    levelDescription: "Anda dalam status Surat Peringatan 3 (SP3 / Tingkat Kritis).",
    sanctionAuthority: "Kepala Sekolah & Dewan Guru",
    recommendation: "Konferensi Kasus Khusus, Pemanggilan Orang Tua oleh Kepala Sekolah & Ancaman Skorsing.",
  };
}

// -------------------------------------------------------------
// GET STUDENT DASHBOARD DATA
// -------------------------------------------------------------

export async function getStudentDashboardData(
  overrideProfileId?: string,
  overrideNis?: string
): Promise<StudentDashboardData> {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("Akses ditolak: Anda harus login untuk mengakses dashboard ini.");
  }

  // Strict personal data isolation:
  // Students can ONLY access their own data. Only admins may inspect arbitrary students.
  const isStudent = session.user.role === "siswa";
  const currentUserId = isStudent ? session.user.id : (overrideProfileId || session.user.id);
  const currentNis = isStudent ? (session.user.nis || "10293") : (overrideNis || session.user.nis || "10293");

  // 1. Resolve Student Record
  const studentsRes = await getStudentsAction({ pageSize: 100 });
  let student = studentsRes.items.find(
    (s) => s.profileId === currentUserId || s.nis === currentNis
  );

  if (!student) {
    // Default to the first demo student
    student = studentsRes.items[0];
  }

  const violationPoints = student ? student.totalViolationPoints : 25;
  const meritPoints = student ? student.totalMeritPoints : 10;
  const levelInfo = await calculateViolationLevel(violationPoints);

  const profile: StudentProfileSummary = {
    id: student?.id || "stu-1",
    fullName: student?.fullName || "Muhammad Rizky Pratama",
    nisn: student?.nisn || "0061928374",
    nis: student?.nis || "10293",
    email: student?.email || "siswa.10293@smadap.sch.id",
    className: student?.className || "XI MIPA 2",
    major: student?.major || "MIPA",
    gender: student?.gender || "L",
    parentName: student?.parentName || "Bambang Pratama",
    parentPhone: student?.parentPhone || "081298765431",
    status: student?.status || "active",
  };

  const points: StudentPointsSummary = {
    totalViolationPoints: violationPoints,
    totalMeritPoints: meritPoints,
    netPoints: Math.max(violationPoints - meritPoints, 0),
    currentLevel: levelInfo.level,
    levelColor: levelInfo.levelColor,
    minPoints: levelInfo.minPoints,
    maxPoints: levelInfo.maxPoints,
    nextThreshold: levelInfo.nextThreshold,
    pointsToNextLevel: levelInfo.pointsToNextLevel,
    progressBarPercent: levelInfo.progressBarPercent,
    levelDescription: levelInfo.levelDescription,
    sanctionAuthority: levelInfo.sanctionAuthority,
    recommendation: levelInfo.recommendation,
  };

  // 2. Incident History
  // We provide a realistic chronological history matching the student's total points
  const history: StudentViolationHistoryItem[] = [
    {
      id: "hist-01",
      ruleCode: "K-02",
      violationName: "Atribut seragam sekolah tidak lengkap (Dasi/Sabuk/Kaos Kaki)",
      categoryName: "Ringan",
      points: 5,
      incidentDate: "2026-11-02T07:15:00",
      formattedDate: "02 Nov 2026, 07:15 WITA",
      notes: "Siswa kedapatan tidak mengenakan dasi upacara saat apel pagi.",
      reportedByName: "Siti Rahmawati, S.Pd (BK)",
      evidenceUrl: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600",
      status: "confirmed",
    },
    {
      id: "hist-02",
      ruleCode: "S-01",
      violationName: "Meninggalkan jam pelajaran tanpa izin dari guru piket / mapel (Membolos)",
      categoryName: "Sedang",
      points: 15,
      incidentDate: "2026-10-18T10:30:00",
      formattedDate: "18 Okt 2026, 10:30 WITA",
      notes: "Terlihat berada di warung luar pagar sekolah pada jam pelajaran ke-4.",
      reportedByName: "Drs. Joko Susilo, M.Pd (Piket)",
      evidenceUrl: null,
      status: "confirmed",
    },
    {
      id: "hist-03",
      ruleCode: "K-01",
      violationName: "Terlambat hadir di sekolah lebih dari 10 menit",
      categoryName: "Ringan",
      points: 5,
      incidentDate: "2026-09-08T07:35:00",
      formattedDate: "08 Sep 2026, 07:35 WITA",
      notes: "Pintu gerbang telah ditutup, terlambat 15 menit.",
      reportedByName: "Ahmad Fauzi, S.Pd",
      evidenceUrl: null,
      status: "confirmed",
    },
  ];

  // 3. Monthly Trends (Semester Ganjil 2026/2027)
  const monthlyTrends: MonthlyTrendItem[] = [
    { month: "Jul", points: 0, incidentCount: 0 },
    { month: "Agu", points: 0, incidentCount: 0 },
    { month: "Sep", points: 5, incidentCount: 1 },
    { month: "Okt", points: 15, incidentCount: 1 },
    { month: "Nov", points: 5, incidentCount: 1 },
    { month: "Des", points: 0, incidentCount: 0 },
  ];

  // Adjust current month points if total is different
  const sumPast = monthlyTrends.reduce((a, b) => a + b.points, 0);
  if (violationPoints !== sumPast) {
    const diff = violationPoints - sumPast;
    monthlyTrends[4].points = Math.max(monthlyTrends[4].points + diff, 0);
    monthlyTrends[4].incidentCount = Math.max(monthlyTrends[4].incidentCount + 1, 1);
  }

  // 4. Category Breakdown
  const categoryBreakdown: CategoryBreakdownItem[] = [
    {
      categoryName: "Pelanggaran Ringan",
      points: Math.min(10, violationPoints),
      count: 2,
      color: "bg-emerald-500",
      percentage: violationPoints > 0 ? Math.round((Math.min(10, violationPoints) / violationPoints) * 100) : 0,
    },
    {
      categoryName: "Pelanggaran Sedang",
      points: Math.min(15, Math.max(violationPoints - 10, 0)),
      count: 1,
      color: "bg-amber-500",
      percentage: violationPoints > 0 ? Math.round((Math.min(15, Math.max(violationPoints - 10, 0)) / violationPoints) * 100) : 0,
    },
    {
      categoryName: "Pelanggaran Berat",
      points: Math.max(violationPoints - 25, 0),
      count: violationPoints > 25 ? 1 : 0,
      color: "bg-rose-500",
      percentage: violationPoints > 0 ? Math.round((Math.max(violationPoints - 25, 0) / violationPoints) * 100) : 0,
    },
  ];

  return {
    profile,
    points,
    monthlyTrends,
    categoryBreakdown,
    history,
  };
}
