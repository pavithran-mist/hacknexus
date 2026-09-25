import { getCurrentUser } from "@/lib/auth";
import AdminShell from "@/components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If user is not logged in or doesn't have administrative clearance,
  // render the children directly (e.g. /admin/login) to prevent infinite redirect loops.
  if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN")) {
    return <>{children}</>;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
