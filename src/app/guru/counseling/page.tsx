import { Metadata } from "next";
import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import CounselorDashboardClient from "@/features/counseling/components/CounselorDashboardClient";
import { getCounselorDashboardDataAction } from "@/features/counseling/actions";

export const metadata: Metadata = {
  title: "Konseling & Pembinaan (BK) - SMADAP POINER",
  description: "Layanan bimbingan konseling, pembinaan budi pekerti, dan manajemen pengurangan poin disiplin siswa",
};

export default async function GuruCounselingPage() {
  const session = await requireRole(["guru", "admin"], "/guru/counseling");
  const dashboardData = await getCounselorDashboardDataAction();

  return (
    <DashboardShell user={session.user} role="guru">
      <CounselorDashboardClient initialData={dashboardData} />
    </DashboardShell>
  );
}
