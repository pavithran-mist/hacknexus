import { prisma } from "@/lib/prisma";
import { Mail, Phone, MapPin, MessageSquare, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const content = await prisma.websiteContent.findFirst({
    include: { hackathon: true },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Contact & Support</h1>
        <p className="text-sm text-muted-foreground">
          Have queries regarding registration, mentoring, or partnership? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3 text-primary">
              <Mail className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Email Inquiries</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {content?.contactEmail || "contact@hacknexus.io"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3 text-blue-400">
              <Phone className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Helpline</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {content?.contactPhone || "+91 80000 12345"}
            </p>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-3 text-amber-400">
              <MapPin className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider text-white">Innovation Hub</span>
            </div>
            <p className="text-xs text-muted-foreground">
              IIT Bombay Innovation Park, Powai, Mumbai, Maharashtra 400076
            </p>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-2 bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" /> Send us a message
          </h3>

          <form className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Your Name</label>
                <input
                  type="text"
                  placeholder="Aarav Sharma"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Your Email</label>
                <input
                  type="email"
                  placeholder="name@university.edu"
                  className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Subject</label>
              <input
                type="text"
                placeholder="Question regarding problem statement selection"
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="text-xs text-muted-foreground block mb-1.5 font-medium">Message</label>
              <textarea
                rows={4}
                placeholder="Provide detailed information regarding your inquiry..."
                className="w-full bg-[#111827] border border-border rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="button"
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Message</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
