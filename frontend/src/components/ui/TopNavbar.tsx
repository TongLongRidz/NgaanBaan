"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === "dark";

  const [userProfile, setUserProfile] = useState<{ firstname: string; lastname: string; email: string; avatar_url: string } | null>(null);

  React.useEffect(() => {
    const fetchMe = async () => {
      const token = localStorage.getItem("user_session_id");
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
      }
    };
    fetchMe();
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;


  const handleSignOut = async () => {
    localStorage.removeItem("user_session_id");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (e) {
      console.error("Logout error:", e);
    }
    router.push("/login");
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
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt="User Avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] flex items-center justify-center text-xs font-bold uppercase">
                  {userProfile ? `${userProfile.firstname?.[0] || ""}${userProfile.lastname?.[0] || ""}` : "NB"}
                </div>
              )}
            </button>

            {/* Profile Popover Dropdown */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--popover-border)] bg-[var(--popover-bg)] text-[var(--foreground)] shadow-2xl overflow-hidden z-50 transition-all">
                {/* Header User Card */}
                <div className="p-4 border-b border-[var(--card-border)] flex items-center gap-3.5 bg-[var(--input-bg)]">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-[var(--card-border)] shrink-0 shadow-md">
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt="User Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] flex items-center justify-center text-xs font-bold uppercase">
                        {userProfile ? `${userProfile.firstname?.[0] || ""}${userProfile.lastname?.[0] || ""}` : "NB"}
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-xs truncate">
                      {userProfile ? `${userProfile.firstname} ${userProfile.lastname}`.trim() : "Loading Profile..."}
                    </h4>
                    <p className={`text-[11px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {userProfile?.email || ""}
                    </p>
                  </div>
                </div>

                {/* Popover Menu Links */}
                <div className="p-2 space-y-0.5 text-xs font-medium">
                  <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}>
                    <User className="h-4 w-4 text-slate-400" />
                    <span>{t("nav.profile")}</span>
                  </button>

                  <Link
                    href="/projects/a1b2c3d4-e5f6-47a8-9012-3456789abcde?tab=settings"
                    onClick={() => setShowProfile(false)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <Settings className="h-4 w-4 text-slate-400" />
                    <span>{t("nav.settings")}</span>
                  </Link>

                  <div className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}></div>

                  {/* Theme Toggle */}
                  <button
                    onClick={toggleTheme}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
                  >
                    <span className="flex items-center gap-3">
                      {isDark ? <Moon className="h-4 w-4 text-amber-400" /> : <Sun className="h-4 w-4 text-amber-500" />}
                      <span>{t("nav.theme")}</span>
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
                      <span>{t("nav.language")}</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">{language.toUpperCase()}</span>
                  </button>

                  <div className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}></div>

                  <button
                    onClick={handleSignOut}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-red-500 hover:bg-red-500/10 text-left`}
                  >
                    <LogOut className="h-4 w-4 text-red-500" />
                    <span>{t("common.sign_out")}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

