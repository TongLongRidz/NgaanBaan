"use client";

import React from "react";
import { Column } from "@/types/project";
import { useLanguage } from "@/hooks/useLanguage";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectCalendarViewProps {
  columns: Column[];
}

export function ProjectCalendarView({ columns }: ProjectCalendarViewProps) {
  const { t } = useLanguage();
  const allTasks = columns.flatMap((col) => col.tasks);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-6 animate-fade-in w-full">
      <div className="flex flex-wrap items-center justify-end gap-4">

        <div className="flex items-center gap-2 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1 text-xs shadow-xs">
          <button className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="font-bold px-3 text-[var(--foreground)]">September 2026</span>
          <button className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs">
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--muted-foreground)] pb-3 border-b border-[var(--card-border)] uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-2 mt-3 text-xs">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
            const isToday = day === 25;
            return (
              <div
                key={day}
                className={`min-h-[90px] p-2 rounded-xl border transition-all flex flex-col justify-between ${
                  isToday
                    ? "border-indigo-500 bg-indigo-500/10 shadow-xs"
                    : "border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-semibold ${isToday ? "text-indigo-400 font-bold" : "text-[var(--muted-foreground)]"}`}>
                    {day}
                  </span>
                  {isToday && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  )}
                </div>

                {day === 24 && (
                  <span className="text-[10px] p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 truncate font-semibold shadow-xs">
                    Landing Page AOS
                  </span>
                )}
                {day === 25 && (
                  <span className="text-[10px] p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 truncate font-semibold shadow-xs">
                    i18n Context Support
                  </span>
                )}
                {day === 26 && (
                  <span className="text-[10px] p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 truncate font-semibold shadow-xs">
                    SideNavbar Redesign
                  </span>
                )}
                {day === 28 && (
                  <span className="text-[10px] p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 truncate font-semibold shadow-xs">
                    Setup Next.js 15
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
