"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Code2,
  Menu,
  X,
  User,
  ShieldCheck,
  Award,
  LogOut,
  ChevronDown,
} from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setCurrentUser(null);
      router.push("/");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { name: "Hackathons", href: "/hackathons" },
    { name: "Themes", href: "/themes" },
    { name: "Problems", href: "/problems" },
    { name: "Timeline", href: "/timeline" },
    { name: "Rules", href: "/rules" },
    { name: "FAQ", href: "/faq" },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0D1117]/90 backdrop-blur-md border-b border-[#30363D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1">
              HACK<span className="text-red-500">NEXUS</span>
            </span>
            <span className="block text-[10px] tracking-wider uppercase text-muted-foreground font-semibold -mt-1">
              Build. Innovate. Compete.
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <NotificationDropdown />

              {/* Portal shortcuts based on role */}
              {currentUser.role === "SUPER_ADMIN" || currentUser.role === "ADMIN" ? (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin Panel
                </Link>
              ) : currentUser.role === "JUDGE" ? (
                <Link
                  href="/judge"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-colors"
                >
                  <Award className="w-3.5 h-3.5" /> Judge Portal
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
                >
                  Dashboard
                </Link>
              )}

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground hover:border-muted-foreground transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {currentUser.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate text-xs font-medium">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-2xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-xs font-bold text-white">{currentUser.name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {currentUser.email}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded">
                        {currentUser.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="block px-3 py-1.5 text-xs text-muted-foreground hover:text-white hover:bg-muted/40 rounded-lg transition-colors"
                      >
                        Participant Dashboard
                      </Link>
                      {(currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
                        <Link
                          href="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="block px-3 py-1.5 text-xs text-primary hover:bg-primary/10 rounded-lg transition-colors font-medium"
                        >
                          Admin Console
                        </Link>
                      )}
                      {currentUser.role === "JUDGE" && (
                        <Link
                          href="/judge"
                          onClick={() => setProfileOpen(false)}
                          className="block px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors font-medium"
                        >
                          Judge Evaluation
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-border">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2 px-3 py-1.5 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register-team"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                Register Team
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-2">
          {currentUser && <NotificationDropdown />}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-white rounded-lg border border-border"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 py-4 space-y-3">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? "bg-primary/20 text-primary font-bold"
                    : "text-muted-foreground hover:text-white hover:bg-muted/40"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {currentUser ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-semibold bg-primary text-white text-center"
                >
                  Participant Dashboard
                </Link>
                {(currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN") && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-card border border-primary/40 text-primary text-center"
                  >
                    Admin Console
                  </Link>
                )}
                {currentUser.role === "JUDGE" && (
                  <Link
                    href="/judge"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-sm font-semibold bg-card border border-amber-500/40 text-amber-400 text-center"
                  >
                    Judge Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 rounded-lg text-sm font-semibold text-danger border border-danger/30 text-center"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-sm font-medium text-white bg-card border border-border rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register-team"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 text-center text-sm font-semibold text-white bg-primary rounded-lg"
                >
                  Register Team
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
