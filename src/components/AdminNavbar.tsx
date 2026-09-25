"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Shield, LogOut, Bell, ExternalLink, Menu } from "lucide-react";
import GlobalSearchModal from "./GlobalSearchModal";
import NotificationDropdown from "./NotificationDropdown";

interface AdminNavbarProps {
  user: any;
  onToggleMobileMenu?: () => void;
}

export default function AdminNavbar({ user, onToggleMobileMenu }: AdminNavbarProps) {
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <header className="h-16 bg-[#0D1117] border-b border-[#30363D] px-3 sm:px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Menu Hamburger Button */}
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-card border border-border cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Global Search Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-card border border-[#30363D] text-xs text-muted-foreground hover:text-white hover:border-red-500/50 transition-colors w-36 xs:w-48 sm:w-72 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span className="truncate">Search records...</span>
            <kbd className="hidden sm:inline-block ml-auto font-mono text-[10px] bg-[#0D1117] border border-[#30363D] px-1.5 py-0.5 rounded text-muted-foreground">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-4">
          <NotificationDropdown />

          <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#30363D]">
            <div className="w-8 h-8 rounded-full bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center font-bold text-xs flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:block text-left">
              <span className="text-xs font-bold text-white block leading-tight truncate max-w-[120px]">
                {user.name}
              </span>
              <span className="text-[10px] font-mono text-red-400 block">
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
