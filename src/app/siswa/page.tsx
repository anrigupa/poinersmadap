import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import StudentDashboardClient from "@/features/student-dashboard/components/StudentDashboardClient";
import { getStudentDashboardData } from "@/features/student-dashboard/actions";

export const metadata = {
  title: "Dashboard Disiplin Siswa - SMADAP POINER",
  description: "Pantau rekam jejak poin pelanggaran, status level disiplin, dan tren bulanan siswa",
};

export default async function SiswaDashboardPage() {
  const session = await requireRole(["siswa", "admin"], "/siswa");

  const currentUser = session.user;
  const dashboardData = await getStudentDashboardData(
    currentUser.id,
    currentUser.nis
  );

  return (
    <DashboardShell user={currentUser} role="siswa">
      <StudentDashboardClient data={dashboardData} />
    </DashboardShell>
  );
}
