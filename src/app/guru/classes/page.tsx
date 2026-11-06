import { Metadata } from "next";
import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import HomeroomClassClient from "@/features/teacher-dashboard/components/HomeroomClassClient";
import { getHomeroomClassDataAction } from "@/features/teacher-dashboard/actions";

export const metadata: Metadata = {
  title: "Kelas Binaan - SMADAP POINER",
  description: "Daftar siswa dan rekap poin kepatuhan tata tertib kelas binaan wali kelas",
};

export default async function GuruHomeroomClassesPage() {
  const session = await requireRole(["guru", "admin"], "/guru/classes");
  const homeroomData = await getHomeroomClassDataAction(session.user.id);

  return (
    <DashboardShell user={session.user} role="guru">
      <HomeroomClassClient initialData={homeroomData} />
    </DashboardShell>
  );
}
