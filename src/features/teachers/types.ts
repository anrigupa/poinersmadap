export type TeacherType = "teacher" | "counselor";

export type TeacherSpecialization =
  | "guru_piket"
  | "wali_kelas"
  | "guru_bk"
  | "guru_mapel";

export interface TeacherItem {
  id: string; // Teacher record UUID
  profileId: string; // Auth profile UUID
  nip: string; // Nomor Induk Pegawai
  fullName: string;
  email: string;
  teacher_type: TeacherType;
  specialization: TeacherSpecialization;
  assignedClass?: string | null;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  status: "active" | "invited" | "suspended";
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Privacy-scoped public DTO for the "Lapor BK" Counselor Contact list.
 * Excludes internal identifiers such as `profileId`, `nip`, and `email`.
 */
export interface PublicCounselorContact {
  id: string;
  fullName: string;
  roleTitle: "Guru BK";
  assignedClass: string | null;
  phoneNumber: string | null;
}

export interface TeacherFilter {
  search?: string;
  teacher_type?: TeacherType | "all";
  specialization?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "nip" | "fullName" | "email" | "specialization";
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
