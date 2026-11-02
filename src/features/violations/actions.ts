"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentSession } from "@/features/auth/actions/authActions";
import {
  RecordViolationInput,
  RecordViolationResult,
  ActionResponse,
} from "@/features/violations/types";
import { recordViolationSchema } from "@/features/violations/schemas";
import { getStudentsAction, applyStudentViolationPoints } from "@/features/students/actions";
import { getViolationsAction } from "@/features/rules/actions";
import { addTeacherViolationAction } from "@/features/teacher-dashboard/actions";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function recordStudentViolationAction(
  rawInput: unknown
): Promise<ActionResponse<RecordViolationResult>> {
  // -----------------------------------------------------------
  // 1. ROLE SECURITY: Verify Authentication & Authorization
  // -----------------------------------------------------------
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: "Akses ditolak: Anda harus login untuk mencatat pelanggaran siswa.",
    };
  }

  const { role } = session.user;
  if (role !== "guru" && role !== "admin") {
    return {
      success: false,
      message: "Akses dibatasi: Hanya akun Guru atau Admin yang berhak mencatat pelanggaran siswa.",
    };
  }

  // -----------------------------------------------------------
  // 2. INPUT VALIDATION
  // -----------------------------------------------------------
  const parsed = recordViolationSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: "Validasi gagal: periksa data siswa, aturan, dan catatan kronologi.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data: RecordViolationInput = parsed.data;

  // -----------------------------------------------------------
  // 3. RESOLVE STUDENT DETAILS (LINK STUDENT)
  // -----------------------------------------------------------
  const studentsRes = await getStudentsAction({ pageSize: 100 });
  const student = studentsRes.items.find((s) => s.id === data.studentId);
  if (!student) {
    return {
      success: false,
      message: "Data siswa yang dipilih tidak ditemukan dalam sistem.",
    };
  }

  // -----------------------------------------------------------
  // 4. RESOLVE VIOLATION RULE DETAILS
  // -----------------------------------------------------------
  const rulesRes = await getViolationsAction({ pageSize: 100 });
  const rule = rulesRes.items.find((r) => r.id === data.violationTypeId);
  if (!rule) {
    return {
      success: false,
      message: "Pasal atau jenis pelanggaran yang dipilih tidak valid.",
    };
  }

  // -----------------------------------------------------------
  // 5. CALCULATE POINTS & DETERMINE STATUS ESCALATION
  // -----------------------------------------------------------
  const previousPoints = student.totalViolationPoints;
  const addedPoints = data.points || rule.points;
  const newTotalPoints = previousPoints + addedPoints;
  const previousStatus = student.status;

  // Disciplinary thresholds via unified constant:
  // 0-35: active, 36-75: sp1, 76-150: sp2, 151+: sp3
  const levelConfig = getDisciplinaryLevel(newTotalPoints);
  const newStatus =
    levelConfig.level === "Aman"
      ? "active"
      : levelConfig.level.startsWith("SP1")
      ? "sp1"
      : levelConfig.level.startsWith("SP2")
      ? "sp2"
      : "sp3";

  const sanctionEscalated = newStatus !== previousStatus;

  // Formatted date
  const incDate = new Date(data.incidentDate);
  const formattedDate = incDate.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }) + " WITA";

  const reporter = session.user;
  const violationId = `rec-viol-${Date.now()}`;

  // -----------------------------------------------------------
  // 6. SAVE VIOLATION & UPDATE STUDENT TOTAL POINTS
  // -----------------------------------------------------------
  if (isSupabaseLive()) {
    try {
      const supabase = await createClient();

      // A. Save violation with links to student and teacher
      const { data: inserted, error: insertError } = await supabase
        .from("student_violations")
        .insert({
          student_id: student.id,
          violation_type_id: rule.id,
          reported_by: reporter.id,
          points: addedPoints,
          notes: data.notes + (data.location ? ` [Lokasi: ${data.location}]` : ""),
          evidence_url: data.evidenceUrl || null,
          incident_date: data.incidentDate,
          status: "confirmed",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      // B. Update student total points and status
      const { error: studentUpdateError } = await supabase
        .from("students")
        .update({
          total_violation_points: newTotalPoints,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", student.id);

      if (studentUpdateError) {
        throw new Error(studentUpdateError.message);
      }

      // Sync local in-memory fallback
      await applyStudentViolationPoints(student.id, addedPoints);

      revalidatePath("/guru");
      revalidatePath("/guru/report");
      revalidatePath("/admin/students");
      revalidatePath("/admin");
      revalidatePath("/siswa");

      const result: RecordViolationResult = {
        violationId: inserted?.id || violationId,
        studentId: student.id,
        studentName: student.fullName,
        studentNis: student.nis,
        className: student.className,
        previousPoints,
        addedPoints,
        newTotalPoints,
        previousStatus,
        newStatus,
        sanctionEscalated,
        ruleCode: rule.code,
        violationName: rule.name,
        categoryName: rule.categoryName,
        reportedByName: reporter.fullName,
        reportedByNip: reporter.nip,
        incidentDate: data.incidentDate,
        formattedDate,
        notes: data.notes,
        location: data.location,
        evidenceUrl: data.evidenceUrl,
        createdAt: new Date().toISOString(),
      };

      return {
        success: true,
        message: `Pelanggaran "${rule.name}" (+${addedPoints} poin) berhasil dicatat untuk ${student.fullName}. Total poin saat ini: ${newTotalPoints}.`,
        data: result,
      };
    } catch (err: any) {
      console.warn("Supabase recordStudentViolation error, using fallback:", err.message);
    }
  }

  // -----------------------------------------------------------
  // 7. FALLBACK / IN-MEMORY PERSISTENCE
  // -----------------------------------------------------------
  // A. Update student points in memory
  await applyStudentViolationPoints(student.id, addedPoints);

  // B. Sync with teacher dashboard actions
  await addTeacherViolationAction(reporter, {
    studentId: student.id,
    studentNis: student.nis,
    studentName: student.fullName,
    className: student.className,
    violationTypeId: rule.id,
    ruleCode: rule.code,
    violationName: rule.name,
    categoryName: rule.categoryName,
    points: addedPoints,
    notes: data.notes + (data.location ? ` [Lokasi: ${data.location}]` : ""),
    incidentDate: data.incidentDate,
    evidenceUrl: data.evidenceUrl,
  });

  revalidatePath("/guru");
  revalidatePath("/guru/report");
  revalidatePath("/admin/students");
  revalidatePath("/admin");
  revalidatePath("/siswa");

  const result: RecordViolationResult = {
    violationId,
    studentId: student.id,
    studentName: student.fullName,
    studentNis: student.nis,
    className: student.className,
    previousPoints,
    addedPoints,
    newTotalPoints,
    previousStatus,
    newStatus,
    sanctionEscalated,
    ruleCode: rule.code,
    violationName: rule.name,
    categoryName: rule.categoryName,
    reportedByName: reporter.fullName,
    reportedByNip: reporter.nip,
    incidentDate: data.incidentDate,
    formattedDate,
    notes: data.notes,
    location: data.location,
    evidenceUrl: data.evidenceUrl,
    createdAt: new Date().toISOString(),
  };

  return {
    success: true,
    message: `Pelanggaran "${rule.name}" (+${addedPoints} poin) berhasil dicatat untuk ${student.fullName}. Total poin saat ini: ${newTotalPoints}.`,
    data: result,
  };
}
