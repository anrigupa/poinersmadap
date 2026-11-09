"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/security/guards";
import { getDisciplinaryLevel } from "@/lib/constants/discipline";
import { getSystemSettingsAction } from "@/features/settings/actions";
import {
  AdminCallLetterItem,
  AdminCallLettersData,
  AdminCallLettersSummary,
} from "@/features/admin/types/letters";

function isSupabaseLive(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return Boolean(
    url &&
    url !== "https://placeholder-project.supabase.co" &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function getAdminCallLettersDataAction(): Promise<AdminCallLettersData> {
  await requireRole(["admin"], "/admin/letters");

  let academicYear = "2026/2027";
  let semester = "Ganjil";
  try {
    const settings = await getSystemSettingsAction();
    if (settings?.activeSetting) {
      academicYear = settings.activeSetting.academicYear;
      semester = settings.activeSetting.semester;
    }
  } catch {
    // fallback defaults
  }

  const defaultResult: AdminCallLettersData = {
    summary: {
      totalLetters: 0,
      lettersThisMonth: 0,
      studentsInCoaching: 0,
      activeCounselors: 0,
    },
    items: [],
    academicPeriod: {
      year: academicYear,
      semester: semester.startsWith("Semester") ? semester : `Semester ${semester}`,
    },
  };

  if (!isSupabaseLive()) {
    return defaultResult;
  }

  try {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // 1. Fetch live counseling records with student and teacher profiles
    const { data: records, error: recordsError } = await supabase
      .from("counseling_records")
      .select(`
        id,
        counseling_date,
        counseling_type,
        notes,
        status,
        created_at,
        students:student_id (
          id,
          nis,
          nisn,
          class_name,
          total_violation_points,
          status,
          profiles:profile_id (
            full_name
          )
        ),
        teachers:counselor_id (
          id,
          nip,
          profiles:profile_id (
            full_name
          )
        )
      `)
      .order("counseling_date", { ascending: false });

    if (recordsError) {
      console.error("Failed to fetch counseling records for admin letters:", recordsError);
    }

    // 2. Fetch all student violations counts
    const { data: violations } = await supabase
      .from("student_violations")
      .select("id, student_id, points, status")
      .neq("status", "cancelled");

    const studentViolationsMap = new Map<string, { count: number; points: number }>();
    if (violations) {
      for (const v of violations) {
        const cur = studentViolationsMap.get(v.student_id) || { count: 0, points: 0 };
        studentViolationsMap.set(v.student_id, {
          count: cur.count + 1,
          points: cur.points + (v.points || 0),
        });
      }
    }

    // 3. Fetch all merit deductions
    const { data: deductions } = await supabase
      .from("merit_deductions")
      .select("student_id, reduction_points");

    const studentDeductionsMap = new Map<string, number>();
    if (deductions) {
      for (const d of deductions) {
        studentDeductionsMap.set(
          d.student_id,
          (studentDeductionsMap.get(d.student_id) || 0) + (d.reduction_points || 0)
        );
      }
    }

    // 4. Fetch all active counselors (Guru BK)
    const { data: counselors } = await supabase
      .from("teachers")
      .select("id, teacher_type, specialization")
      .or("teacher_type.eq.counselor,specialization.eq.guru_bk");

    const activeCounselorsCount = counselors?.length || 1;

    // 5. Fetch all students with points or in coaching to count students in coaching
    const { data: allStudents } = await supabase
      .from("students")
      .select("id, total_violation_points, status");

    const coachingStudentIds = new Set<string>();
    if (allStudents) {
      for (const s of allStudents) {
        const deductionsTotal = studentDeductionsMap.get(s.id) || 0;
        const effective = Math.max(0, (s.total_violation_points || 0) - deductionsTotal);
        if (effective >= 15 || s.status === "sp1" || s.status === "sp2" || s.status === "sp3") {
          coachingStudentIds.add(s.id);
        }
      }
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let lettersThisMonth = 0;

    const items: AdminCallLetterItem[] = (records || []).map((r: any, idx: number) => {
      const student = r.students || {};
      const studentProfile = Array.isArray(student.profiles)
        ? student.profiles[0]
        : student.profiles;

      const teacher = r.teachers || {};
      const teacherProfile = Array.isArray(teacher.profiles)
        ? teacher.profiles[0]
        : teacher.profiles;

      const vInfo = studentViolationsMap.get(student.id || "") || { count: 0, points: 0 };
      const reductionPoints = studentDeductionsMap.get(student.id || "") || 0;
      const rawPoints = student.total_violation_points ?? vInfo.points;
      const effectivePoints = Math.max(0, rawPoints - reductionPoints);

      // Determine discipline status
      let disciplineStatus: "Aman" | "Monitoring" | "SP1" | "SP2" | "SP3" = "Aman";
      let statusColor: "emerald" | "blue" | "amber" | "orange" | "rose" = "emerald";

      if (effectivePoints >= 151) {
        disciplineStatus = "SP3";
        statusColor = "rose";
      } else if (effectivePoints >= 76) {
        disciplineStatus = "SP2";
        statusColor = "orange";
      } else if (effectivePoints >= 36) {
        disciplineStatus = "SP1";
        statusColor = "amber";
      } else if (effectivePoints >= 15) {
        disciplineStatus = "Monitoring";
        statusColor = "blue";
      }

      if (student.id) {
        coachingStudentIds.add(student.id);
      }

      const recordDate = new Date(r.counseling_date || r.created_at);
      if (
        recordDate.getFullYear() === currentYear &&
        recordDate.getMonth() === currentMonth
      ) {
        lettersThisMonth++;
      }

      const formattedDate = recordDate.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Extract or generate deterministic official call letter number
      const totalRecs = records?.length || 0;
      const letterCode = Math.max(1, totalRecs - idx).toString().padStart(3, "0");
      const letterNumber = `421.3/BK-SMADAP/${recordDate.getFullYear()}/${letterCode}`;

      return {
        id: `call-${r.id}`,
        counselingRecordId: r.id,
        date: r.counseling_date || r.created_at,
        formattedDate,
        letterNumber,
        studentId: student.id || "",
        studentName: studentProfile?.full_name || "Siswa",
        studentNis: student.nis || "-",
        studentNisn: student.nisn || "-",
        className: student.class_name || "-",
        counselorId: teacher.id || "",
        counselorName: teacherProfile?.full_name || "Muhammad Badrun Barli, S.Pd., Gr",
        counselorNip: teacher.nip || "1997082920252121064",
        counselingType: r.counseling_type || "Bimbingan Kedisiplinan",
        notes: r.notes || "",
        totalViolationPoints: rawPoints,
        totalViolations: vInfo.count,
        totalReductionPoints: reductionPoints,
        effectivePoints,
        disciplineStatus,
        statusColor,
        scheduledDate: r.counseling_date || r.created_at,
        scheduledTime: "09:00",
        location: "Ruang Bimbingan & Konseling (BK) SMAN 2 Pangkep",
        purpose: r.counseling_type || "Konseling Disiplin & Tata Tertib",
        additionalNotes: r.notes,
      };
    });

    const summary: AdminCallLettersSummary = {
      totalLetters: items.length,
      lettersThisMonth,
      studentsInCoaching: coachingStudentIds.size,
      activeCounselors: activeCounselorsCount,
    };

    return {
      summary,
      items,
      academicPeriod: {
        year: academicYear,
        semester: semester.startsWith("Semester") ? semester : `Semester ${semester}`,
      },
    };
  } catch (err: any) {
    console.error("Error in getAdminCallLettersDataAction:", err);
    return defaultResult;
  }
}
