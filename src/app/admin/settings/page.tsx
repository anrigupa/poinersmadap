import { requireRole } from "@/lib/security/guards";
import { getSystemSettingsAction } from "@/features/settings/actions";
import DashboardShell from "@/components/layout/DashboardShell";
import SystemSettingsClient from "@/features/settings/components/SystemSettingsClient";

export const metadata = {
  title: "Pengaturan Sistem - SMADAP POINER",
  description:
    "Konfigurasi tahun ajaran aktif, semester, dan parameter sistem kedisiplinan SMAN 2 PANGKEP",
};

export default async function AdminSettingsPage() {
  const session = await requireRole(["admin"], "/admin/settings");
  const settingsData = await getSystemSettingsAction();

  return (
    <DashboardShell user={session.user} role="admin">
      <SystemSettingsClient
        initialData={settingsData}
        adminName={session.user.fullName}
      />
    </DashboardShell>
  );
}
