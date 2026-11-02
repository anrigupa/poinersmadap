import { requireRole } from "@/lib/security/guards";
import { getAdminOverviewData } from "@/features/admin/actions/overviewActions";
import DashboardShell from "@/components/layout/DashboardShell";
import AdminOverviewClient from "@/features/admin/components/AdminOverviewClient";

export const metadata = {
  title: "Dashboard Administrator - SMADAP POINER",
  description: "Overview eksekutif kedisiplinan dan rekapitulasi poin pelanggaran siswa",
};

export default async function AdminDashboardPage() {
  const session = await requireRole(["admin"], "/admin");

  // Fetch metrics from Supabase or structured server fallback
  const overviewData = await getAdminOverviewData();

  return (
    <DashboardShell user={session.user} role="admin">
      <AdminOverviewClient
        initialData={overviewData}
        adminName={session.user.fullName}
      />
    </DashboardShell>
  );
}
