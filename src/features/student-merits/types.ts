// ============================================================================
// SMADAP POINER - Student Merits & Point Deduction (Pemutihan Poin) Types
// ============================================================================

export type AchievementCategory =
  | "Akademik"
  | "Ekstrakurikuler"
  | "Tahfidz"
  | "OSIS"
  | "Paskibra"
  | "Keagamaan"
  | "Sosial";

export type AchievementStatus = "pending" | "approved" | "rejected";

export interface StudentAchievementItem {
  id: string;
  studentId: string;
  achievementName: string;
  category: AchievementCategory;
  description: string;
  evidenceUrl?: string | null;
  meritPoints: number;
  status: AchievementStatus;
  submissionDate: string;
  formattedDate: string;
  verifiedByName?: string | null;
  verifiedAt?: string | null;
  rejectionReason?: string | null;
}

export interface MeritBalanceSummary {
  totalMeritPoints: number;
  usedMeritPoints: number;
  availableMeritPoints: number;
}

export interface PointReductionItem {
  id: string;
  date: string;
  formattedDate: string;
  violationOrReason: string;
  originalPoints: number;
  reductionPoints: number;
  remainingPoints: number;
  approvedBy: string;
}

export interface DisciplineStatusSummary {
  totalViolationPoints: number;
  totalReductionPoints: number;
  effectiveDisciplinePoints: number;
  statusLevel: "Aman" | "SP1" | "SP2" | "SP3 (Kepala Sekolah)";
  levelColor: "emerald" | "amber" | "orange" | "rose";
  levelDescription: string;
  sanctionAuthority: string;
  progressBarPercent: number;
}

export interface StudentMeritProfile {
  id: string;
  fullName: string;
  nis: string;
  nisn: string;
  className: string;
}

export interface StudentMeritsDashboardData {
  student: StudentMeritProfile;
  achievements: StudentAchievementItem[];
  meritBalance: MeritBalanceSummary;
  reductions: PointReductionItem[];
  disciplineStatus: DisciplineStatusSummary;
}
