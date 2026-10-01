"use client";

import { AlertTriangle, Save, Settings } from "lucide-react";
import type React from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface ProjectSettingsViewProps {
	projectId?: string;
	projectTitle: string;
	setProjectTitle: (val: string) => void;
	projectDescription: string;
	setProjectDescription: (val: string) => void;
	onSaveSettings: () => void;
}

export function ProjectSettingsView({
	projectTitle,
	setProjectTitle,
	projectDescription,
	setProjectDescription,
	onSaveSettings,
}: ProjectSettingsViewProps) {
	const { t } = useLanguage();

	const handleSaveSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSaveSettings();
	};

	return (
		<main className="flex-1 p-6 md:p-8 space-y-8 w-full animate-fade-in">
			{/* PROJECT CONFIG SETTINGS */}
			<form
				onSubmit={handleSaveSubmit}
				className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-6 shadow-xs"
			>
				<div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4">
					<div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
						<Settings className="h-5 w-5" />
					</div>
					<div>
						<h3 className="font-bold text-base text-[var(--foreground)]">
							{t("project.project_config")}
						</h3>
					</div>
				</div>

				<div className="space-y-4">
					<div className="space-y-1.5">
						<label className="text-xs font-semibold text-[var(--foreground)] block">
							{t("project.project_title")}
						</label>
						<input
							type="text"
							value={projectTitle}
							onChange={(e) => setProjectTitle(e.target.value)}
							className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
							required
						/>
					</div>

					<div className="space-y-1.5">
						<label className="text-xs font-semibold text-[var(--foreground)] block">
							{t("project.description")}
						</label>
						<textarea
							rows={4}
							value={projectDescription}
							onChange={(e) => setProjectDescription(e.target.value)}
							className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none leading-relaxed"
						/>
					</div>
				</div>

				<div className="flex justify-end pt-4 border-t border-[var(--card-border)]">
					<button
						type="submit"
						className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95"
					>
						<Save className="h-4 w-4" />
						<span>{t("project.save_changes")}</span>
					</button>
				</div>
			</form>

			{/* DANGER ZONE */}
			<div className="p-6 rounded-2xl bg-rose-500/5 border border-rose-500/20 space-y-4 shadow-xs">
				<div className="flex items-center gap-3">
					<div className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
						<AlertTriangle className="h-5 w-5" />
					</div>
					<div>
						<h3 className="font-bold text-base text-rose-500">
							{t("project.danger_zone")}
						</h3>
						<p className="text-xs text-[var(--muted-foreground)]">
							{t("project.danger_zone_desc")}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--card-bg)] border border-rose-500/20">
					<div>
						<h4 className="font-bold text-xs text-[var(--foreground)]">
							{t("project.delete_project")}
						</h4>
						<p className="text-[11px] text-[var(--muted-foreground)]">
							{t("project.delete_project_warning")}
						</p>
					</div>
					<button
						type="button"
						onClick={() => alert("Delete project feature triggered")}
						className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all active:scale-95 shrink-0"
					>
						{t("project.delete_project_btn")}
					</button>
				</div>
			</div>
		</main>
	);
}
