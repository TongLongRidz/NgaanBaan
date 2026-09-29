"use client";

import React, { useState } from "react";
import { Plus, FolderKanban, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";

interface EmptyProjectStateProps {
  title?: string;
  description?: string;
  showCreateButton?: boolean;
  onProjectCreated?: () => void;
}

export function EmptyProjectState({
  title,
  description,
  showCreateButton = true,
  onProjectCreated,
}: EmptyProjectStateProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const displayTitle = title || t("empty.no_projects_found");
  const displayDesc = description || t("empty.create_to_get_started");

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setErrorMsg(t("empty.title_label") || "Project title is required");
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

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to create project");
      }

      const created = await res.json();
      setShowCreateModal(false);
      setNewTitle("");
      setNewDesc("");
      if (onProjectCreated) {
        onProjectCreated();
      } else if (created && created.id) {
        router.push(`/projects/${created.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto w-full">
        {/* Decorative Icon Badge */}
        <div className="w-12 h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--muted-foreground)] mb-3.5 shadow-xs">
          <FolderKanban className="w-5 h-5 opacity-70" />
        </div>

        {/* Title */}
        <h3 className="font-bold text-base md:text-lg text-[var(--foreground)] tracking-tight mb-1">
          {displayTitle}
        </h3>

        {/* Description */}
        <p className="text-xs text-[var(--muted-foreground)] max-w-[320px] sm:max-w-md mb-5 leading-relaxed whitespace-pre-line">
          {displayDesc}
        </p>

        {/* Primary Action Button */}
        {showCreateButton && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>{t("empty.new_project_btn")}</span>
          </button>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl p-6 text-[var(--foreground)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
              <h3 className="font-bold text-lg">{t("empty.create_modal_title")}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">
                  {t("empty.title_label")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("empty.title_placeholder")}
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-slate-400/30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider">
                  {t("empty.desc_label")}
                </label>
                <textarea
                  rows={3}
                  placeholder={t("empty.desc_placeholder")}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-slate-400/30 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
                >
                  {t("empty.cancel_btn")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl text-sm font-semibold bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? t("empty.creating_btn") : t("empty.create_btn")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
