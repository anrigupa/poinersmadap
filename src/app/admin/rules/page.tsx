import { requireRole } from "@/lib/security/guards";
import { getCategoriesAction, getViolationsAction } from "@/features/rules/actions";
import DashboardShell from "@/components/layout/DashboardShell";
import ViolationManagementClient from "@/features/rules/components/ViolationManagementClient";

export const metadata = {
  title: "Katalog Aturan Pelanggaran - SMADAP POINER",
  description: "Manajemen kategori dan master tata tertib pelanggaran siswa",
};

export default async function AdminRulesPage() {
  const session = await requireRole(["admin"], "/admin/rules");

  const [categories, initialViolations] = await Promise.all([
    getCategoriesAction(),
    getViolationsAction({ page: 1, pageSize: 10, sortBy: "points", sortOrder: "asc" }),
  ]);

  return (
    <DashboardShell user={session.user} role="admin">
      <ViolationManagementClient
        initialCategories={categories}
        initialViolations={initialViolations}
      />
    </DashboardShell>
  );
}
