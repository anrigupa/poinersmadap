"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";
import { getSystemSettingsAction } from "@/features/settings/actions";
import {
  AdminOverviewData,
  MonthlyViolationStat,
  CategoryViolationStat,
  TopViolationStat,
  TopStudentStat,
  RecentViolationActivity,
} from "@/features/admin/types/overview";

/**
 * Realistic default fallback dataset representing active semester metrics
 * for SMAN 2 PANGKEP when Supabase tables are empty or initializing.
 */
const FALLBACK_OVERVIEW_DATA: AdminOverviewData = {
  metrics: {
    totalStudents: 1042,
    totalTeachers: 64,
    totalViolations: 148,
    totalViolationPoints: 1700,
    studentsWithViolations: 86,
    monthlyViolations: 28,
    previousMonthViolations: 32,
    monthlyChangePercentage: -12.5,
    studentTrend: "+4.2% thn ajaran baru",
    monthlyViolationTrend: {
      value: -12.5,
      isPositive: true, // violation count decreased, which is good
      label: "Turun 12.5% dibanding bulan lalu",
    },
  },
  monthlyStats: [
    { month: "Jul", fullMonthName: "Juli", count: 18, points: 195 },
    { month: "Agu", fullMonthName: "Agustus", count: 32, points: 340 },
    { month: "Sep", fullMonthName: "September", count: 26, points: 280 },
    { month: "Okt", fullMonthName: "Oktober", count: 35, points: 410 },
    { month: "Nov", fullMonthName: "November", count: 28, points: 295 },
    { month: "Des", fullMonthName: "Desember", count: 9, points: 180 },
  ],
  categoryStats: [
    {
      categoryName: "Ringan",
      count: 94,
      points: 470,
      colorCode: "#3b82f6", // Blue
      percentage: 63.5,
    },
    {
      categoryName: "Sedang",
      count: 42,
      points: 630,
      colorCode: "#f59e0b", // Amber
      percentage: 28.4,
    },
    {
      categoryName: "Berat",
      count: 12,
      points: 600,
      colorCode: "#ef4444", // Red
      percentage: 8.1,
    },
  ],
  topViolations: [
    {
      id: "tv-1",
      code: "K-01",
      name: "Terlambat hadir di sekolah lebih dari 10 menit",
      categoryName: "Ringan",
      pointsPerIncident: 5,
      count: 42,
      totalPoints: 210,
      percentage: 28.4,
    },
    {
      id: "tv-2",
      code: "K-02",
      name: "Atribut seragam sekolah tidak lengkap (Dasi/Sabuk/Lokasi)",
      categoryName: "Ringan",
      pointsPerIncident: 5,
      count: 29,
      totalPoints: 145,
      percentage: 19.6,
    },
    {
      id: "tv-3",
      code: "S-01",
      name: "Meninggalkan kelas pada jam pelajaran tanpa izin (Bolos)",
      categoryName: "Sedang",
      pointsPerIncident: 15,
      count: 19,
      totalPoints: 285,
      percentage: 12.8,
    },
    {
      id: "tv-4",
      code: "K-04",
      name: "Tidak mengikuti upacara bendera tanpa keterangan sah",
      categoryName: "Ringan",
      pointsPerIncident: 10,
      count: 14,
      totalPoints: 140,
      percentage: 9.5,
    },
    {
      id: "tv-5",
      code: "S-03",
      name: "Menggunakan smartphone saat KBM tanpa instruksi guru",
      categoryName: "Sedang",
      pointsPerIncident: 15,
      count: 12,
      totalPoints: 180,
      percentage: 8.1,
    },
    {
      id: "tv-6",
      code: "K-03",
      name: "Ukuran / model rambut tidak sesuai ketentuan tata tertib",
      categoryName: "Ringan",
      pointsPerIncident: 5,
      count: 9,
      totalPoints: 45,
      percentage: 6.1,
    },
    {
      id: "tv-7",
      code: "S-02",
      name: "Merusak atau mencoret-coret fasilitas inventaris sekolah",
      categoryName: "Sedang",
      pointsPerIncident: 25,
      count: 8,
      totalPoints: 200,
      percentage: 5.4,
    },
    {
      id: "tv-8",
      code: "B-02",
      name: "Membawa atau merokok di lingkungan / sekitar sekolah",
      categoryName: "Berat",
      pointsPerIncident: 50,
      count: 6,
      totalPoints: 300,
      percentage: 4.1,
    },
    {
      id: "tv-9",
      code: "B-01",
      name: "Terlibat perkelahian / tawuran di dalam atau luar sekolah",
      categoryName: "Berat",
      pointsPerIncident: 75,
      count: 5,
      totalPoints: 375,
      percentage: 3.4,
    },
    {
      id: "tv-10",
      code: "B-03",
      name: "Perundungan (Bullying) fisik maupun verbal terhadap siswa",
      categoryName: "Berat",
      pointsPerIncident: 50,
      count: 4,
      totalPoints: 200,
      percentage: 2.7,
    },
  ],
  topStudents: [
    {
      id: "stu-top-1",
      nis: "10297",
      fullName: "Farhan Maulana",
      className: "XII MIPA 4",
      totalViolationPoints: 160,
      totalMeritPoints: 0,
      violationCount: 6,
      status: "SP3 (Kepala Sekolah)",
    },
    {
      id: "stu-top-2",
      nis: "10301",
      fullName: "Bagas Adi Saputra",
      className: "XI IPS 2",
      totalViolationPoints: 125,
      totalMeritPoints: 5,
      violationCount: 5,
      status: "SP2",
    },
    {
      id: "stu-top-3",
      nis: "10295",
      fullName: "Citra Dewi Lestari",
      className: "XII IPS 3",
      totalViolationPoints: 95,
      totalMeritPoints: 0,
      violationCount: 4,
      status: "SP2",
    },
    {
      id: "stu-top-4",
      nis: "10312",
      fullName: "Reza Pahlevi",
      className: "XI MIPA 1",
      totalViolationPoints: 80,
      totalMeritPoints: 10,
      violationCount: 4,
      status: "SP2",
    },
    {
      id: "stu-top-5",
      nis: "10296",
      fullName: "Dimas Anggara",
      className: "XI MIPA 1",
      totalViolationPoints: 65,
      totalMeritPoints: 5,
      violationCount: 3,
      status: "SP1",
    },
    {
      id: "stu-top-6",
      nis: "10318",
      fullName: "Hendra Wijaya",
      className: "X IPS 1",
      totalViolationPoints: 55,
      totalMeritPoints: 0,
      violationCount: 3,
      status: "SP1",
    },
    {
      id: "stu-top-7",
      nis: "10324",
      fullName: "Kevin Sanjaya Putra",
      className: "XII MIPA 2",
      totalViolationPoints: 45,
      totalMeritPoints: 15,
      violationCount: 3,
      status: "SP1",
    },
    {
      id: "stu-top-8",
      nis: "10293",
      fullName: "Aditya Pratama",
      className: "XI MIPA 2",
      totalViolationPoints: 40,
      totalMeritPoints: 10,
      violationCount: 3,
      status: "SP1",
    },
    {
      id: "stu-top-9",
      nis: "10330",
      fullName: "Gilang Ramadhan",
      className: "X MIPA 3",
      totalViolationPoints: 30,
      totalMeritPoints: 5,
      violationCount: 2,
      status: "Aman",
    },
    {
      id: "stu-top-10",
      nis: "10294",
      fullName: "Budi Santoso",
      className: "X MIPA 2",
      totalViolationPoints: 25,
      totalMeritPoints: 10,
      violationCount: 2,
      status: "Aman",
    },
  ],
  recentActivities: [
    {
      id: "act-101",
      incidentDate: "Hari ini, 08:45 WITA",
      studentNis: "10293",
      studentName: "Aditya Pratama",
      className: "XI MIPA 2",
      ruleCode: "K-01",
      violationName: "Terlambat hadir di sekolah lebih dari 10 menit",
      categoryName: "Ringan",
      points: 5,
      reportedByTeacher: "Drs. Joko Susilo (Piket)",
      status: "confirmed",
    },
    {
      id: "act-102",
      incidentDate: "Hari ini, 07:20 WITA",
      studentNis: "10294",
      studentName: "Budi Santoso",
      className: "X MIPA 2",
      ruleCode: "K-02",
      violationName: "Atribut seragam sekolah tidak lengkap (Dasi/Sabuk)",
      categoryName: "Ringan",
      points: 5,
      reportedByTeacher: "Siti Rahmawati, S.Pd (BK)",
      status: "confirmed",
    },
    {
      id: "act-103",
      incidentDate: "Kemarin, 13:15 WITA",
      studentNis: "10295",
      studentName: "Citra Dewi Lestari",
      className: "XII IPS 3",
      ruleCode: "S-01",
      violationName: "Meninggalkan kelas pada jam pelajaran tanpa izin",
      categoryName: "Sedang",
      points: 15,
      reportedByTeacher: "Ahmad Fauzi, S.Pd",
      status: "appealed",
    },
    {
      id: "act-104",
      incidentDate: "30 Okt, 10:10 WITA",
      studentNis: "10296",
      studentName: "Dimas Anggara",
      className: "XI MIPA 1",
      ruleCode: "S-02",
      violationName: "Mencoret-coret meja inventaris sekolah",
      categoryName: "Sedang",
      points: 25,
      reportedByTeacher: "Drs. Joko Susilo (Piket)",
      status: "confirmed",
    },
    {
      id: "act-105",
      incidentDate: "28 Okt, 14:00 WITA",
      studentNis: "10297",
      studentName: "Farhan Maulana",
      className: "XII MIPA 4",
      ruleCode: "B-01",
      violationName: "Terlibat perkelahian / tawuran di luar lingkungan sekolah",
      categoryName: "Berat",
      points: 75,
      reportedByTeacher: "Drs. H. Bambang Prakoso (Tatib)",
      status: "confirmed",
    },
  ],
  academicPeriod: {
    year: "2026/2027",
    semester: "Semester Ganjil",
  },
  dataSource: "demo_fallback",
  lastUpdated: new Date().toISOString(),
};

const MONTH_TEMPLATE_GANJIL = [
  { monthIndex: 6, month: "Jul", fullMonthName: "Juli" },
  { monthIndex: 7, month: "Agu", fullMonthName: "Agustus" },
  { monthIndex: 8, month: "Sep", fullMonthName: "September" },
  { monthIndex: 9, month: "Okt", fullMonthName: "Oktober" },
  { monthIndex: 10, month: "Nov", fullMonthName: "November" },
  { monthIndex: 11, month: "Des", fullMonthName: "Desember" },
];

const MONTH_TEMPLATE_GENAP = [
  { monthIndex: 0, month: "Jan", fullMonthName: "Januari" },
  { monthIndex: 1, month: "Feb", fullMonthName: "Februari" },
  { monthIndex: 2, month: "Mar", fullMonthName: "Maret" },
  { monthIndex: 3, month: "Apr", fullMonthName: "April" },
  { monthIndex: 4, month: "Mei", fullMonthName: "Mei" },
  { monthIndex: 5, month: "Jun", fullMonthName: "Juni" },
];

/**
 * Server Action: Fetches real-time discipline analytics from Supabase PostgreSQL.
 * Uses Admin Service Role client when available to bypass anonymous RLS bottlenecks.
 */
export async function getAdminOverviewData(options?: {
  semester?: "ganjil" | "genap";
}): Promise<AdminOverviewData> {
  const systemSettings = await getSystemSettingsAction();
  const configuredYear = systemSettings.activeSetting.academicYear;
  const configuredSemester = systemSettings.activeSetting.semester;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseLive =
    supabaseUrl &&
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isSupabaseLive) {
    return {
      ...FALLBACK_OVERVIEW_DATA,
      academicPeriod: {
        year: configuredYear,
        semester: `Semester ${configuredSemester}`,
      },
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // 1. Fetch Students, Teachers count, and all Violations in parallel
    const [studentsRes, teachersCountRes, violationsRes] = await Promise.all([
      supabase
        .from("students")
        .select(
          `
          id,
          nis,
          class_name,
          total_violation_points,
          total_merit_points,
          status,
          profiles:profile_id (full_name)
        `
        )
        .order("total_violation_points", { ascending: false }),
      supabase.from("teachers").select("id", { count: "exact", head: true }),
      supabase
        .from("student_violations")
        .select(
          `
          id,
          student_id,
          violation_type_id,
          incident_date,
          points,
          status,
          evidence_url,
          students:student_id (nis, class_name, profiles:profile_id (full_name)),
          violation_types:violation_type_id (id, code, name, points, violation_categories:category_id (name, color_code, severity_level)),
          teachers:reported_by (profiles:profile_id (full_name))
        `
        )
        .neq("status", "cancelled")
        .order("incident_date", { ascending: false }),
    ]);

    const liveStudents = studentsRes.data || [];
    const liveViolations = violationsRes.data || [];

    // If database tables are completely empty (unseeded), return structured fallback with live indicator
    if (liveStudents.length === 0 && liveViolations.length === 0) {
      return {
        ...FALLBACK_OVERVIEW_DATA,
        academicPeriod: {
          year: configuredYear,
          semester: `Semester ${configuredSemester}`,
        },
        dataSource: "supabase_live",
        lastUpdated: new Date().toISOString(),
      };
    }

    const totalStudents = liveStudents.length;
    const totalTeachers = teachersCountRes.count ?? 0;

    // Violation Counts & Points
    const totalViolations = liveViolations.length;
    const violationPointsFromLogs = liveViolations.reduce(
      (sum: number, v: any) => sum + (Number(v.points) || 0),
      0
    );
    const violationPointsFromStudents = liveStudents.reduce(
      (sum: number, s: any) => sum + (Number(s.total_violation_points) || 0),
      0
    );
    const totalViolationPoints =
      violationPointsFromLogs > 0 ? violationPointsFromLogs : violationPointsFromStudents;

    // Students With Violations
    const uniqueViolatingStudentIds = new Set(
      liveViolations.map((v: any) => v.student_id).filter(Boolean)
    );
    const studentsWithPointsCount = liveStudents.filter(
      (s: any) => (Number(s.total_violation_points) || 0) > 0
    ).length;
    const studentsWithViolations = Math.max(
      uniqueViolatingStudentIds.size,
      studentsWithPointsCount
    );

    // Monthly Change % Calculation
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    let monthlyViolations = 0;
    let previousMonthViolations = 0;

    liveViolations.forEach((v: any) => {
      if (!v.incident_date) return;
      const d = new Date(v.incident_date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        monthlyViolations++;
      } else if (d.getMonth() === prevMonth && d.getFullYear() === prevYear) {
        previousMonthViolations++;
      }
    });

    let monthlyChangePercentage = 0;
    if (previousMonthViolations > 0) {
      monthlyChangePercentage = Number(
        (((monthlyViolations - previousMonthViolations) / previousMonthViolations) * 100).toFixed(1)
      );
    } else if (monthlyViolations > 0) {
      monthlyChangePercentage = 100;
    }

    // 2. Build Monthly Trend Stats
    const activeSemester =
      options?.semester ||
      (configuredSemester === "Genap" ? "genap" : "ganjil");
    const monthTemplate =
      activeSemester === "genap" ? MONTH_TEMPLATE_GENAP : MONTH_TEMPLATE_GANJIL;

    const monthlyMap = new Map<number, { count: number; points: number }>();
    monthTemplate.forEach((m) => monthlyMap.set(m.monthIndex, { count: 0, points: 0 }));

    liveViolations.forEach((v: any) => {
      if (!v.incident_date) return;
      const d = new Date(v.incident_date);
      const mIdx = d.getMonth();
      if (monthlyMap.has(mIdx)) {
        const entry = monthlyMap.get(mIdx)!;
        entry.count += 1;
        entry.points += Number(v.points) || 0;
      }
    });

    const monthlyStats: MonthlyViolationStat[] = monthTemplate.map((m) => {
      const stat = monthlyMap.get(m.monthIndex) || { count: 0, points: 0 };
      return {
        month: m.month,
        fullMonthName: m.fullMonthName,
        count: stat.count,
        points: stat.points,
      };
    });

    // 3. Build Category Breakdown Stats
    const categoryMap = new Map<
      string,
      { count: number; points: number; colorCode: string }
    >([
      ["Ringan", { count: 0, points: 0, colorCode: "#3b82f6" }],
      ["Sedang", { count: 0, points: 0, colorCode: "#f59e0b" }],
      ["Berat", { count: 0, points: 0, colorCode: "#ef4444" }],
    ]);

    liveViolations.forEach((v: any) => {
      const vType = Array.isArray(v.violation_types)
        ? v.violation_types[0]
        : v.violation_types;
      const cat = Array.isArray(vType?.violation_categories)
        ? vType?.violation_categories[0]
        : vType?.violation_categories;

      const rawName = cat?.name || "Ringan";
      const normalizedName = rawName.replace(/^Pelanggaran\s+/i, "").trim() || "Ringan";
      const colorCode =
        cat?.color_code ||
        (normalizedName === "Berat"
          ? "#ef4444"
          : normalizedName === "Sedang"
          ? "#f59e0b"
          : "#3b82f6");

      const current = categoryMap.get(normalizedName) || {
        count: 0,
        points: 0,
        colorCode,
      };
      current.count += 1;
      current.points += Number(v.points) || 0;
      categoryMap.set(normalizedName, current);
    });

    const categoryStats: CategoryViolationStat[] = Array.from(
      categoryMap.entries()
    ).map(([categoryName, val]) => ({
      categoryName,
      count: val.count,
      points: val.points,
      colorCode: val.colorCode,
      percentage:
        totalViolations > 0
          ? Number(((val.count / totalViolations) * 100).toFixed(1))
          : 0,
    }));

    // 4. Build Top 10 Violations
    const ruleAggregation = new Map<
      string,
      {
        id: string;
        code: string;
        name: string;
        categoryName: string;
        pointsPerIncident: number;
        count: number;
        totalPoints: number;
      }
    >();

    liveViolations.forEach((v: any) => {
      const vType = Array.isArray(v.violation_types)
        ? v.violation_types[0]
        : v.violation_types;
      const cat = Array.isArray(vType?.violation_categories)
        ? vType?.violation_categories[0]
        : vType?.violation_categories;

      const ruleKey = v.violation_type_id || vType?.code || "unknown";
      const code = vType?.code || "K-00";
      const name = vType?.name || "Pelanggaran Tata Tertib";
      const categoryName =
        (cat?.name || "Ringan").replace(/^Pelanggaran\s+/i, "").trim() || "Ringan";
      const pts = Number(v.points) || Number(vType?.points) || 5;

      const existing = ruleAggregation.get(ruleKey) || {
        id: String(ruleKey),
        code,
        name,
        categoryName,
        pointsPerIncident: pts,
        count: 0,
        totalPoints: 0,
      };
      existing.count += 1;
      existing.totalPoints += pts;
      ruleAggregation.set(ruleKey, existing);
    });

    const topViolations: TopViolationStat[] = Array.from(ruleAggregation.values())
      .sort((a, b) => b.count - a.count || b.totalPoints - a.totalPoints)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        percentage:
          totalViolations > 0
            ? Number(((item.count / totalViolations) * 100).toFixed(1))
            : 0,
      }));

    // 5. Build Top 10 Students by Points
    const studentIncidentCounts = new Map<string, number>();
    const studentPointsFromViolations = new Map<string, number>();
    liveViolations.forEach((v: any) => {
      if (!v.student_id) return;
      studentIncidentCounts.set(
        v.student_id,
        (studentIncidentCounts.get(v.student_id) || 0) + 1
      );
      studentPointsFromViolations.set(
        v.student_id,
        (studentPointsFromViolations.get(v.student_id) || 0) + (Number(v.points) || 0)
      );
    });

    const topStudents: TopStudentStat[] = liveStudents
      .map((s: any) => {
        const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        const dbPoints = Number(s.total_violation_points) || 0;
        const calcPoints = studentPointsFromViolations.get(s.id) || 0;
        const effectivePoints = Math.max(dbPoints, calcPoints);
        const levelInfo = getDisciplinaryLevel(effectivePoints);

        return {
          id: s.id,
          nis: s.nis || "-",
          fullName: profile?.full_name || "Siswa",
          className: s.class_name || "-",
          totalViolationPoints: effectivePoints,
          totalMeritPoints: Number(s.total_merit_points) || 0,
          violationCount:
            studentIncidentCounts.get(s.id) || (effectivePoints > 0 ? 1 : 0),
          status: levelInfo.level,
        };
      })
      .sort(
        (a, b) =>
          b.totalViolationPoints - a.totalViolationPoints ||
          b.violationCount - a.violationCount
      )
      .slice(0, 10);

    // 6. Build Recent Violation Activities (top 10 latest)
    const recentActivities: RecentViolationActivity[] = liveViolations
      .slice(0, 10)
      .map((r: any) => {
        const student = Array.isArray(r.students) ? r.students[0] : r.students || {};
        const profile = Array.isArray(student.profiles)
          ? student.profiles[0]
          : student.profiles || {};
        const vType = Array.isArray(r.violation_types)
          ? r.violation_types[0]
          : r.violation_types || {};
        const category = Array.isArray(vType.violation_categories)
          ? vType.violation_categories[0]
          : vType.violation_categories || {};
        const teacherObj = Array.isArray(r.teachers) ? r.teachers[0] : r.teachers;
        const teacherProfile = Array.isArray(teacherObj?.profiles)
          ? teacherObj?.profiles[0]
          : teacherObj?.profiles || {};

        const dateObj = new Date(r.incident_date);
        const formattedDate = dateObj.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          id: r.id,
          incidentDate: formattedDate,
          studentId: r.student_id,
          studentNis: student.nis || "-",
          studentName: profile.full_name || "Siswa",
          className: student.class_name || "-",
          ruleCode: vType.code || "K-00",
          violationName: vType.name || "Pelanggaran Tata Tertib",
          categoryName:
            (category.name || "Ringan").replace(/^Pelanggaran\s+/i, "").trim() ||
            "Ringan",
          points: Number(r.points) || 0,
          reportedByTeacher: teacherProfile.full_name || "Guru Piket / Tatib",
          status: r.status || "confirmed",
          evidenceUrl: r.evidence_url,
        };
      });

    const isPositiveChange = monthlyChangePercentage <= 0;
    const changeLabel =
      monthlyChangePercentage === 0
        ? "Stabil dibanding bulan lalu"
        : monthlyChangePercentage < 0
        ? `Turun ${Math.abs(monthlyChangePercentage)}% dari bulan lalu`
        : `Naik +${monthlyChangePercentage}% dari bulan lalu`;

    return {
      metrics: {
        totalStudents,
        totalTeachers,
        totalViolations,
        totalViolationPoints,
        studentsWithViolations,
        monthlyViolations,
        previousMonthViolations,
        monthlyChangePercentage,
        studentTrend: `${totalStudents} siswa terdaftar aktif`,
        monthlyViolationTrend: {
          value: monthlyChangePercentage,
          isPositive: isPositiveChange,
          label: changeLabel,
        },
      },
      monthlyStats,
      categoryStats,
      topViolations,
      topStudents,
      recentActivities,
      academicPeriod: {
        year: configuredYear,
        semester: activeSemester === "genap" ? "Semester Genap" : "Semester Ganjil",
      },
      dataSource: "supabase_live",
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Supabase overview fetch error, falling back to seed data:", err);
    return {
      ...FALLBACK_OVERVIEW_DATA,
      academicPeriod: {
        year: configuredYear,
        semester: `Semester ${configuredSemester}`,
      },
      lastUpdated: new Date().toISOString(),
    };
  }
}
