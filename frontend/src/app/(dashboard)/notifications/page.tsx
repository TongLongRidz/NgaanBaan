"use client";

import React, { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  UserPlus,
  Clock,
  Kanban,
  AlertCircle,
  Filter,
  Check,
  Sparkles,
  Inbox
} from "lucide-react";

interface NotificationItem {
  id: string;
  type: "mention" | "assignment" | "status" | "comment" | "due_soon";
  title: string;
  description: string;
  time: string;
  is_read: boolean;
  author: {
    name: string;
    avatar_url: string;
  };
  link?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n-1",
    type: "mention",
    title: "Mentioned you in Sprint Workspace",
    description: "@Somying Singjad please review the updated Tailwind CSS color variables in globals.css",
    time: "10 mins ago",
    is_read: false,
    author: { name: "Sarah Chen", avatar_url: "https://placehold.co/400x400?text=SC" }
  },
  {
    id: "n-2",
    type: "assignment",
    title: "Assigned you to a new task",
    description: "You were assigned to 'SideNavbar Navigation Redesign & Theme Persistence'",
    time: "1 hour ago",
    is_read: false,
    author: { name: "Alex Turner", avatar_url: "https://placehold.co/400x400?text=AT" }
  },
  {
    id: "n-3",
    type: "status",
    title: "Task status updated",
    description: "'PostgreSQL & MongoDB Dual-Database Schema Setup' moved to In Progress",
    time: "3 hours ago",
    is_read: true,
    author: { name: "Mike Ross", avatar_url: "https://placehold.co/400x400?text=MR" }
  },
  {
    id: "n-4",
    type: "comment",
    title: "New comment on UI/UX Redesign",
    description: "Added 2 new mockups for dark mode glassmorphism card components",
    time: "Yesterday",
    is_read: true,
    author: { name: "Sarah Chen", avatar_url: "https://placehold.co/400x400?text=SC" }
  }
];

export default function NotificationsPage() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
    );
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === "unread" ? !n.is_read : true
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const getNotificationIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "mention":
        return <MessageSquare className="h-4 w-4 text-indigo-400" />;
      case "assignment":
        return <UserPlus className="h-4 w-4 text-emerald-400" />;
      case "status":
        return <Kanban className="h-4 w-4 text-amber-400" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-blue-400" />;
      default:
        return <Bell className="h-4 w-4 text-indigo-400" />;
    }
  };

  return (
    <>
      <TopNavbar title={t("nav.notifications") || "Notifications"} />

      <main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto animate-fade-in space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-6">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center relative shadow-xs">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-indigo-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-[var(--background)] shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                {t("nav.notifications") || "Notifications"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[var(--card-bg)] border border-[var(--card-border)] rounded-xl p-1 text-xs shadow-xs">
              <button
                onClick={() => setFilter("all")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  filter === "all"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                  filter === "unread"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--card-border)] bg-[var(--card-bg)] hover:bg-[var(--input-bg)] text-[var(--foreground)] transition-all shadow-xs"
              >
                <CheckCheck className="h-4 w-4 text-indigo-400" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>
        </div>

        {/* List of Notifications */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Inbox className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">No notifications found</h3>
              <p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
                You are all caught up! No unread activity alerts at the moment.
              </p>
            </div>
          ) : (
            filteredNotifications.map((noti) => (
              <div
                key={noti.id}
                onClick={() => handleToggleRead(noti.id)}
                className={`p-4 md:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 group ${
                  !noti.is_read
                    ? "bg-indigo-500/5 border-indigo-500/30 shadow-xs hover:border-indigo-500/50"
                    : "bg-[var(--card-bg)] border-[var(--card-border)] hover:border-[var(--card-border)] opacity-85 hover:opacity-100"
                }`}
              >
                {/* Author Avatar Thumbnail */}
                <div className="shrink-0 mt-0.5">
                  <img
                    src={noti.author.avatar_url}
                    alt={noti.author.name}
                    className="h-10 w-10 rounded-full object-cover border border-[var(--card-border)] shadow-xs"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-6 w-6 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)] flex items-center justify-center shrink-0">
                        {getNotificationIcon(noti.type)}
                      </div>
                      <h4 className={`text-xs font-bold truncate ${!noti.is_read ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"}`}>
                        {noti.title}
                      </h4>
                    </div>
                    <span className="text-[10px] text-[var(--muted-foreground)] shrink-0 font-medium tabular-nums">
                      {noti.time}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                    {noti.description}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[10px] text-[var(--muted-foreground)] font-medium">
                    <span className="text-indigo-400 font-semibold">{noti.author.name}</span>
                  </div>
                </div>

                {!noti.is_read && (
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0 mt-2 ring-4 ring-indigo-500/20" />
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}

