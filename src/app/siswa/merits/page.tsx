import { Metadata } from "next";
import { requireRole } from "@/lib/security/guards";
import DashboardShell from "@/components/layout/DashboardShell";
import StudentMeritsClient from "@/features/student-merits/components/StudentMeritsClient";
import { getStudentMeritsData } from "@/features/student-merits/actions";

export const metadata: Metadata = {
  title: "Prestasi & Pemutihan Siswa - SMADAP POINER",
  description:
    "Portal prestasi peserta didik, perolehan merit point, dan audit trail pemutihan poin kedisiplinan SMAN 2 PANGKEP",
};

export default async function SiswaMeritsPage() {
  const session = await requireRole(["siswa", "admin"], "/siswa/merits");
  const currentUser = session.user;

  const meritsData = await getStudentMeritsData(
    currentUser.id,
    currentUser.nis
  );

  return (
    <DashboardShell user={currentUser} role="siswa">
      <StudentMeritsClient data={meritsData} />
    </DashboardShell>
  );
}
