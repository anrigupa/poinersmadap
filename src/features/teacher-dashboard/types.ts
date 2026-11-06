import { UserProfile } from "@/types/auth";

import { ViolationDateRange } from "@/lib/dateUtils";

export type { ViolationDateRange };

export interface TeacherViolationRecord {
  id: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  className: string;
  violationTypeId: string;
  ruleCode: string;
  violationName: string;
  categoryName: string;
  categoryColor?: string;
  points: number;
  incidentDate: string; // ISO format or string
  formattedDate: string;
  notes: string;
  evidenceUrl?: string | null;
  reportedById: string; // STRICT: Must match teacher's profile ID
  reportedByName: string;
  status: "confirmed" | "appealed" | "cancelled";
  createdAt: string;
}

export interface TeacherDashboardStats {
  violationsToday: number;
  violationsThisMonth: number;
  totalPersonalSubmissions: number;
  totalPointsAccrued: number;
  studentsHandledCount?: number;
}

export interface TeacherViolationFilter {
  search?: string;
  status?: string;
  dateRange?: ViolationDateRange;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AddViolationInput {
  studentId: string;
  studentNis: string;
  studentName: string;
  className: string;
  violationTypeId: string;
  ruleCode: string;
  violationName: string;
  categoryName: string;
  points: number;
  notes: string;
  incidentDate: string;
  evidenceUrl?: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface TeacherDashboardData {
  stats: TeacherDashboardStats;
  recentSubmissions: PaginatedResult<TeacherViolationRecord>;
  teacherProfile: UserProfile;
}

export interface HomeroomStudentItem {
  id: string;
  studentName: string;
  nisn: string;
  nis?: string;
  className: string;
  totalViolations: number;
  totalPoints: number;
  status?: string;
}

export interface HomeroomDisciplineSummary {
  totalStudents: number;
  studentsWithoutViolations: number;
  studentsWithViolations: number;
  averageViolationPoints: number;
}

export interface HomeroomClassData {
  isHomeroom: boolean;
  assignedClass: string | null;
  message?: string;
  summary: HomeroomDisciplineSummary;
  students: HomeroomStudentItem[];
}

