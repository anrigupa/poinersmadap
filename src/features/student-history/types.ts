export interface StudentHistoryRecord {
  id: string;
  studentId: string;
  studentNis: string;
  studentName: string;
  className: string;
  ruleCode: string;
  violationName: string;
  categoryName: "Ringan" | "Sedang" | "Berat" | string;
  points: number;
  incidentDate: string; // ISO
  formattedDate: string;
  location?: string;
  notes: string;
  teacherName: string;
  teacherNip?: string;
  evidenceUrl?: string | null;
  status: "confirmed" | "appealed" | "cancelled" | string;
  createdAt: string;
}

export interface StudentViolationHistoryFilter {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: "all" | "this_month" | "this_semester";
  page?: number;
  pageSize?: number;
  sortBy?: "incidentDate" | "points" | "categoryName";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StudentHistoryStats {
  totalIncidents: number;
  totalPoints: number;
  highestPoint: number;
  latestDate: string;
  disciplinaryLevel: "Aman" | "SP1" | "SP2" | "SP3 (Kepala Sekolah)";
}

export interface StudentHistoryPageData {
  stats: StudentHistoryStats;
  records: PaginatedResult<StudentHistoryRecord>;
  studentName: string;
  studentNis: string;
  className: string;
}
