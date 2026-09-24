import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";
import AdminNavbar from "@/components/AdminNavbar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // If not logged in, redirect to admin login
  if (!user) {
    redirect("/admin/login");
  }

  // If role is not admin, redirect
  if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
    redirect("/admin/login?error=unauthorized");
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
