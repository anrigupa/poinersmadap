export interface DashboardMetrics {
  totalStudents: number;
  totalTeachers: number;
  totalViolations: number;
  monthlyViolations: number;
  studentTrend?: string;
  monthlyViolationTrend?: {
    value: number; // e.g. -12%
    isPositive: boolean; // lower violations is positive for school discipline!
    label: string;
  };
}

export interface MonthlyViolationStat {
  month: string; // e.g. "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
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
  recentActivities: RecentViolationActivity[];
  academicPeriod: {
    year: string;
    semester: string;
  };
  dataSource: "supabase_live" | "demo_fallback";
}
