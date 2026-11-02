export type StudentStatus =
  | "active"
  | "sp1"
  | "sp2"
  | "sp3"
  | "suspended"
  | "expelled";

export type StudentMajor =
  | "MIPA"
  | "IPS"
  | "Bahasa"
  | "RPL"
  | "TKJ"
  | "Umum";

export type StudentGender = "L" | "P";

export interface StudentItem {
  id: string; // Student record UUID
  profileId: string; // Auth profile UUID
  nisn: string; // Nomor Induk Siswa Nasional (10 digit)
  nis: string; // Nomor Induk Siswa internal
  fullName: string;
  email: string;
  className: string; // e.g. "X MIPA 1", "XI MIPA 2", "XII IPS 1"
  major: StudentMajor;
  gender: StudentGender;
  totalViolationPoints: number; // Poin akumulasi pelanggaran
  totalMeritPoints: number; // Poin akumulasi penghargaan/prestasi
  status: StudentStatus;
  parentName?: string | null;
  parentPhone?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentFilter {
  search?: string;
  className?: string;
  major?: string;
  status?: string;
  pointCategory?: "all" | "safe" | "warning" | "danger";
  page?: number;
  pageSize?: number;
  sortBy?: "nisn" | "fullName" | "className" | "totalViolationPoints" | "email";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface StudentSummaryStats {
  totalStudents: number;
  safeCount: number; // < 30 points
  warningCount: number; // 30 - 74 points
  dangerCount: number; // >= 75 points
}
