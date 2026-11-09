"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole, assertRole } from "@/lib/security/guards";
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

function createEmptyOverviewData(
  year: string,
  semester: string
): AdminOverviewData {
  return {
    metrics: {
      totalStudents: 0,
      totalTeachers: 0,
      totalViolations: 0,
      totalViolationPoints: 0,
      studentsWithViolations: 0,
      monthlyViolations: 0,
      previousMonthViolations: 0,
      monthlyChangePercentage: 0,
      studentTrend: "0 siswa terdaftar aktif",
      monthlyViolationTrend: {
        value: 0,
        isPositive: true,
        label: "Belum ada statistik tersedia",
      },
    },
    monthlyStats: [],
    categoryStats: [],
    topViolations: [],
    topStudents: [],
    recentActivities: [],
    academicPeriod: {
      year,
      semester: semester.startsWith("Semester") ? semester : `Semester ${semester}`,
    },
    dataSource: "supabase_live",
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Server Action: Fetches real-time discipline analytics exclusively from Supabase PostgreSQL.
 * Zero fallback datasets, zero mock arrays, zero demo statistics.
 */
export async function getAdminOverviewData(options?: {
  semester?: "ganjil" | "genap";
}): Promise<AdminOverviewData> {
  // Enforce strict Administrator authorization
  const session = await requireRole(["admin"], "/admin");
  assertRole(session, ["admin"], "mengakses ringkasan analitik administrator");

  const systemSettings = await getSystemSettingsAction();
  const configuredYear = systemSettings.activeSetting.academicYear;
  const configuredSemester = systemSettings.activeSetting.semester;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isSupabaseLive =
    Boolean(supabaseUrl) &&
    supabaseUrl !== "https://placeholder-project.supabase.co" &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  if (!isSupabaseLive) {
    return createEmptyOverviewData(configuredYear, configuredSemester);
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // 1. Fetch Students, Teachers count, and all Violations exclusively from Supabase
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

    const totalStudents = liveStudents.length;
    const totalTeachers = teachersCountRes.count ?? 0;

    // Violation Counts & Points (calculated strictly from authentic database records)
    const totalViolations = liveViolations.length;
    const totalViolationPoints = liveViolations.reduce(
      (sum: number, v: any) => sum + (Number(v.points) || 0),
      0
    );

    // Students With Violations
    const uniqueViolatingStudentIds = new Set(
      liveViolations.map((v: any) => v.student_id).filter(Boolean)
    );
    const studentsWithViolations = uniqueViolatingStudentIds.size;

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
        (
          ((monthlyViolations - previousMonthViolations) /
            previousMonthViolations) *
          100
        ).toFixed(1)
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
    monthTemplate.forEach((m) =>
      monthlyMap.set(m.monthIndex, { count: 0, points: 0 })
    );

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

    const monthlyStats: MonthlyViolationStat[] =
      totalViolations > 0
        ? monthTemplate.map((m) => {
            const stat = monthlyMap.get(m.monthIndex) || { count: 0, points: 0 };
            return {
              month: m.month,
              fullMonthName: m.fullMonthName,
              count: stat.count,
              points: stat.points,
            };
          })
        : [];

    // 3. Build Category Breakdown Stats (strictly from live violations)
    const categoryMap = new Map<
      string,
      { count: number; points: number; colorCode: string }
    >();

    liveViolations.forEach((v: any) => {
      const vType = Array.isArray(v.violation_types)
        ? v.violation_types[0]
        : v.violation_types;
      const cat = Array.isArray(vType?.violation_categories)
        ? vType?.violation_categories[0]
        : vType?.violation_categories;

      const rawName = cat?.name || "Pelanggaran Umum";
      const normalizedName =
        rawName.replace(/^Pelanggaran\s+/i, "").trim() || "Pelanggaran Umum";
      const colorCode = cat?.color_code || "#3b82f6";

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
        (cat?.name || "Umum").replace(/^Pelanggaran\s+/i, "").trim() || "Umum";
      const pts = Number(v.points) || Number(vType?.points) || 0;

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

    const topViolations: TopViolationStat[] = Array.from(
      ruleAggregation.values()
    )
      .sort((a, b) => b.count - a.count || b.totalPoints - a.totalPoints)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        percentage:
          totalViolations > 0
            ? Number(((item.count / totalViolations) * 100).toFixed(1))
            : 0,
      }));

    // 5. Build Top 10 Students by Points (strictly from real records)
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
        (studentPointsFromViolations.get(v.student_id) || 0) +
          (Number(v.points) || 0)
      );
    });

    const topStudents: TopStudentStat[] = liveStudents
      .map((s: any) => {
        const profile = Array.isArray(s.profiles) ? s.profiles[0] : s.profiles;
        const calcPoints = studentPointsFromViolations.get(s.id) ?? 0;
        const dbPoints = Number(s.total_violation_points) || 0;
        const effectivePoints =
          liveViolations.length > 0 ? calcPoints : dbPoints;
        const levelInfo = getDisciplinaryLevel(effectivePoints);

        return {
          id: s.id,
          nis: s.nis || "-",
          fullName: profile?.full_name || "Siswa",
          className: s.class_name || "-",
          totalViolationPoints: effectivePoints,
          totalMeritPoints: Number(s.total_merit_points) || 0,
          violationCount: studentIncidentCounts.get(s.id) || 0,
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
        const student = Array.isArray(r.students)
          ? r.students[0]
          : r.students || {};
        const profile = Array.isArray(student.profiles)
          ? student.profiles[0]
          : student.profiles || {};
        const vType = Array.isArray(r.violation_types)
          ? r.violation_types[0]
          : r.violation_types || {};
        const category = Array.isArray(vType.violation_categories)
          ? vType.violation_categories[0]
          : vType.violation_categories || {};
        const teacherObj = Array.isArray(r.teachers)
          ? r.teachers[0]
          : r.teachers;
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
            (category.name || "Umum").replace(/^Pelanggaran\s+/i, "").trim() ||
            "Umum",
          points: Number(r.points) || 0,
          reportedByTeacher: teacherProfile.full_name || "Guru Piket / Tatib",
          status: r.status || "confirmed",
          evidenceUrl: r.evidence_url,
        };
      });

    const isPositiveChange = monthlyChangePercentage <= 0;
    const changeLabel =
      totalViolations === 0
        ? "Belum ada statistik tersedia"
        : monthlyChangePercentage === 0
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
        semester:
          activeSemester === "genap" ? "Semester Genap" : "Semester Ganjil",
      },
      dataSource: "supabase_live",
      lastUpdated: new Date().toISOString(),
    };
  } catch (err) {
    console.error("Supabase overview fetch error:", err);
    return createEmptyOverviewData(configuredYear, configuredSemester);
  }
}
