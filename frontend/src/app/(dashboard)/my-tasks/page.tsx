"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";
import {
  CheckCircle2,
  Circle,
  Clock,
  UserCheck,
  CheckCheck,
  ChevronRight,
  CheckSquare,
  AlertCircle,
  Calendar
} from "lucide-react";

interface Subtask {
  id: string;
  title: string;
  is_completed: boolean;
}

export interface TaskItem {
  id: string;
  board_id: string;
  board_name: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string;
  is_overdue?: boolean;
  is_today?: boolean;
  is_completed: boolean;
  subtasks: Subtask[];
}

export const INITIAL_MY_TASKS: TaskItem[] = [
  {
    id: "t1111111-1111-4111-8111-111111111111",
    board_id: "a1b2c3d4-e5f6-47a8-9012-3456789abcde",
    board_name: "Sprint Workspace",
    title: "Design Modern Kanban Board Interface & Component Tokens",
    description: "Create pixel-perfect responsive layouts with Tailwind CSS, clean accessibility, and CSS Variables theme system.",
    priority: "urgent",
    due_date: "Today, 5:00 PM",
    is_today: true,
    is_completed: false,
    subtasks: [
      { id: "s1111111-1111-4111-8111-111111111111", title: "Setup CSS Variables in globals.css", is_completed: true },
      { id: "s1111111-1111-4111-8111-111111111112", title: "Refactor TopNavbar & SideNavbar", is_completed: true },
      { id: "s1111111-1111-4111-8111-111111111113", title: "Build My Tasks dedicated dashboard view", is_completed: false }
    ]
  },
  {
    id: "t2222222-2222-4222-8222-222222222222",
    board_id: "a1b2c3d4-e5f6-47a8-9012-3456789abcde",
    board_name: "Sprint Workspace",
    title: "PostgreSQL & MongoDB Dual-Database Schema Setup",
    description: "Configure relational tables for boards/tasks and NoSQL collections for audit logs, notifications, and chat.",
    priority: "high",
    due_date: "Yesterday (Overdue)",
    is_overdue: true,
    is_completed: false,
    subtasks: [
      { id: "s2222222-2222-4222-8222-222222222221", title: "Draft note.md database ERD architecture", is_completed: true },
      { id: "s2222222-2222-4222-8222-222222222222", title: "Write GORM migration models in Golang", is_completed: false }
    ]
  },
  {
    id: "t3333333-3333-4333-8333-333333333333",
    board_id: "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
    board_name: "UI/UX Redesign Project",
    title: "Dark Mode & Glassmorphism Design System Polish",
    description: "Refine card borders, frosted glass effects, and accent glow gradients across all interactive components.",
    priority: "medium",
    due_date: "Tomorrow, 2:00 PM",
    is_completed: false,
    subtasks: [
      { id: "s3333333-3333-4333-8333-333333333331", title: "Audit color contrast accessibility WCAG AA", is_completed: false }
    ]
  },
  {
    id: "t4444444-4444-4444-8444-444444444444",
    board_id: "a1b2c3d4-e5f6-47a8-9012-3456789abcde",
    board_name: "Sprint Workspace",
    title: "Google OAuth 2.0 & JWT Authentication Integration",
    description: "Connect Go OAuth handler with frontend login page and secure token storage.",
    priority: "low",
    due_date: "Oct 2, 2026",
    is_completed: true,
    subtasks: [
      { id: "s4444444-4444-4444-8444-444444444441", title: "Setup Google Cloud OAuth Client ID", is_completed: true },
      { id: "s4444444-4444-4444-8444-444444444442", title: "Test login callback and cookie session", is_completed: true }
    ]
  }
];

export interface TaskListViewProps {
  pageTitle: string;
  headerIcon: React.ReactNode;
  modeFilter?: "assigned" | "overdue" | "upcoming" | "done";
}

export function TaskListView({ pageTitle, headerIcon, modeFilter }: TaskListViewProps) {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_MY_TASKS);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "done">("all");

  const toggleTaskCompletion = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              is_completed: !task.is_completed,
              subtasks: task.subtasks.map((st) => ({
                ...st,
                is_completed: !task.is_completed
              }))
            }
          : task
      )
    );
  };

  const toggleSubtaskCompletion = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSubtasks = task.subtasks.map((st) =>
          st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
        );
        const allCompleted = updatedSubtasks.every((st) => st.is_completed);
        return {
          ...task,
          subtasks: updatedSubtasks,
          is_completed: allCompleted
        };
      })
    );
  };

  // Filter tasks based on modeFilter and activeTab
  const filteredTasks = tasks.filter((task) => {
    if (modeFilter === "overdue") {
      if (!task.is_overdue) return false;
    } else if (modeFilter === "upcoming") {
      if (task.is_overdue) return false;
    } else if (modeFilter === "done") {
      if (!task.is_completed) return false;
    }

    if (activeTab === "pending") return !task.is_completed;
    if (activeTab === "done") return task.is_completed;
    return true;
  });

  const getPriorityBadge = (priority: TaskItem["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "high":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "medium":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "low":
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <>
      <TopNavbar />

      {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-xs">
                {headerIcon}
              </div>
              <div>
                <h1 className="text-xl font-bold leading-none text-[var(--foreground)]">
                  {pageTitle}
                </h1>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1 text-xs">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                All Tasks ({tasks.length})
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "pending"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Pending ({tasks.filter((t) => !t.is_completed).length})
              </button>
              <button
                onClick={() => setActiveTab("done")}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  activeTab === "done"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Completed ({tasks.filter((t) => t.is_completed).length})
              </button>
            </div>
          </div>

          {/* Task List Items */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)]">
                <CheckCheck className="h-10 w-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-40" />
                <h3 className="font-bold text-sm text-[var(--foreground)]">No tasks found</h3>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  You don't have any tasks in this view right now.
                </p>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const completedSub = task.subtasks.filter((s) => s.is_completed).length;
                const totalSub = task.subtasks.length;
                const progressPct = totalSub > 0 ? Math.round((completedSub / totalSub) * 100) : 0;

                return (
                  <div
                    key={task.id}
                    className={`p-5 rounded-2xl bg-[var(--card-bg)] border transition-all shadow-xs ${
                      task.is_completed
                        ? "border-[var(--card-border)] opacity-60"
                        : "border-[var(--card-border)] hover:border-indigo-500/40"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Completion Checkbox */}
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="mt-0.5 text-[var(--muted-foreground)] hover:text-indigo-400 transition-colors shrink-0"
                      >
                        {task.is_completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="h-5 w-5" />
                        )}
                      </button>

                      {/* Main Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
                              {task.board_name}
                            </span>
                            <h3
                              className={`font-bold text-sm text-[var(--foreground)] truncate ${
                                task.is_completed ? "line-through text-[var(--muted-foreground)]" : ""
                              }`}
                            >
                              {task.title}
                            </h3>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityBadge(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </span>

                            {task.due_date && (
                              <div
                                className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                                  task.is_overdue
                                    ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                    : task.is_today
                                    ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                    : "bg-[var(--input-bg)] text-[var(--muted-foreground)] border-[var(--card-border)]"
                                }`}
                              >
                                <Clock className="h-3 w-3" />
                                <span>{task.due_date}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-[var(--muted-foreground)] mb-3 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Subtasks checklist */}
                        {totalSub > 0 && (
                          <div className="mt-3 pt-3 border-t border-[var(--card-border)] space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-semibold text-[var(--muted-foreground)] flex items-center gap-1.5">
                                <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                                Subtasks Checklist ({completedSub}/{totalSub})
                              </span>
                              <span className="font-medium text-indigo-400">{progressPct}%</span>
                            </div>

                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-[var(--input-bg)] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 transition-all duration-300"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>

                            {/* Subtask list */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                              {task.subtasks.map((st) => (
                                <button
                                  key={st.id}
                                  onClick={() => toggleSubtaskCompletion(task.id, st.id)}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-[var(--input-bg)] hover:bg-[var(--card-bg)] border border-[var(--card-border)] text-left text-xs transition-colors"
                                >
                                  {st.is_completed ? (
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                                  ) : (
                                    <Circle className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                                  )}
                                  <span
                                    className={`truncate ${
                                      st.is_completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                                    }`}
                                  >
                                    {st.title}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
    </>
  );
}

export default function MyTasksPage() {
  const { t } = useLanguage();
  return (
    <TaskListView
      pageTitle={t("nav.my_tasks") || "My Tasks"}
      headerIcon={<CheckSquare className="h-5 w-5" />}
    />
  );
}
