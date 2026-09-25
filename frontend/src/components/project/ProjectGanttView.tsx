"use client";

import React from "react";
import { Column } from "@/types/project";
import { useLanguage } from "@/hooks/useLanguage";
import { GanttChart, Calendar, CheckCircle2, Clock } from "lucide-react";

interface ProjectGanttViewProps {
  columns: Column[];
}

export function ProjectGanttView({ columns }: ProjectGanttViewProps) {
  const { t } = useLanguage();
  const allTasks = columns.flatMap((col) => col.tasks);

  return (
    <main className="flex-1 p-6 md:p-8 space-y-6 animate-fade-in w-full">

      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] overflow-x-auto shadow-xs">
        <div className="min-w-[800px] space-y-3">
          <div className="grid grid-cols-12 gap-3 text-[11px] font-bold text-[var(--muted-foreground)] pb-3 border-b border-[var(--card-border)] uppercase tracking-wider">
            <div className="col-span-4">Task Title</div>
            <div className="col-span-2 text-center">Start Date</div>
            <div className="col-span-2 text-center">Due Date</div>
            <div className="col-span-4 text-center">Schedule Timeline</div>
          </div>

          {allTasks.map((task, idx) => (
            <div
              key={task.id}
              className="grid grid-cols-12 gap-3 items-center text-xs py-3 border-b border-[var(--card-border)]/50 last:border-0 hover:bg-[var(--input-bg)]/40 px-2 rounded-xl transition-all"
            >
              <div className="col-span-4 font-semibold text-[var(--foreground)] truncate flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                <span className="truncate">{task.title}</span>
              </div>
              <div className="col-span-2 text-center text-[var(--muted-foreground)] text-[11px] tabular-nums font-medium">
                {task.start_date || "2026-09-20"}
              </div>
              <div className="col-span-2 text-center text-[var(--muted-foreground)] text-[11px] tabular-nums font-medium">
                {task.due_date || "2026-09-30"}
              </div>
              <div className="col-span-4 px-2">
                <div className="h-5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden relative border border-[var(--card-border)] p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx % 3 === 0
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500"
                        : idx % 3 === 1
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    }`}
                    style={{ width: `${(idx + 3) * 20}%`, marginLeft: `${idx * 12}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
