"use client";

import { useState } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";

export default function AdminShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#0B0F19] text-[#F9FAFB] overflow-x-hidden">
      {/* Desktop Sidebar (visible on md screens and larger) */}
      <div className="hidden md:flex flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer (Sheet with animated backdrop on smaller screens) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sliding drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0D1117] border-r border-[#30363D] shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            <AdminSidebar
              isMobile={true}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full">
        <AdminNavbar
          user={user}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
