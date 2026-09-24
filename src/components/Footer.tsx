import Link from "next/link";
import { Code2, MessageSquare, Shield } from "lucide-react";
import { GithubIcon, TwitterIcon, LinkedinIcon } from "@/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="bg-[#0D1117] border-t border-[#30363D] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="md:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-rose-600 flex items-center justify-center text-white shadow-md shadow-red-600/30">
                <Code2 className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white">
                HACK<span className="text-red-500">NEXUS</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enterprise hackathon management platform powering real-world innovation, collaborative sprints, and rigorous evaluation.
            </p>
            <div className="flex items-center gap-3 pt-2 text-muted-foreground">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <GithubIcon className="w-4 h-4" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
              <a href="https://discord.gg" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Hackathon</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/themes" className="hover:text-white transition-colors">Competition Themes</Link></li>
              <li><Link href="/problems" className="hover:text-white transition-colors">Problem Statements</Link></li>
              <li><Link href="/timeline" className="hover:text-white transition-colors">Event Timeline</Link></li>
              <li><Link href="/rules" className="hover:text-white transition-colors">Rules & Guidelines</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Portals</h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li><Link href="/register-team" className="hover:text-primary transition-colors font-medium">Team Registration</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Participant Dashboard</Link></li>
              <li><Link href="/judge" className="hover:text-amber-400 transition-colors">Jury Evaluation Portal</Link></li>
              <li><Link href="/admin/login" className="hover:text-white transition-colors flex items-center gap-1"><Shield className="w-3 h-3" /> Admin Console</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Helpdesk & Contact</Link></li>
            </ul>
          </div>

          {/* System Status & Stack */}
          <div className="space-y-2 text-xs text-muted-foreground">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3">System Verification</h4>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-[11px]">Database: Active & Synced</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Architecture: Next.js 14 App Router, PostgreSQL / SQLite, Prisma ORM, Zod, and Recharts.
            </p>
            <div className="pt-2">
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-card border border-border text-muted-foreground">
                v1.0.0-production
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© 2026 HackNexus. All rights reserved. Built for builders.</p>
          <div className="flex items-center gap-4">
            <Link href="/rules" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/rules" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
