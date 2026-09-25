import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

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

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-[#F9FAFB]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar user={user} />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
