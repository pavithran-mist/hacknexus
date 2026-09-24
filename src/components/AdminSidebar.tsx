"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Trophy,
  Layers,
  FileCode,
  Users,
  CreditCard,
  Code2,
  Send,
  Award,
  Bell,
  Calendar,
  Globe,
  Download,
  ScrollText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Hackathons", href: "/admin/hackathons", icon: Trophy },
  { name: "Themes", href: "/admin/themes", icon: Layers },
  { name: "Problems", href: "/admin/problems", icon: FileCode },
  { name: "Teams", href: "/admin/teams", icon: Users },
  { name: "Payments", href: "/admin/payments", icon: CreditCard },
  { name: "Owner Account & UPI", href: "/admin/owner-account", icon: CreditCard },
  { name: "Prototypes", href: "/admin/prototypes", icon: Code2 },
  { name: "Submissions", href: "/admin/submissions", icon: Send },
  { name: "Judges", href: "/admin/judges", icon: Award },
  { name: "Results & Certificates", href: "/admin/results", icon: Trophy },
  { name: "Announcements", href: "/admin/announcements", icon: Bell },
  { name: "Timeline", href: "/admin/timeline", icon: Calendar },
  { name: "Website CMS", href: "/admin/content", icon: Globe },
  { name: "Export & Import", href: "/admin/export-import", icon: Download },
  { name: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
  { name: "Platform Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-[#0D1117] border-r border-border min-h-screen flex flex-col transition-all duration-300 z-30 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                HACKNEXUS
              </span>
              <span className="text-[9px] uppercase font-bold text-red-500 tracking-wider block">
                Admin Console
              </span>
            </div>
          </Link>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-card ml-auto transition-colors"
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-white hover:bg-card"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Bottom return link */}
      <div className="p-3 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-card transition-colors"
        >
          <Globe className="w-4 h-4" />
          {!collapsed && <span>Public Website →</span>}
        </Link>
      </div>
    </aside>
  );
}
