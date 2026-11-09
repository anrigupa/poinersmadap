import { ReactNode } from "react";
import { requireRole } from "@/lib/security/guards";

/**
 * Root Admin Layout Guard
 * Enforces strict server-side authorization (`role === "admin"`) across the entire
 * `/admin` and `/admin/*` route subtree before any child page or component can render.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireRole(["admin"], "/admin");

  return <>{children}</>;
}
