export interface RecordViolationInput {
  studentId: string;
  violationTypeId: string;
  points: number;
  incidentDate: string; // ISO string
  location?: string;
  notes: string;
  evidenceUrl?: string;
  sanctionAction?: string;
}

export interface RecordViolationResult {
  violationId: string;
  studentId: string;
  studentName: string;
  studentNis: string;
  className: string;
  previousPoints: number;
  addedPoints: number;
  newTotalPoints: number;
  previousStatus: string;
  newStatus: string;
  sanctionEscalated: boolean;
  ruleCode: string;
  violationName: string;
  categoryName: string;
  reportedByName: string;
  reportedByNip?: string;
  incidentDate: string;
  formattedDate: string;
  notes: string;
  location?: string;
  evidenceUrl?: string;
  createdAt: string;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}
