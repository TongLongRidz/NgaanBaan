"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Plus,
  Sun,
  Moon,
  Globe,
  Settings,
  X,
  User,
  LogOut,
  FolderKanban
} from "lucide-react";

interface TopNavbarProps {
  title?: string;
}

export function TopNavbar({ title }: TopNavbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === "dark";

  const [userProfile, setUserProfile] = useState<{ firstname: string; lastname: string; email: string; avatar_url: string } | null>(null);

  // Modal State for Create Project
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  React.useEffect(() => {
    const fetchMe = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

        const res = await fetch(`${apiUrl}/api/auth/me`, {
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

  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = async () => {
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

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg("กรุณากรอกชื่อโปรเจกต์");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const res = await fetch(`${apiUrl}/api/projects`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDesc.trim(),
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setShowCreateModal(false);
        setNewTitle("");
        setNewDesc("");
        if (created && created.id) {
          router.push(`/projects/${created.id}`);
        } else {
          window.location.reload();
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        setErrorMsg(errData.error || "เกิดข้อผิดพลาดในการสร้างโปรเจกต์");
      }
    } catch (err) {
      console.error("Create project error:", err);
      setErrorMsg("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <header className="w-full min-w-full h-16 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors duration-300 text-[var(--foreground)]">
        <div className="flex items-center gap-3 sm:gap-4">
          {title && (
            <h1 className="font-bold text-base sm:text-lg text-[var(--foreground)] truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Create Project Button in TopNavbar */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] rounded-xl text-xs font-semibold shadow-xs transition-all shrink-0 active:scale-95"
            title={t("boards.create_board")}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("boards.create_board")}</span>
          </button>

          <div>
            {/* User Profile Popover */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className={`h-9 w-9 rounded-full overflow-hidden border-2 flex items-center justify-center transition-all hover:scale-105 border-[var(--card-border)] ${showProfile ? "ring-2 ring-offset-2 ring-slate-500" : ""
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
                      onClick={(e) => toggleTheme(e)}
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

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--popover-border)] bg-[var(--popover-bg)] text-[var(--foreground)] p-6 shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <FolderKanban className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight text-[var(--foreground)]">
                  {t("boards.create_new_board")}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {t("boards.create_board_desc")}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  {t("project.project_title")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder={t("project.project_title_placeholder") !== "project.project_title_placeholder" ? t("project.project_title_placeholder") : "เช่น Marketing Campaign Q4"}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--foreground)] mb-1.5">
                  {t("project.description")}
                </label>
                <textarea
                  rows={3}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder={t("project.description_placeholder") !== "project.description_placeholder" ? t("project.description_placeholder") : "รายละเอียดสังเขปเกี่ยวกับวัตถุประสงค์โครงการ..."}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--card-border)] bg-[var(--input-bg)] text-xs text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-all"
                >
                  {t("project.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? t("common.loading") : t("boards.create_board")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
