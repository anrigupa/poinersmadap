import { Metadata } from "next";
import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import TeacherProfileClient from "@/features/teacher-dashboard/components/TeacherProfileClient";
import { getTeacherDashboardData } from "@/features/teacher-dashboard/actions";
import { getSystemSettingsAction } from "@/features/settings/actions";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Profil Guru - SMADAP POINER",
  description: "Informasi profil pendidik, status penugasan wali kelas, dan kontribusi bimbingan disiplin siswa SMAN 2 Pangkep",
};

export default async function GuruProfilePage() {
  const session = await requireRole(["guru", "admin"], "/guru/profile");
  const teacherUser = session.user;

  // Fetch reporting statistics and latest 5 reports for this teacher
  const [dashboardData, settingsData] = await Promise.all([
    getTeacherDashboardData(teacherUser.id, {
      page: 1,
      pageSize: 5,
    }),
    getSystemSettingsAction().catch(() => null),
  ]);

  const academicYear =
    settingsData?.activeSetting?.academicYear
      ? `${settingsData.activeSetting.academicYear} (${settingsData.activeSetting.semester || "Ganjil"})`
      : "2026/2027 (Ganjil)";

  // Fetch latest teacher metadata if available from DB
  const enrichedTeacher = { ...teacherUser };
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (supabaseUrl && supabaseUrl !== "https://placeholder-project.supabase.co") {
    try {
      const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
        ? createAdminClient()
        : await createClient();

      const { data: teacherRecord } = await supabase
        .from("teachers")
        .select("id, nip, teacher_type, specialization, assigned_class, phone_number")
        .or(`profile_id.eq.${teacherUser.id},id.eq.${teacherUser.id}`)
        .maybeSingle();

      if (teacherRecord) {
        enrichedTeacher.teacherId = teacherRecord.id;
        enrichedTeacher.nip = teacherRecord.nip || enrichedTeacher.nip;
        enrichedTeacher.teacherType = (teacherRecord.teacher_type as any) || enrichedTeacher.teacherType;
        enrichedTeacher.specialization = teacherRecord.specialization || enrichedTeacher.specialization;
        enrichedTeacher.assignedClass = teacherRecord.assigned_class || enrichedTeacher.assignedClass;
        enrichedTeacher.phoneNumber = teacherRecord.phone_number || enrichedTeacher.phoneNumber;
      }
    } catch {
      // Fallback gracefully to session values
    }
  }

  return (
    <DashboardShell user={enrichedTeacher} role="guru">
      <TeacherProfileClient
        teacher={enrichedTeacher}
        stats={dashboardData.stats}
        recentActivity={dashboardData.recentSubmissions.items}
        academicYear={academicYear}
      />
    </DashboardShell>
  );
}
