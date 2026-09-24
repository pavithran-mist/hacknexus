"use client";

import { useState, useEffect } from "react";

interface CountdownProps {
  submissionDeadline: string;
  hackathonStartDate: string;
}

export default function CountdownTimer({
  submissionDeadline,
  hackathonStartDate,
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const target = new Date(submissionDeadline).getTime();

    const calculate = () => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [submissionDeadline]);

  if (timeLeft.isPast) {
    return (
      <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-rose-300 text-center font-bold text-sm">
        Submission Deadline Has Passed
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-[#111827] border border-border p-2.5 rounded-lg">
          <span className="font-mono text-xl font-extrabold text-white block">
            {timeLeft.days}
          </span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Days</span>
        </div>

        <div className="bg-[#111827] border border-border p-2.5 rounded-lg">
          <span className="font-mono text-xl font-extrabold text-white block">
            {timeLeft.hours}
          </span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Hours</span>
        </div>

        <div className="bg-[#111827] border border-border p-2.5 rounded-lg">
          <span className="font-mono text-xl font-extrabold text-white block">
            {timeLeft.minutes}
          </span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Mins</span>
        </div>

        <div className="bg-[#111827] border border-border p-2.5 rounded-lg">
          <span className="font-mono text-xl font-extrabold text-teal-400 block animate-pulse">
            {timeLeft.seconds}
          </span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Secs</span>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center">
        Counting down to Final Code Freeze
      </p>
    </div>
  );
}
