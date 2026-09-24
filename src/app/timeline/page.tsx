import { prisma } from "@/lib/prisma";
import { Clock, Calendar, CheckCircle2, CircleDot } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TimelinePage() {
  const events = await prisma.timelineEvent.findMany({
    orderBy: { order: "asc" },
    include: { hackathon: { select: { name: true } } },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Event Schedule</h1>
        <p className="text-sm text-muted-foreground">
          Follow the sprint roadmap from initial registration to grand finale judging.
        </p>
      </div>

      <div className="relative border-l-2 border-border/80 ml-4 sm:ml-32 space-y-10 pl-6 sm:pl-10">
        {events.map((event, idx) => (
          <div key={event.id} className="relative group">
            {/* Status dot */}
            <div
              className={`absolute -left-[31px] sm:-left-[47px] top-1.5 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                event.status === "COMPLETED"
                  ? "bg-emerald-500 border-emerald-400 text-white"
                  : event.status === "ACTIVE"
                  ? "bg-primary border-teal-300 text-white animate-pulse"
                  : "bg-card border-border text-muted-foreground"
              }`}
            >
              {event.status === "COMPLETED" ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <CircleDot className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Date badge on left for desktop */}
            <div className="hidden sm:block absolute -left-36 top-1 text-right w-24">
              <span className="text-xs font-mono font-bold text-primary block">
                {event.date}
              </span>
              {event.time && (
                <span className="text-[11px] text-muted-foreground block font-mono">
                  {event.time}
                </span>
              )}
            </div>

            {/* Card Content */}
            <div className="bg-card border border-border rounded-xl p-5 group-hover:border-primary/50 transition-colors space-y-2">
              <div className="flex sm:hidden items-center gap-2 text-xs font-mono text-primary font-bold mb-1">
                <span>{event.date}</span>
                {event.time && <span>• {event.time}</span>}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-white">{event.title}</h3>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    event.status === "COMPLETED"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : event.status === "ACTIVE"
                      ? "bg-primary/20 text-teal-300 border border-primary/30"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
