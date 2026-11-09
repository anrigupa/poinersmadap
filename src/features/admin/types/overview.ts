export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalViolations: number;
  totalViolationPoints: number;
  studentsWithViolations: number;
  monthlyViolations: number;
  previousMonthViolations: number;
  monthlyChangePercentage: number; // e.g. -12.5 or +8.4
  studentTrend?: string;
  monthlyViolationTrend?: {
    value: number; // e.g. -12.5%
    isPositive: boolean; // lower violations is positive for school discipline!
    label: string;
  };
}

export interface MonthlyViolationStat {
  month: string; // e.g. "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  fullMonthName?: string;
  count: number;
  points: number;
}

export interface CategoryViolationStat {
  categoryName: "Ringan" | "Sedang" | "Berat" | string;
  count: number;
  points: number;
  colorCode: string;
  percentage: number;
}

export interface TopViolationStat {
  id: string;
  code: string;
  name: string;
  categoryName: "Ringan" | "Sedang" | "Berat" | string;
  pointsPerIncident: number;
  count: number;
  totalPoints: number;
  percentage: number;
}

export interface TopStudentStat {
  id: string;
  nis: string;
  fullName: string;
  className: string;
  totalViolationPoints: number;
  totalMeritPoints: number;
  violationCount: number;
  status: string; // e.g. "Aman", "SP1", "SP2", "SP3 (Kepala Sekolah)"
}

export interface RecentViolationActivity {
  id: string;
  incidentDate: string;
  studentId?: string;
  studentNis: string;
  studentName: string;
  className: string;
  ruleCode: string;
  violationName: string;
  categoryName: string;
  points: number;
  reportedByTeacher: string;
  status: "confirmed" | "appealed" | "cancelled" | string;
  evidenceUrl?: string | null;
}

export interface AdminOverviewData {
  metrics: DashboardMetrics;
  monthlyStats: MonthlyViolationStat[];
  categoryStats: CategoryViolationStat[];
  topViolations: TopViolationStat[];
  topStudents: TopStudentStat[];
  recentActivities: RecentViolationActivity[];
  academicPeriod: {
    year: string;
    semester: string;
  };
  dataSource: "supabase_live";
  lastUpdated?: string;
}
