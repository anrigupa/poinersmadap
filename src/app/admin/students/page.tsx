import { requireRole } from "@/lib/security/guards";
import { getStudentsAction, getStudentSummaryAction } from "@/features/students/actions";
import DashboardShell from "@/components/layout/DashboardShell";
import StudentManagementClient from "@/features/students/components/StudentManagementClient";

export const metadata = {
  title: "Manajemen Data Siswa - SMADAP POINER",
  description: "Kelola data siswa, NISN, kelas terstandar Kurikulum Merdeka, pemantauan poin dan akun Supabase Auth",
};

export default async function AdminStudentsPage() {
  const session = await requireRole(["admin"], "/admin/students");

  const [initialStudents, summary] = await Promise.all([
    getStudentsAction({
      page: 1,
      pageSize: 10,
      sortBy: "fullName",
      sortOrder: "asc",
    }),
    getStudentSummaryAction(),
  ]);

  return (
    <DashboardShell user={session.user} role="admin">
      <StudentManagementClient
        initialStudents={initialStudents}
        initialSummary={summary}
      />
    </DashboardShell>
  );
}
