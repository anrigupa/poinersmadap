import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import RecordViolationWorkflowClient from "@/features/violations/components/RecordViolationWorkflowClient";
import { getStudentsAction } from "@/features/students/actions";
import { getViolationsAction } from "@/features/rules/actions";
import { PaginatedResult } from "@/features/teacher-dashboard/types";
import { StudentItem } from "@/features/students/types";
import { ViolationItem } from "@/features/rules/types";

export const metadata = {
  title: "Input Pelanggaran Siswa - SMADAP POINER",
  description: "Formulir 4 tahap pencatatan pelanggaran siswa dan kalkulasi akumulasi poin kedisiplinan",
};

export default async function RecordViolationPage() {
  const session = await requireRole(["guru", "admin"], "/guru/report");

  // Safe fallback defaults for defensive data loading
  const defaultStudentsRes: PaginatedResult<StudentItem> = {
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 100,
    totalPages: 1,
  };

  const defaultRulesRes: PaginatedResult<ViolationItem> = {
    items: [],
    totalItems: 0,
    page: 1,
    pageSize: 100,
    totalPages: 1,
  };

  // Defensive data loading: Promise.allSettled protects against any single failed request
  const [studentsResult, rulesResult] = await Promise.allSettled([
    getStudentsAction({ pageSize: 100, sortBy: "fullName", sortOrder: "asc" }),
    getViolationsAction({ pageSize: 100, sortBy: "code", sortOrder: "asc" }),
  ]);

  const studentsFailed = studentsResult.status === "rejected";
  const rulesFailed = rulesResult.status === "rejected";
  const hasPartialError = studentsFailed || rulesFailed;

  if (hasPartialError) {
    console.error("[RecordViolationPage] Partial dependency failure detected during page render:", {
      studentsError: studentsResult.status === "rejected" ? studentsResult.reason?.message || studentsResult.reason : null,
      rulesError: rulesResult.status === "rejected" ? rulesResult.reason?.message || rulesResult.reason : null,
    });
  }

  const studentsRes =
    studentsResult.status === "fulfilled"
      ? studentsResult.value
      : defaultStudentsRes;

  const rulesRes =
    rulesResult.status === "fulfilled"
      ? rulesResult.value
      : defaultRulesRes;

  return (
    <DashboardShell user={session.user} role="guru">
      <RecordViolationWorkflowClient
        students={studentsRes.items}
        rules={rulesRes.items}
        currentUser={session.user}
        hasPartialError={hasPartialError}
        studentsFailed={studentsFailed}
        rulesFailed={rulesFailed}
      />
    </DashboardShell>
  );
}
