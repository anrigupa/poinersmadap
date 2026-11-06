import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import TeacherDashboardClient from "@/features/teacher-dashboard/components/TeacherDashboardClient";
import { getTeacherDashboardData } from "@/features/teacher-dashboard/actions";
import { getStudentsAction } from "@/features/students/actions";
import { getViolationsAction } from "@/features/rules/actions";
import {
  TeacherDashboardStats,
  TeacherViolationRecord,
  PaginatedResult,
} from "@/features/teacher-dashboard/types";
import { StudentItem } from "@/features/students/types";
import { ViolationItem } from "@/features/rules/types";

export const metadata = {
  title: "Dashboard Guru & BK - SMADAP POINER",
  description: "Dashboard pencatatan pelanggaran, rekap harian & bulanan guru",
};

export default async function GuruDashboardPage() {
  const session = await requireRole(["guru", "admin"], "/guru");

  const teacherUser = session.user;

  // Safe fallback defaults for defensive data loading
  const defaultDashboardData: {
    stats: TeacherDashboardStats;
    recentSubmissions: PaginatedResult<TeacherViolationRecord>;
  } = {
    stats: {
      violationsToday: 0,
      violationsThisMonth: 0,
      totalPersonalSubmissions: 0,
      totalPointsAccrued: 0,
      studentsHandledCount: 0,
    },
    recentSubmissions: {
      items: [],
      totalItems: 0,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    },
  };

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
  const [dashboardResult, studentsResult, rulesResult] = await Promise.allSettled([
    getTeacherDashboardData(teacherUser.id, {
      page: 1,
      pageSize: 10,
    }),
    getStudentsAction({ pageSize: 100, sortBy: "fullName", sortOrder: "asc" }),
    getViolationsAction({ pageSize: 100, sortBy: "code", sortOrder: "asc" }),
  ]);

  const hasPartialError =
    dashboardResult.status === "rejected" ||
    studentsResult.status === "rejected" ||
    rulesResult.status === "rejected";

  if (hasPartialError) {
    console.error("[GuruDashboardPage] Partial dependency failure detected during page render:", {
      dashboardError: dashboardResult.status === "rejected" ? dashboardResult.reason?.message || dashboardResult.reason : null,
      studentsError: studentsResult.status === "rejected" ? studentsResult.reason?.message || studentsResult.reason : null,
      rulesError: rulesResult.status === "rejected" ? rulesResult.reason?.message || rulesResult.reason : null,
    });
  }

  const dashboardData =
    dashboardResult.status === "fulfilled"
      ? dashboardResult.value
      : defaultDashboardData;

  const studentsRes =
    studentsResult.status === "fulfilled"
      ? studentsResult.value
      : defaultStudentsRes;

  const rulesRes =
    rulesResult.status === "fulfilled"
      ? rulesResult.value
      : defaultRulesRes;

  return (
    <DashboardShell user={teacherUser} role="guru">
      <TeacherDashboardClient
        initialStats={dashboardData.stats}
        initialSubmissions={dashboardData.recentSubmissions}
        teacherProfile={teacherUser}
        availableStudents={studentsRes.items}
        availableRules={rulesRes.items}
        hasPartialError={hasPartialError}
      />
    </DashboardShell>
  );
}
