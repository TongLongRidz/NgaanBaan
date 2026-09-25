"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import {
  LayoutDashboard,
  Bell,
  Sun,
  Moon,
  Globe,
  Settings,
  ChevronDown,
  CheckCheck,
  CheckCircle2,
  Clock,
  UserCheck,
  X,
  User,
  Users,
  Sliders,
  LogOut
} from "lucide-react";

interface TopNavbarProps {
  title?: string;
}

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "task_assigned" | "status_changed" | "info";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Task Assigned",
    message: "Somchai Jaidee assigned you to 'Design Modern Kanban Board Interface'",
    time: "10 mins ago",
    isRead: false,
    type: "task_assigned"
  },
  {
    id: "notif-2",
    title: "Task Completed",
    message: "Database Schema & Architecture Notes was moved to 'Done'",
    time: "1 hour ago",
    isRead: false,
    type: "status_changed"
  },
  {
    id: "notif-3",
    title: "System Update",
    message: "PostgreSQL & MongoDB schema migration finished successfully",
    time: "Yesterday",
    isRead: true,
    type: "info"
  }
];

export function TopNavbar({ title }: TopNavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === "dark";

  // Default avatar image URL placeholder using user's initials (SJ - Somchai Jaidee)
  const DEFAULT_AVATAR = "https://placehold.co/400x400?text=SJ";
  const [avatarUrl, setAvatarUrl] = useState<string | null>(DEFAULT_AVATAR);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  return (
    <header className="w-full min-w-full h-16 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300 text-[var(--foreground)]">
      <div className="flex items-center gap-3 sm:gap-4">
        {title && (
          <h1 className="font-bold text-base sm:text-lg text-[var(--foreground)] truncate">
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div>
          {/* User Profile Popover */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
                setShowSettings(false);
              }}
              className={`h-9 w-9 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all hover:scale-105 border-[var(--card-border)] ${
                showProfile ? "ring-2 ring-offset-2 ring-slate-500" : ""
              }`}
              title="User Account"
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-amber-500 flex items-center justify-center text-xs font-bold text-slate-950">
                  SJ
                </div>
              )}
            </button>

            {/* Profile Popover Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--popover-border)] bg-[var(--popover-bg)] text-[var(--foreground)] shadow-2xl overflow-hidden z-50 transition-all">
                {/* Header User Card */}
                <div className="p-4 border-b border-[var(--card-border)] flex items-center gap-3.5 bg-[var(--input-bg)]">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-[var(--card-border)] shrink-0 shadow-md">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-amber-500 flex items-center justify-center text-xs font-bold text-slate-950">
                        SJ
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs truncate">Somchai Jaidee</h4>
                    <p className={`text-[11px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      somchai.j@gmail.com
                    </p>
                  </div>
                </div>

                {/* Popover Menu Links */}
                <div className="p-2 space-y-0.5 text-xs font-medium">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}>
                    <User className="h-4 w-4 text-slate-400" />
                    <span>Profile</span>
                  </button>

                  <Link
                    href="/projects/a1b2c3d4-e5f6-47a8-9012-3456789abcde?tab=settings"
                    onClick={() => setShowProfile(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <div className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}></div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <span className="flex items-center gap-3">
                      {isDark ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                      <span>Theme</span>
                    </span>
                    <span className="text-[10px] font-bold capitalize text-slate-400">{theme}</span>
                  </button>

                  {/* Language Toggle */}
                  <button
                    onClick={toggleLanguage}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <span className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-slate-400" />
                      <span>Language</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{language.toUpperCase()}</span>
                  </button>

                  <div className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}></div>

                  <Link
                    href="/login"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-red-500 hover:bg-red-500/10`}
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>Log out</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

