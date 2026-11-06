export type ViolationStatusLevel =
  | "Aman"
  | "SP1"
  | "SP2"
  | "SP3 (Kepala Sekolah)";

export interface StudentProfileSummary {
  id: string;
  fullName: string;
  nisn: string;
  nis: string;
  email: string;
  className: string;
  major?: string;
  gender: "L" | "P";
  parentName?: string | null;
  parentPhone?: string | null;
  status: string;
}

export interface StudentPointsSummary {
  totalViolationPoints: number;
  totalMeritPoints: number;
  netPoints: number;
  currentLevel: ViolationStatusLevel;
  levelColor: "emerald" | "amber" | "orange" | "rose";
  minPoints: number;
  maxPoints: number;
  nextThreshold: number;
  pointsToNextLevel: number;
  progressBarPercent: number;
  levelDescription: string;
  sanctionAuthority: string;
  recommendation: string;
}

export interface MonthlyTrendItem {
  month: string; // e.g. "Jul", "Agu", "Sep", "Okt", "Nov", "Des"
  points: number;
  incidentCount: number;
}

export interface CategoryBreakdownItem {
  categoryName: "Ringan" | "Sedang" | "Berat" | string;
  points: number;
  count: number;
  color: string;
  percentage: number;
}

export interface StudentViolationHistoryItem {
  id: string;
  ruleCode: string;
  violationName: string;
  categoryName: string;
  points: number;
  incidentDate: string;
  formattedDate: string;
  notes: string;
  reportedByName: string;
  evidenceUrl?: string | null;
  status: "confirmed" | "appealed" | "cancelled" | string;
}

export interface StudentDashboardData {
  profile: StudentProfileSummary;
  points: StudentPointsSummary;
  monthlyTrends: MonthlyTrendItem[];
  categoryBreakdown: CategoryBreakdownItem[];
  history: StudentViolationHistoryItem[];
}
