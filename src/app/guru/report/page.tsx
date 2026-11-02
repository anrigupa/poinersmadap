import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import RecordViolationWorkflowClient from "@/features/violations/components/RecordViolationWorkflowClient";
import { getStudentsAction } from "@/features/students/actions";
import { getViolationsAction } from "@/features/rules/actions";

export const metadata = {
  title: "Input Pelanggaran Siswa - SMADAP POINER",
  description: "Formulir 4 tahap pencatatan pelanggaran siswa dan kalkulasi akumulasi poin kedisiplinan",
};

export default async function RecordViolationPage() {
  const session = await requireRole(["guru", "admin"], "/guru/report");

  const [studentsRes, rulesRes] = await Promise.all([
    getStudentsAction({ pageSize: 100, sortBy: "fullName", sortOrder: "asc" }),
    getViolationsAction({ pageSize: 100, sortBy: "code", sortOrder: "asc" }),
  ]);

  return (
    <DashboardShell user={session.user} role="guru">
      <RecordViolationWorkflowClient
        students={studentsRes.items}
        rules={rulesRes.items}
        currentUser={session.user}
      />
    </DashboardShell>
  );
}
