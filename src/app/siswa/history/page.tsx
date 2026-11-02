import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import StudentViolationHistoryClient from "@/features/student-history/components/StudentViolationHistoryClient";
import { getStudentViolationHistoryAction } from "@/features/student-history/actions";

export const metadata = {
  title: "Riwayat Pelanggaran Siswa - SMADAP POINER",
  description: "Arsip lengkap riwayat catatan pelanggaran tata tertib dan beban akumulasi poin siswa",
};

export default async function StudentViolationHistoryPage() {
  const session = await requireRole(["siswa", "admin"], "/siswa/history");

  const initialData = await getStudentViolationHistoryAction({
    page: 1,
    pageSize: 10,
    sortBy: "incidentDate",
    sortOrder: "desc",
  });

  return (
    <DashboardShell user={session.user} role="siswa">
      <StudentViolationHistoryClient initialData={initialData} />
    </DashboardShell>
  );
}
