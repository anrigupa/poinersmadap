import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import TeacherDashboardClient from "@/features/teacher-dashboard/components/TeacherDashboardClient";
import { getTeacherDashboardData } from "@/features/teacher-dashboard/actions";
import { getStudentsAction } from "@/features/students/actions";
import { getViolationsAction } from "@/features/rules/actions";

export const metadata = {
  title: "Dashboard Guru & BK - SMADAP POINER",
  description: "Dashboard pencatatan pelanggaran, rekap harian & bulanan guru",
};

export default async function GuruDashboardPage() {
  const session = await requireRole(["guru", "admin"], "/guru");

  const teacherUser = session.user;

  // Load teacher dashboard data (STRICT PERSONAL ISOLATION)
  // along with students & rules for the Quick Action modal
  const [dashboardData, studentsRes, rulesRes] = await Promise.all([
    getTeacherDashboardData(teacherUser.id, {
      page: 1,
      pageSize: 10,
    }),
    getStudentsAction({ pageSize: 100, sortBy: "fullName", sortOrder: "asc" }),
    getViolationsAction({ pageSize: 100, sortBy: "code", sortOrder: "asc" }),
  ]);

  return (
    <DashboardShell user={teacherUser} role="guru">
      <TeacherDashboardClient
        initialStats={dashboardData.stats}
        initialSubmissions={dashboardData.recentSubmissions}
        teacherProfile={teacherUser}
        availableStudents={studentsRes.items}
        availableRules={rulesRes.items}
      />
    </DashboardShell>
  );
}
