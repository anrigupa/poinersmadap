export type AcademicYearOption =
  | "2024/2025"
  | "2025/2026"
  | "2026/2027"
  | "2027/2028"
  | "2028/2029"
  | "2029/2030"
  | string;

export type SemesterOption = "Ganjil" | "Genap";

export interface AcademicSettingItem {
  id: string;
  academicYear: string;
  semester: SemesterOption;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface SystemSettingsData {
  activeSetting: AcademicSettingItem;
  allSettings: AcademicSettingItem[];
  dataSource: "supabase_live" | "demo_fallback";
}

export interface SettingsActionResponse {
  success: boolean;
  message: string;
  data?: SystemSettingsData;
}
