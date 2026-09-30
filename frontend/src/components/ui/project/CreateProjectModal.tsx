"use client";

import { FolderKanban, X } from "lucide-react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

interface CreateProjectModalProps {
	isOpen: boolean;
	onClose: () => void;
	onProjectCreated?: () => void;
}

export function CreateProjectModal({
	isOpen,
	onClose,
	onProjectCreated,
}: CreateProjectModalProps) {
	const router = useRouter();
	const { t } = useLanguage();
	const [newTitle, setNewTitle] = useState("");
	const [newDesc, setNewDesc] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMsg, setErrorMsg] = useState("");

	if (!isOpen) return null;

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
				throw new Error(
					errData.message || errData.error || "Failed to create project",
				);
			}

			const created = await res.json();
			setNewTitle("");
			setNewDesc("");
			onClose();

			if (onProjectCreated) {
				onProjectCreated();
			} else if (created && created.id) {
				router.push(`/projects/${created.id}`);
			} else {
				window.location.reload();
			}
		} catch (err: any) {
			setErrorMsg(err.message || "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
			<div className="relative w-full max-w-md rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-2xl p-6 text-[var(--foreground)] text-left">
				<div className="flex items-center justify-between pb-4 border-b border-[var(--card-border)] mb-4">
					<div className="flex items-center gap-3 min-w-0">
						<div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 shadow-xs">
							<FolderKanban className="h-5 w-5" />
						</div>
						<div className="text-left min-w-0">
							<h3 className="font-bold text-base md:text-lg text-[var(--foreground)] leading-tight truncate">
								{t("boards.create_new_board") ||
									t("empty.create_modal_title") ||
									"Create New Project"}
							</h3>
							<p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
								{t("boards.create_board_desc") ||
									"Add a new workspace for your project"}
							</p>
						</div>
					</div>
					<button
						onClick={onClose}
						className="p-1.5 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors shrink-0"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{errorMsg && (
					<div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium text-left">
						{errorMsg}
					</div>
				)}

				<form onSubmit={handleCreateProject} className="space-y-4 text-left">
					<div>
						<label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider text-left">
							{t("empty.title_label") || "Project Title *"}
						</label>
						<input
							type="text"
							required
							placeholder={
								t("empty.title_placeholder") || "e.g. Website Redesign"
							}
							value={newTitle}
							onChange={(e) => setNewTitle(e.target.value)}
							className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] text-left focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all"
						/>
					</div>

					<div>
						<label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1.5 uppercase tracking-wider text-left">
							{t("empty.desc_label") || "Description"}
						</label>
						<textarea
							rows={3}
							placeholder={
								t("empty.desc_placeholder") ||
								"Brief description of the project..."
							}
							value={newDesc}
							onChange={(e) => setNewDesc(e.target.value)}
							className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-sm text-[var(--foreground)] focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all resize-none"
						/>
					</div>

					<div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--card-border)] mt-6">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 rounded-xl border border-[var(--card-border)] text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
						>
							{t("empty.cancel_btn") || "Cancel"}
						</button>
						<button
							type="submit"
							disabled={isSubmitting}
							className="px-4 py-2 rounded-xl bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] text-xs font-semibold shadow-xs disabled:opacity-50 transition-all active:scale-95"
						>
							{isSubmitting
								? t("empty.creating_btn") || "Creating..."
								: t("empty.create_btn") || "Create Project"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
