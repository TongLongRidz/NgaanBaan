"use client";

import React from "react";
import { Column } from "@/types/project";
import { useLanguage } from "@/hooks/useLanguage";
import { ListTodo, CheckCircle2, Clock, TrendingUp, BarChart2, PieChart } from "lucide-react";

interface ProjectSummaryViewProps {
  columns: Column[];
}

export function ProjectSummaryView({ columns }: ProjectSummaryViewProps) {
  const { t } = useLanguage();
  const allTasks = columns.flatMap((col) => col.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = columns.find((c) => c.name === "Done")?.tasks.length || 0;
  const reviewTasks = columns.find((c) => c.name === "Review")?.tasks.length || 0;
  const inProgressTasks = columns.find((c) => c.name === "In Progress")?.tasks.length || 0;
  const todoTasks = columns.find((c) => c.name === "To Do")?.tasks.length || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const C = 376.991; // Circumference for r=60
  const doneDash = totalTasks > 0 ? (completedTasks / totalTasks) * C : 0;
  const reviewDash = totalTasks > 0 ? (reviewTasks / totalTasks) * C : 0;
  const inProgressDash = totalTasks > 0 ? (inProgressTasks / totalTasks) * C : 0;
  const todoDash = totalTasks > 0 ? (todoTasks / totalTasks) * C : 0;

  return (
    <main className="flex-1 p-6 md:p-8 space-y-6 w-full animate-fade-in">

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {t("project.total_tasks")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ListTodo className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">{totalTasks}</p>
        </div>

        {/* Completed */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {t("project.completed")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">{completedTasks}</p>
        </div>

        {/* Review */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {t("project.review")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <BarChart2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">{reviewTasks}</p>
        </div>

        {/* In Progress */}
        <div className="p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              {t("project.in_progress")}
            </span>
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">{inProgressTasks}</p>
        </div>
      </div>

      {/* Overall Project Health - Pie / Donut Chart */}
      <div className="p-6 md:p-8 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-6 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <PieChart className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-base text-[var(--foreground)]">{t("project.health_title")}</h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tabular-nums">
            {completedTasks} / {totalTasks} {t("project.tasks_completed")}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center pt-2 relative z-10">
          {/* Donut / Pie Chart SVG Render with Solid Vibrant Colors and Animations */}
          <div className="md:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r="60"
                  className="stroke-[var(--input-bg)]"
                  strokeWidth="16"
                  fill="transparent"
                />
                
                {totalTasks > 0 ? (
                  <g className="transition-all duration-500">
                    {/* 1. Done Slice (Solid Emerald) */}
                    {completedTasks > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        stroke="#10b981"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${doneDash} ${C}`}
                        strokeDashoffset="0"
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out hover:stroke-[20] cursor-pointer"
                      />
                    )}

                    {/* 2. Review Slice (Solid Purple) */}
                    {reviewTasks > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        stroke="#a855f7"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${reviewDash} ${C}`}
                        strokeDashoffset={`-${doneDash}`}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out hover:stroke-[20] cursor-pointer"
                      />
                    )}

                    {/* 3. In Progress Slice (Solid Sky Blue) */}
                    {inProgressTasks > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        stroke="#0ea5e9"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${inProgressDash} ${C}`}
                        strokeDashoffset={`-${doneDash + reviewDash}`}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out hover:stroke-[20] cursor-pointer"
                      />
                    )}

                    {/* 4. To Do Slice (Solid Amber) */}
                    {todoTasks > 0 && (
                      <circle
                        cx="80"
                        cy="80"
                        r="60"
                        stroke="#f59e0b"
                        strokeWidth="16"
                        fill="transparent"
                        strokeDasharray={`${todoDash} ${C}`}
                        strokeDashoffset={`-${doneDash + reviewDash + inProgressDash}`}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-out hover:stroke-[20] cursor-pointer"
                      />
                    )}
                  </g>
                ) : (
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    stroke="#94a3b8"
                    strokeWidth="16"
                    fill="transparent"
                    strokeDasharray={`${C} ${C}`}
                    className="opacity-25"
                  />
                )}
              </svg>

              {/* Center Interactive Stats Badge */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none transition-transform duration-300 hover:scale-105">
                <span className="text-3xl font-extrabold text-[var(--foreground)] tabular-nums tracking-tight">
                  {completionPercentage}%
                </span>
                <span className="text-[11px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mt-0.5">
                  {t("project.completed")}
                </span>
              </div>
            </div>
          </div>

          {/* Pie Chart Legend Breakdown Cards with Solid Indicator Dots */}
          <div className="md:col-span-7 space-y-3">
            {/* Done */}
            <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-3.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-sm font-bold text-[var(--foreground)]">{t("project.completed")}</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--foreground)] tabular-nums">{completedTasks} tasks</span>
            </div>

            {/* Review */}
            <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-3.5 rounded-full bg-purple-500 shrink-0" />
                <span className="text-sm font-bold text-[var(--foreground)]">{t("project.review")}</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--foreground)] tabular-nums">{reviewTasks} tasks</span>
            </div>

            {/* In Progress */}
            <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-3.5 rounded-full bg-sky-500 shrink-0" />
                <span className="text-sm font-bold text-[var(--foreground)]">{t("project.in_progress")}</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--foreground)] tabular-nums">{inProgressTasks} tasks</span>
            </div>

            {/* To Do */}
            <div className="p-3.5 rounded-xl bg-[var(--background)] border border-[var(--card-border)] flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="h-3.5 w-3.5 rounded-full bg-amber-500 shrink-0" />
                <span className="text-sm font-bold text-[var(--foreground)]">{t("project.to_do")}</span>
              </div>
              <span className="text-sm font-extrabold text-[var(--foreground)] tabular-nums">{todoTasks} tasks</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
