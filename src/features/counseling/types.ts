import { SanctionLevelConfig } from "@/lib/constants/discipline";
import {
  CounselorAchievementItem,
  CounselorReductionItem,
} from "@/features/student-merits/actions";

export interface CounselingRecordItem {
  id: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  className: string;
  counselorId: string;
  counselorName: string;
  counselingType: string;
  description: string;
  notes?: string;
  status?: string;
  counselingDate: string;
  pointReduction: number;
  previousPoints: number;
  resultingPoints: number;
  reductionReason?: string | null;
  evidenceNotes?: string | null;
  action: string;
  createdAt: string;
}

export interface StudentCounselingProfile {
  id: string;
  profileId: string;
  studentName: string;
  nis: string;
  nisn: string;
  className: string;
  totalPoints: number;
  totalViolations: number;
  currentDisciplineStatus: SanctionLevelConfig;
  recentViolations: Array<{
    id: string;
    violationName: string;
    ruleCode: string;
    categoryName?: string;
    points: number;
    incidentDate: string;
    status: string;
  }>;
}

export interface CounselingFormInput {
  studentId: string;
  counselingType: string;
  description: string;
  counselingDate: string;
  pointReduction: number;
  reductionReason?: string;
  evidenceNotes?: string;
}

export interface CounselorAccessResult {
  isCounselor: boolean;
  message?: string;
  teacher?: {
    id: string;
    profileId: string;
    fullName: string;
    nip: string;
    teacherType: string;
    specialization: string;
  } | null;
}

export interface CounselingSummary {
  totalPendingMerits: number;
  totalApprovedMerits: number;
  totalApprovedReductions: number;
  totalStudentsInCoaching: number;
}

export interface CoachingStudentItem {
  id: string;
  studentName: string;
  studentNis: string;
  studentNisn: string;
  className: string;
  totalViolations: number;
  totalViolationPoints: number;
  totalReductionPoints: number;
  effectivePoints: number;
  disciplineStatus: "SP1" | "SP2" | "SP3 (Kepala Sekolah)" | "BK Monitoring" | "Aman";
  statusColor: "rose" | "orange" | "amber" | "blue" | "emerald";
  totalMeritPoints: number;
  availableMerits: number;
  latestCounselingNote?: string | null;
  counselingRecordsCount: number;
}

export interface CounselorStudentOption {
  id: string;
  fullName: string;
  nis: string;
  nisn: string;
  className: string;
  totalViolationPoints: number;
  totalMeritPoints: number;
  availableMerits: number;
  effectivePoints: number;
  status: string;
}

export interface CounselorDashboardData {
  access: CounselorAccessResult;
  summary: CounselingSummary;
  achievements: CounselorAchievementItem[];
  reductions: CounselorReductionItem[];
  coachingStudents: CoachingStudentItem[];
  availableStudents: CounselorStudentOption[];
  counselingHistory: CounselingRecordItem[];
}
