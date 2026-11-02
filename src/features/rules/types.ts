export interface ViolationCategory {
  id: string;
  name: string; // e.g. "Ringan", "Sedang", "Berat"
  severityLevel: 1 | 2 | 3;
  description?: string;
  colorCode: string;
  itemCount?: number;
}

export interface ViolationItem {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  code: string; // e.g. "K-01", "S-02"
  name: string; // Title of infraction
  description: string;
  points: number; // Positive point weight
  sanctionRecommendation?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ViolationFilter {
  search?: string;
  categoryId?: string;
  severityLevel?: number;
  minPoints?: number;
  maxPoints?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "code" | "name" | "points" | "category";
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
