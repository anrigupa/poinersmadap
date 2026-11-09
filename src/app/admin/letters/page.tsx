import { requireRole } from "@/lib/security/guards";
import { getAdminCallLettersDataAction } from "@/features/admin/actions/letterActions";
import DashboardShell from "@/components/layout/DashboardShell";
import AdminCallLettersClient from "@/features/admin/components/AdminCallLettersClient";

export const metadata = {
  title: "Surat Panggilan Orang Tua - SMADAP POINER",
  description:
    "Monitoring naskah dinas dan rekapitulasi seluruh surat panggilan orang tua / wali berbasis bimbingan konseling dan tata tertib kedisiplinan siswa",
};

export default async function AdminCallLettersPage() {
  const session = await requireRole(["admin"], "/admin/letters");
  const callLettersData = await getAdminCallLettersDataAction();

  return (
    <DashboardShell user={session.user} role="admin">
      <AdminCallLettersClient initialData={callLettersData} />
    </DashboardShell>
  );
}
