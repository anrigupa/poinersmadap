import { Metadata } from "next";
import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import TeacherHistoryClient from "@/features/teacher-dashboard/components/TeacherHistoryClient";
import { getTeacherDashboardData } from "@/features/teacher-dashboard/actions";

export const metadata: Metadata = {
  title: "Riwayat Laporan Anda - SMADAP POINER",
  description: "Daftar seluruh laporan pelanggaran disiplin siswa yang diajukan oleh guru",
};

export default async function GuruHistoryPage() {
  const session = await requireRole(["guru", "admin"], "/guru/history");
  const teacherUser = session.user;

  // Strict personal data isolation: load submissions for this teacher
  const data = await getTeacherDashboardData(teacherUser.id, {
    page: 1,
    pageSize: 10,
  });

  return (
    <DashboardShell user={teacherUser} role="guru">
      <TeacherHistoryClient
        initialSubmissions={data.recentSubmissions}
        teacherProfile={teacherUser}
      />
    </DashboardShell>
  );
}
