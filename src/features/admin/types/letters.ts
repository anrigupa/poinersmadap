import { SanctionLevelConfig } from "@/lib/constants/discipline";

export interface AdminCallLetterItem {
  id: string;
  counselingRecordId: string;
  date: string;
  formattedDate: string;
  letterNumber: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  studentNisn: string;
  className: string;
  counselorId: string;
  counselorName: string;
  counselorNip: string;
  counselingType: string;
  notes: string;
  totalViolationPoints: number;
  totalViolations: number;
  totalReductionPoints: number;
  effectivePoints: number;
  disciplineStatus: "Aman" | "Monitoring" | "SP1" | "SP2" | "SP3";
  statusColor: "emerald" | "blue" | "amber" | "orange" | "rose";
  scheduledDate?: string;
  scheduledTime?: string;
  location?: string;
  purpose?: string;
  additionalNotes?: string;
}

export interface AdminCallLettersSummary {
  totalLetters: number;
  lettersThisMonth: number;
  studentsInCoaching: number;
  activeCounselors: number;
}

export interface AdminCallLettersData {
  summary: AdminCallLettersSummary;
  items: AdminCallLetterItem[];
  academicPeriod: {
    year: string;
    semester: string;
  };
}
