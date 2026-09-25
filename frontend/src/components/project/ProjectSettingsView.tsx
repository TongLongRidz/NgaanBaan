"use client";

import React, { useState } from "react";
import { ProjectMember } from "@/types/project";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Users,
  UserPlus,
  Trash2,
  Settings,
  Users as UsersIcon,
  Lock,
  Globe,
  Save,
  AlertTriangle,
  X,
  Mail
} from "lucide-react";

interface ProjectSettingsViewProps {
  projectTitle: string;
  setProjectTitle: (val: string) => void;
  projectDescription: string;
  setProjectDescription: (val: string) => void;
  members: ProjectMember[];
  onAddMember: (email: string, role: "Owner" | "Editor" | "Viewer") => void;
  onRoleChange: (memberId: string, role: "Owner" | "Editor" | "Viewer") => void;
  onRemoveMember: (memberId: string) => void;
  onSaveSettings: () => void;
}

export function ProjectSettingsView({
  projectTitle,
  setProjectTitle,
  projectDescription,
  setProjectDescription,
  members,
  onAddMember,
  onRoleChange,
  onRemoveMember,
  onSaveSettings
}: ProjectSettingsViewProps) {
  const { t } = useLanguage();
  const [projectVisibility, setProjectVisibility] = useState<"team" | "private" | "public">("team");
  const [defaultView, setDefaultView] = useState<"summary" | "kanban" | "gantt" | "calendar">("kanban");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Owner" | "Editor" | "Viewer">("Editor");

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    onAddMember(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    setShowInviteModal(false);
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings();
  };

  return (
    <main className="flex-1 p-6 md:p-8 space-y-8 w-full animate-fade-in">
      {/* SECTION A: MEMBER SETTINGS */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[var(--foreground)]">{t("project.member_management")}</h3>
            </div>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t("project.invite_member")}</span>
          </button>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={member.avatar_url || "https://placehold.co/400x400?text=U"}
                  alt={member.name}
                  className="h-10 w-10 rounded-full object-cover border border-[var(--card-border)] shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[var(--foreground)] truncate">{member.name}</h4>
                    {member.status === "Pending" && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                        {t("project.pending_invite")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)] truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <select
                  value={member.role}
                  onChange={(e) => onRoleChange(member.id, e.target.value as any)}
                  disabled={member.role === "Owner"}
                  className="px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
                >
                  <option value="Owner">Owner</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>

                {member.role !== "Owner" && (
                  <button
                    onClick={() => onRemoveMember(member.id)}
                    className="p-2 rounded-lg text-rose-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION B: PROJECT SETTINGS */}
      <form
        onSubmit={handleSaveSubmit}
        className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-6 shadow-xs"
      >
        <div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4">
          <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-[var(--foreground)]">{t("project.project_config")}</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)] block">{t("project.project_title")}</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--foreground)] block">{t("project.default_landing")}</label>
            <select
              value={defaultView}
              onChange={(e) => setDefaultView(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="summary">{t("project.summary")}</option>
              <option value="kanban">{t("project.kanban")}</option>
              <option value="gantt">{t("project.gantt")}</option>
              <option value="calendar">{t("project.calendar")}</option>
            </select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-[var(--foreground)] block">{t("project.description")}</label>
            <textarea
              rows={3}
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-[var(--foreground)] block">{t("project.privacy_visibility")}</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  projectVisibility === "team"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold"
                    : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="team"
                  checked={projectVisibility === "team"}
                  onChange={() => setProjectVisibility("team")}
                  className="hidden"
                />
                <UsersIcon className="h-4 w-4 shrink-0" />
                <div>
                  <span className="text-xs block text-[var(--foreground)]">{t("project.team_only")}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">{t("project.team_only_desc")}</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  projectVisibility === "private"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold"
                    : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={projectVisibility === "private"}
                  onChange={() => setProjectVisibility("private")}
                  className="hidden"
                />
                <Lock className="h-4 w-4 shrink-0" />
                <div>
                  <span className="text-xs block text-[var(--foreground)]">{t("project.private")}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">{t("project.private_desc")}</span>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                  projectVisibility === "public"
                    ? "border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold"
                    : "border-[var(--card-border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={projectVisibility === "public"}
                  onChange={() => setProjectVisibility("public")}
                  className="hidden"
                />
                <Globe className="h-4 w-4 shrink-0" />
                <div>
                  <span className="text-xs block text-[var(--foreground)]">{t("project.public")}</span>
                  <span className="text-[10px] text-[var(--muted-foreground)]">{t("project.public_desc")}</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--card-border)]">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all"
          >
            <Save className="h-4 w-4" />
            <span>{t("project.save_changes")}</span>
          </button>
        </div>
      </form>

      {/* DANGER ZONE */}
      <div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <h3 className="font-bold text-sm text-rose-500">{t("project.danger_zone")}</h3>
        </div>
        <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
          {t("project.danger_desc")}
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="button"
            onClick={onSaveSettings}
            className="px-4 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30 transition-all"
          >
            {t("project.archive_project")}
          </button>
          <button
            type="button"
            onClick={() => alert("Are you sure you want to permanently delete this project?")}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-all"
          >
            {t("project.delete_project")}
          </button>
        </div>
      </div>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-5 animate-scale-up">
            <button
              onClick={() => setShowInviteModal(false)}
              className="absolute top-4 right-4 p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--input-bg)]"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[var(--foreground)]">{t("project.invite_modal_title")}</h3>
                <p className="text-xs text-[var(--muted-foreground)]">{t("project.invite_modal_desc")}</p>
              </div>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] block">{t("project.email_address")}</label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-[var(--muted-foreground)] absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--foreground)] block">{t("project.project_role")}</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Editor">Editor (Create & edit tasks)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--card-border)]">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-xl bg-[var(--input-bg)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all"
                >
                  {t("project.cancel")}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md transition-all"
                >
                  {t("project.send_invitation")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
