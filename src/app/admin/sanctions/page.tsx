import { redirect } from "next/navigation";

export default function AdminSanctionsRedirectPage() {
  redirect("/admin/letters");
}
