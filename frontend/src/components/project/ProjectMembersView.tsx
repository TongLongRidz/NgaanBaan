"use client";

import {
	Check,
	Copy,
	Globe,
	Link as LinkIcon,
	Lock,
	Mail,
	Trash2,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import type { ProjectMember } from "@/types/project";

interface ProjectMembersViewProps {
	projectId?: string;
	members: ProjectMember[];
	userRole?: string;
	projectVisibility?: "private" | "specific_people" | "anyone_with_link";
	onVisibilityChange?: (visibility: "private" | "specific_people" | "anyone_with_link") => void;
	onAddMember: (email: string, role: "Owner" | "Editor" | "Viewer") => void;
	onRoleChange: (memberId: string, role: "Owner" | "Editor" | "Viewer") => void;
	onRemoveMember: (memberId: string) => void;
}

export function ProjectMembersView({
	projectId,
	members,
	userRole,
	projectVisibility = "private",
	onVisibilityChange,
	onAddMember,
	onRoleChange,
	onRemoveMember,
}: ProjectMembersViewProps) {
	const { t } = useLanguage();
	const isCurrentUserOwner = userRole && userRole.toLowerCase() === "owner";
	const [showInviteModal, setShowInviteModal] = useState(false);
	const [inviteTab, setInviteTab] = useState<"email" | "link">("email");
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<"Owner" | "Editor" | "Viewer">(
		"Editor",
	);
	const [linkRole, setLinkRole] = useState<"Editor" | "Viewer">("Editor");
	const [generatedLink, setGeneratedLink] = useState("");
	const [isGenerating, setIsGenerating] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleGenerateLink = async () => {
		if (!projectId) return;
		setIsGenerating(true);
		try {
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			const res = await fetch(
				`${apiUrl}/api/projects/${projectId}/invitations`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
					body: JSON.stringify({ role: linkRole }),
				},
			);
			if (res.ok) {
				const data = await res.json();
				const fullLink = `${window.location.origin}/join?token=${data.token}`;
				setGeneratedLink(fullLink);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleCopyLink = () => {
		if (!generatedLink) return;
		navigator.clipboard.writeText(generatedLink);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleInviteSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inviteEmail.trim()) return;
		onAddMember(inviteEmail.trim(), inviteRole);
		setInviteEmail("");
		setShowInviteModal(false);
	};

	return (
		<main className="flex-1 p-6 md:p-8 space-y-8 w-full animate-fade-in">
			{/* MEMBER MANAGEMENT SECTION */}
			<div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-6 shadow-xs">
				<div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--card-border)] pb-4">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
							<Users className="h-5 w-5" />
						</div>
						<div>
							<h3 className="font-bold text-base text-[var(--foreground)]">
								{t("project.member_management")}
							</h3>
						</div>
					</div>

					{isCurrentUserOwner && (
						<button
							onClick={() => setShowInviteModal(true)}
							className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all shrink-0"
						>
							<UserPlus className="h-4 w-4" />
							<span>{t("project.invite_member")}</span>
						</button>
					)}
				</div>

				{/* Members List */}
				<div className="space-y-3">
					{members.map((member, index) => {
						const memberRole = member.role
							? member.role.charAt(0).toUpperCase() +
								member.role.slice(1).toLowerCase()
							: "Viewer";
						const isOwner = memberRole === "Owner";

						return (
							<div
								key={member.id ? `${member.id}-${index}` : `member-${index}`}
								className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500/30 transition-all"
							>
								<div className="flex items-center gap-3 min-w-0">
									<img
										src={
											member.avatar_url || "https://placehold.co/400x400?text=U"
										}
										alt={member.name}
										className="h-10 w-10 rounded-full object-cover border border-[var(--card-border)] shrink-0"
									/>
									<div className="min-w-0">
										<div className="flex items-center gap-2">
											<h4 className="font-bold text-sm text-[var(--foreground)] truncate">
												{member.name}
											</h4>
											{member.status === "Pending" && (
												<span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
													{t("project.pending_invite")}
												</span>
											)}
										</div>
										<p className="text-xs text-[var(--muted-foreground)] truncate">
											{member.email}
										</p>
									</div>
								</div>

								<div className="flex items-center gap-3 shrink-0">
									<select
										value={memberRole}
										onChange={(e) =>
											onRoleChange(member.id, e.target.value as any)
										}
										disabled={!isCurrentUserOwner || isOwner}
										className="px-3 py-1.5 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none disabled:opacity-50"
									>
										<option value="Owner">Owner</option>
										<option value="Editor">Editor</option>
										<option value="Viewer">Viewer</option>
									</select>

									{!isOwner && isCurrentUserOwner && (
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
						);
					})}
				</div>
			</div>

			{/* PRIVACY & VISIBILITY SECTION */}
			<div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] space-y-4 shadow-xs">
				<label className="text-sm font-bold text-[var(--foreground)] block border-b border-[var(--card-border)] pb-3">
					{t("project.privacy_visibility")}
				</label>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					{/* 1. Private */}
					<label
						className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
							isCurrentUserOwner ? "cursor-pointer" : "cursor-not-allowed opacity-60"
						} ${
							projectVisibility === "private"
								? "border-indigo-500 bg-indigo-500/5"
								: "border-[var(--card-border)] bg-[var(--input-bg)] hover:border-indigo-500/30"
						}`}
					>
						<input
							type="radio"
							name="visibility"
							value="private"
							disabled={!isCurrentUserOwner}
							checked={projectVisibility === "private"}
							onChange={() => onVisibilityChange?.("private")}
							className="text-indigo-600 focus:ring-indigo-500"
						/>
						<Lock className="h-5 w-5 text-rose-400 shrink-0" />
						<div>
							<h4 className="font-bold text-xs text-[var(--foreground)]">
								{t("project.private")}
							</h4>
							<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
								{t("project.private_desc")}
							</p>
						</div>
					</label>

					{/* 2. Specific People */}
					<label
						className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
							isCurrentUserOwner ? "cursor-pointer" : "cursor-not-allowed opacity-60"
						} ${
							projectVisibility === "specific_people"
								? "border-indigo-500 bg-indigo-500/5"
								: "border-[var(--card-border)] bg-[var(--input-bg)] hover:border-indigo-500/30"
						}`}
					>
						<input
							type="radio"
							name="visibility"
							value="specific_people"
							disabled={!isCurrentUserOwner}
							checked={projectVisibility === "specific_people"}
							onChange={() => onVisibilityChange?.("specific_people")}
							className="text-indigo-600 focus:ring-indigo-500"
						/>
						<Users className="h-5 w-5 text-indigo-400 shrink-0" />
						<div>
							<h4 className="font-bold text-xs text-[var(--foreground)]">
								{t("project.specific_people")}
							</h4>
							<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
								{t("project.specific_people_desc")}
							</p>
						</div>
					</label>

					{/* 3. Anyone With Link */}
					<label
						className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
							isCurrentUserOwner ? "cursor-pointer" : "cursor-not-allowed opacity-60"
						} ${
							projectVisibility === "anyone_with_link"
								? "border-indigo-500 bg-indigo-500/5"
								: "border-[var(--card-border)] bg-[var(--input-bg)] hover:border-indigo-500/30"
						}`}
					>
						<input
							type="radio"
							name="visibility"
							value="anyone_with_link"
							disabled={!isCurrentUserOwner}
							checked={projectVisibility === "anyone_with_link"}
							onChange={() => onVisibilityChange?.("anyone_with_link")}
							className="text-indigo-600 focus:ring-indigo-500"
						/>
						<Globe className="h-5 w-5 text-emerald-400 shrink-0" />
						<div>
							<h4 className="font-bold text-xs text-[var(--foreground)]">
								{t("project.anyone_with_link")}
							</h4>
							<p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
								{t("project.anyone_with_link_desc")}
							</p>
						</div>
					</label>
				</div>
			</div>

			{/* Invite Member Modal */}
			{showInviteModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
					<div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 space-y-6 relative text-[var(--foreground)]">
						<button
							onClick={() => setShowInviteModal(false)}
							className="absolute top-4 right-4 p-1.5 rounded-xl text-[var(--muted-foreground)] hover:bg-[var(--input-bg)] transition-colors"
						>
							<X className="h-4 w-4" />
						</button>

						<div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4">
							<div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
								<UserPlus className="h-5 w-5" />
							</div>
							<div>
								<h3 className="font-bold text-base text-[var(--foreground)]">
									{t("project.invite_modal_title")}
								</h3>
								<p className="text-xs text-[var(--muted-foreground)]">
									{t("project.invite_modal_desc")}
								</p>
							</div>
						</div>

						{/* Invite Mode Tabs */}
						<div className="flex p-1 bg-[var(--input-bg)] rounded-xl border border-[var(--card-border)]">
							<button
								type="button"
								onClick={() => setInviteTab("email")}
								className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
									inviteTab === "email"
										? "bg-[var(--card-bg)] text-[var(--foreground)] shadow-xs"
										: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
								}`}
							>
								<Mail className="h-3.5 w-3.5" />
								<span>{t("project.tab_direct_email")}</span>
							</button>
							<button
								type="button"
								onClick={() => setInviteTab("link")}
								className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
									inviteTab === "link"
										? "bg-[var(--card-bg)] text-[var(--foreground)] shadow-xs"
										: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
								}`}
							>
								<LinkIcon className="h-3.5 w-3.5" />
								<span>{t("project.tab_invite_link")}</span>
							</button>
						</div>

						{inviteTab === "email" ? (
							<form onSubmit={handleInviteSubmit} className="space-y-4">
								<div className="space-y-1.5">
									<label className="text-xs font-semibold text-[var(--foreground)] block">
										{t("project.email_address")}
									</label>
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
									<label className="text-xs font-semibold text-[var(--foreground)] block">
										{t("project.project_role")}
									</label>
									<select
										value={inviteRole}
										onChange={(e) => setInviteRole(e.target.value as any)}
										className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
									>
										<option value="Editor">Editor</option>
										<option value="Viewer">Viewer</option>
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
						) : (
							<div className="space-y-4">
								<div className="space-y-1.5">
									<label className="text-xs font-semibold text-[var(--foreground)] block">
										{t("project.select_link_role")}
									</label>
									<select
										value={linkRole}
										onChange={(e) => setLinkRole(e.target.value as any)}
										className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs font-semibold text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 focus:outline-none"
									>
										<option value="Editor">
											{t("project.editor_link_option")}
										</option>
										<option value="Viewer">
											{t("project.viewer_link_option")}
										</option>
									</select>
									<p className="text-[11px] text-[var(--muted-foreground)]">
										{t("project.link_expiry_notice")}
									</p>
								</div>

								{generatedLink ? (
									<div className="space-y-2">
										<label className="text-xs font-semibold text-[var(--foreground)] block">
											{t("project.generated_link_label")}
										</label>
										<div className="flex items-center gap-2">
											<input
												type="text"
												readOnly
												value={generatedLink}
												className="flex-1 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-xs text-indigo-400 font-mono truncate focus:outline-none"
											/>
											<button
												type="button"
												onClick={handleCopyLink}
												className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all shrink-0"
											>
												{copied ? (
													<Check className="h-4 w-4" />
												) : (
													<Copy className="h-4 w-4" />
												)}
												<span>
													{copied
														? t("project.copied")
														: t("project.copy_link")}
												</span>
											</button>
										</div>
									</div>
								) : (
									<button
										type="button"
										onClick={handleGenerateLink}
										disabled={isGenerating}
										className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center justify-center gap-2"
									>
										<LinkIcon className="h-4 w-4" />
										<span>
											{isGenerating
												? t("project.generating")
												: `${t("project.generate_link_btn")} (${linkRole})`}
										</span>
									</button>
								)}
							</div>
						)}
					</div>
				</div>
			)}
		</main>
	);
}
