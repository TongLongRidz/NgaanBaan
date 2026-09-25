"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Clock,
  Star,
  Bell,
  MessageSquare,
  Users,
  UserCheck,
  CalendarDays,
  AlertCircle,
  CheckCheck,
  User,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Layout,
  LayoutGrid,
  LayoutDashboard,
} from "lucide-react";

export function SideNavbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidenavbar_is_collapsed");
        if (saved !== null) return JSON.parse(saved);
      } catch {}
    }
    return false;
  });

  const [isRecentsOpen, setIsRecentsOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidenavbar_is_recents_open");
        if (saved !== null) return JSON.parse(saved);
      } catch {}
    }
    return true;
  });

  const [isMyTasksOpen, setIsMyTasksOpen] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("sidenavbar_is_mytasks_open");
        if (saved !== null) return JSON.parse(saved);
      } catch {}
    }
    return true;
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem("sidenavbar_is_collapsed", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleRecentsOpen = () => {
    setIsRecentsOpen((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem("sidenavbar_is_recents_open", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const toggleMyTasksOpen = () => {
    setIsMyTasksOpen((prev: boolean) => {
      const next = !prev;
      try {
        localStorage.setItem("sidenavbar_is_mytasks_open", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const recentProjects = [
    { id: "a1b2c3d4-e5f6-47a8-9012-3456789abcde", title: "Sprint Workspace", href: "/projects/a1b2c3d4-e5f6-47a8-9012-3456789abcde" },
    { id: "f47ac10b-58cc-4372-a567-0e02b2c3d4e5", title: "UI/UX Redesign", href: "/projects/f47ac10b-58cc-4372-a567-0e02b2c3d4e5" },
    { id: "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d", title: "Backend Infrastructure", href: "/projects/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d" },
  ];

  const myTasksSubItems = [
    { label: t("nav.assigned_to_me") || "Assigned to me", href: "/my-tasks/assigned", icon: UserCheck },
    { label: t("nav.overdue") || "Overdue", href: "/my-tasks/overdue", icon: AlertCircle },
    { label: t("nav.upcoming") || "Upcoming Due", href: "/my-tasks/upcoming", icon: CalendarDays },
    { label: t("nav.completed") || "Completed", href: "/my-tasks/done", icon: CheckCheck },
  ];

  return (
    <aside
      className={`relative border-r border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] flex flex-col justify-between p-3 min-h-screen transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden shrink-0 z-50 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="space-y-4 w-full">
        {/* Brand Logo & Collapse Toggle Header */}
        <div className={`h-12 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-1"} border-b border-[var(--card-border)] pb-3`}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 select-none overflow-hidden min-w-0">
                <div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-md shrink-0">
                  <LayoutDashboard className="h-4 w-4 text-slate-100" />
                </div>
                <h1 className="font-bold text-base leading-none truncate text-[var(--foreground)] transition-all duration-300">
                  {t("common.brand")}
                </h1>
              </div>
              <button
                onClick={toggleCollapsed}
                className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors shrink-0"
                title="Collapse sidebar"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleCollapsed}
              className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors shrink-0"
              title="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
        </div>

        <nav className="space-y-3">
          {/* SECTION 1: ACTIVITY ITEMS */}
          <div className="space-y-1">
            {/* Notifications */}
            <Link
              href="/notifications"
              title={isCollapsed ? `${t("nav.notifications")} (3)` : undefined}
              className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                pathname === "/notifications"
                  ? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Bell className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/notifications" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`} />
                <span className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                  {t("nav.notifications") || "Notification"}
                </span>
              </div>
              {!isCollapsed && (
                <span className="h-5 px-2 rounded-full bg-[var(--input-bg)] text-[var(--foreground)] text-[10px] font-semibold flex items-center justify-center border border-[var(--card-border)] shrink-0 transition-opacity duration-200">
                  3
                </span>
              )}
            </Link>
          </div>

          <div className="border-t border-[var(--card-border)] pt-1 transition-all duration-300"></div>

          {/* SECTION 2: WORKSPACE & PROJECTS */}
          <div className="space-y-1">
            {/* Recently Section with Projects Submenu */}
            <div>
              <div
                className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  pathname === "/projects/recent" || pathname === "/projects/recently"
                    ? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
                }`}
              >
                <Link
                  href="/projects/recent"
                  title={isCollapsed ? `${t("nav.recents")}` : undefined}
                  className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : "flex-1"}`}
                >
                  <Clock className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/recent" || pathname === "/projects/recently" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`} />
                  <span className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                    {t("nav.recents")}
                  </span>
                </Link>
                {!isCollapsed && (
                  <button
                    onClick={toggleRecentsOpen}
                    className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-opacity duration-200"
                  >
                    {isRecentsOpen ? (
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
                    )}
                  </button>
                )}
              </div>

              {/* Recent Projects Submenu */}
              {isRecentsOpen && !isCollapsed && (
                <div className="ml-5 pl-3 border-l border-[var(--card-border)] space-y-1 mt-1 transition-all duration-300">
                  {recentProjects.map((project) => {
                    const isProjectActive = pathname === project.href;
                    return (
                      <Link
                        key={project.id}
                        href={project.href}
                        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                          isProjectActive
                            ? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
                        }`}
                      >
                        <Layout className="h-3 w-3 text-amber-500 shrink-0" />
                        <span className="truncate">{project.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Starred */}
            <Link
              href="/projects/starred"
              title={isCollapsed ? `${t("nav.starred")} (2)` : undefined}
              className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                pathname === "/projects/starred"
                  ? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Star className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/starred" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`} />
                <span className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                  {t("nav.starred")}
                </span>
              </div>
              {!isCollapsed && (
                <span className="h-5 px-2 rounded-full bg-[var(--input-bg)] text-[var(--foreground)] text-[10px] font-semibold flex items-center justify-center border border-[var(--card-border)] shrink-0 transition-opacity duration-200">
                  2
                </span>
              )}
            </Link>

            {/* Shared with me */}
            <Link
              href="/projects/shared"
              title={isCollapsed ? `${t("nav.shared_with_me")} (1)` : undefined}
              className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                pathname === "/projects/shared"
                  ? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Users className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/shared" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`} />
                <span className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                  {t("nav.shared_with_me") || "Shared with me"}
                </span>
              </div>
              {!isCollapsed && (
                <span className="h-5 px-2 rounded-full bg-[var(--input-bg)] text-[var(--foreground)] text-[10px] font-semibold flex items-center justify-center border border-[var(--card-border)] shrink-0 transition-opacity duration-200">
                  1
                </span>
              )}
            </Link>
          </div>

          <div className="border-t border-[var(--card-border)] pt-1 transition-all duration-300"></div>

          {/* SECTION 3: MY TASKS */}
          <div className="space-y-1">
            <button
              onClick={() => {
                if (isCollapsed) toggleCollapsed();
                toggleMyTasksOpen();
              }}
              title={isCollapsed ? `${t("nav.my_tasks")}` : undefined}
              className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <User className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <span className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}>
                  {t("nav.my_tasks")}
                </span>
              </div>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 transition-opacity duration-200">
                  {isMyTasksOpen ? (
                    <ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                  )}
                </div>
              ) : null}
            </button>

            {/* My Tasks Submenu Dropdown */}
            {isMyTasksOpen && !isCollapsed && (
              <div className="ml-5 pl-3 border-l border-[var(--card-border)] space-y-1 mt-1 transition-all duration-300">
                {myTasksSubItems.map((sub) => {
                  const SubIcon = sub.icon;
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.label}
                      href={sub.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
                        isSubActive
                          ? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
                          : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <SubIcon className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
                        <span className="truncate">{sub.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
