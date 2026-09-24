"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ActivityNotification from "./ActivityNotification";

export default function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#111827] text-[#F9FAFB]">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ActivityNotification />
    </div>
  );
}
