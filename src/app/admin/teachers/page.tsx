import { requireRole } from "@/lib/security/guards";
import { getTeachersAction } from "@/features/teachers/actions";
import DashboardShell from "@/components/layout/DashboardShell";
import TeacherManagementClient from "@/features/teachers/components/TeacherManagementClient";

export const metadata = {
  title: "Manajemen Data Guru - SMADAP POINER",
  description: "Kelola data guru, penugasan, dan otentikasi login Supabase",
};

export default async function AdminTeachersPage() {
  const session = await requireRole(["admin"], "/admin/teachers");

  const initialTeachers = await getTeachersAction({
    page: 1,
    pageSize: 10,
    sortBy: "fullName",
    sortOrder: "asc",
  });

  return (
    <DashboardShell user={session.user} role="admin">
      <TeacherManagementClient initialTeachers={initialTeachers} />
    </DashboardShell>
  );
}
