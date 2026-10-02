"use client";

import { FileText, Globe, Info, LogOut, Moon, MoreHorizontal, Pin, Plus, Settings, Sun, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { showConfirm } from "@/components/ui/notification/sweetalert/sweetalert";
import { CreateProjectModal } from "@/components/ui/project/CreateProjectModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

import { ProjectSubNavbar, ProjectSubTab } from "@/components/project/ProjectSubNavbar";

import { DisplaySettingsModal } from "@/components/ui/settings/DisplaySettingsModal";

interface TopNavbarProps {
	title?: string;
	description?: string;
	activeTab?: ProjectSubTab;
	setActiveTab?: (tab: ProjectSubTab) => void;
	userRole?: string;
	projectId?: string;
	isPinned?: boolean;
	onTogglePin?: () => void;
}

export function TopNavbar({ title, description, activeTab, setActiveTab, userRole, projectId, isPinned, onTogglePin }: TopNavbarProps) {
	const router = useRouter();
	const { theme, toggleTheme } = useTheme();
	const { language, toggleLanguage, t } = useLanguage();
	const isDark = theme === "dark";

	const [showKebabMenu, setShowKebabMenu] = useState(false);
	const [currentPinned, setCurrentPinned] = useState<boolean>(isPinned || false);

	React.useEffect(() => {
		if (isPinned !== undefined) {
			setCurrentPinned(isPinned);
		}
	}, [isPinned]);

	const handlePinToggle = async () => {
		setShowKebabMenu(false);
		if (onTogglePin) {
			onTogglePin();
			return;
		}
		if (!projectId) return;

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			const res = await fetch(`${apiUrl}/api/projects/${projectId}/pin`, {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				setCurrentPinned(data.is_pinned);
				toast.success(
					data.is_pinned
						? t("projects.pinned_success") || "ปักหมุดโปรเจกต์แล้ว"
						: t("projects.unpinned_success") || "ยกเลิกการปักหมุดแล้ว",
				);
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("projects-updated"));
				}
			}
		} catch (err) {
			console.error("Failed to toggle pin:", err);
		}
	};

	const [userProfile, setUserProfile] = useState<{
		firstname: string;
		lastname: string;
		email: string;
		avatar_url: string;
	} | null>(null);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showDisplaySettingsModal, setShowDisplaySettingsModal] = useState(false);
	const [showProfile, setShowProfile] = useState(false);
	type UserStatus = "active" | "away" | "offline";
	const [userStatus, setUserStatus] = useState<UserStatus>("active");

	const handleStatusChange = async (status: UserStatus) => {
		setUserStatus(status);

		try {
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			await fetch(`${apiUrl}/api/auth/status`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ status }),
			});
		} catch (e) {
			console.error("Failed to sync status to backend:", e);
		}
	};

	const getStatusColor = (status: UserStatus) => {
		switch (status) {
			case "active":
				return "bg-emerald-500";
			case "away":
				return "bg-amber-400";
			case "offline":
				return "bg-slate-400";
		}
	};

	// Automated Status & Activity Tracker (10 mins idle -> away, activity -> active)
	const userStatusRef = React.useRef<UserStatus>("active");
	userStatusRef.current = userStatus;

	React.useEffect(() => {
		const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
		let lastActivityTime = Date.now();

		const handleUserActivity = () => {
			lastActivityTime = Date.now();
			if (userStatusRef.current === "away") {
				handleStatusChange("active");
			}
		};

		const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
		events.forEach((event) => {
			window.addEventListener(event, handleUserActivity, { passive: true });
		});

		const idleCheckInterval = setInterval(() => {
			const idleDuration = Date.now() - lastActivityTime;
			if (
				idleDuration >= IDLE_TIMEOUT_MS &&
				userStatusRef.current === "active"
			) {
				handleStatusChange("away");
			}
		}, 10000);

		return () => {
			events.forEach((event) => {
				window.removeEventListener(event, handleUserActivity);
			});
			clearInterval(idleCheckInterval);
		};
	}, []);

	React.useEffect(() => {
		const fetchMe = async () => {
			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

				const res = await fetch(`${apiUrl}/api/auth/me`, {
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					setUserProfile(data);
					// Set active on successful login/fetch if not offline
					if (data.status === "away") {
						setUserStatus("away");
					} else {
						handleStatusChange("active");
					}
				}
			} catch (err) {
				console.error("Failed to fetch user profile:", err);
			}
		};
		fetchMe();
	}, []);

	const handleSignOut = async () => {
		const res = await showConfirm(
			language === "th" ? "ยืนยันการออกจากระบบ" : "Confirm Logout",
			language === "th"
				? "คุณต้องการออกจากระบบใช่หรือไม่?"
				: "Are you sure you want to sign out?",
			language === "th" ? "ออกจากระบบ" : "Sign Out",
			language === "th" ? "ยกเลิก" : "Cancel",
		);

		if (res.isConfirmed) {
			try {
				await handleStatusChange("offline");
				const apiUrl =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				await fetch(`${apiUrl}/api/auth/logout`, {
					method: "POST",
					credentials: "include",
				});
			} catch (e) {
				console.error("Logout error:", e);
			}
			localStorage.removeItem("user_status");
			router.push("/login");
		}
	};

	const [showDescModal, setShowDescModal] = useState(false);

	return (
		<>
			<header className="w-full min-w-full h-16 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md px-3 sm:px-6 flex items-center justify-between sticky top-0 z-[100] transition-colors duration-300 text-[var(--foreground)]">
				<div className="flex items-center gap-3 sm:gap-4">
					{title && (
						<div className="flex items-center gap-2">
							<h1 className="font-bold text-base sm:text-lg text-[var(--foreground)] truncate shrink-0">
								{title}
							</h1>
							{description && (
								<button
									onClick={() => setShowDescModal(true)}
									className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/20 transition-all cursor-pointer"
									title={t("project.description") || "Project Description"}
								>
									<Info className="h-4 w-4" />
								</button>
							)}

							{/* Horizontal Kebab Menu (...) */}
							<div
								className="relative"
								onMouseLeave={() => setShowKebabMenu(false)}
							>
								<button
									onClick={() => setShowKebabMenu(!showKebabMenu)}
									className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-border)]/20 transition-all cursor-pointer"
									title="ตัวเลือกเพิ่มเติม (More options)"
								>
									<MoreHorizontal className="h-4 w-4" />
								</button>

								{showKebabMenu && (
									<>
										<div
											className="fixed inset-0 z-[9998]"
											onClick={() => setShowKebabMenu(false)}
										/>
										<div
											className="absolute left-0 mt-2 w-48 rounded-xl border border-[var(--popover-border)] bg-[var(--popover-bg)] text-[var(--foreground)] shadow-xl p-1.5 z-[9999] animate-in fade-in duration-150"
											onMouseLeave={() => setShowKebabMenu(false)}
										>
											<button
												onClick={handlePinToggle}
												className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium hover:bg-[var(--input-bg)] transition-colors text-left"
											>
												<Pin className={`h-4 w-4 ${currentPinned ? "fill-blue-500 text-blue-500" : "text-[var(--muted-foreground)]"}`} />
												<span>{currentPinned ? "ยกเลิกการปักหมุด" : "ปักหมุดโปรเจกต์"}</span>
											</button>
										</div>
									</>
								)}
							</div>
						</div>
					)}
				</div>

				<div className="flex items-center gap-3">
					{/* Create Project Button in TopNavbar */}
					<button
						onClick={() => setShowCreateModal(true)}
						className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] rounded-xl text-xs font-semibold shadow-xs transition-transform active:scale-95 duration-150"
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
								className={`relative h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 border-[var(--card-border)] ${
									showProfile ? "ring-2 ring-offset-2 ring-slate-500" : ""
								}`}
								title="User Account"
							>
								<div className="h-full w-full rounded-full overflow-hidden">
									{userProfile?.avatar_url ? (
										<img
											src={userProfile.avatar_url}
											alt="User Avatar"
											className="h-full w-full object-cover"
										/>
									) : (
										<div className="h-full w-full bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] flex items-center justify-center text-xs font-bold uppercase">
											{userProfile
												? `${userProfile.firstname?.[0] || ""}${userProfile.lastname?.[0] || ""}`
												: "NB"}
										</div>
									)}
								</div>
								{/* Status Indicator Dot */}
								<span
									className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[var(--nav-bg)] ${getStatusColor(
										userStatus,
									)}`}
								/>
							</button>

							{/* Click-outside Backdrop */}
							{showProfile && (
								<div
									className="fixed inset-0 z-[9998]"
									onClick={() => setShowProfile(false)}
								/>
							)}

							{/* Profile Popover Dropdown */}
							{showProfile && (
								<div className="absolute right-0 mt-2 w-72 rounded-2xl border border-[var(--popover-border)] bg-[var(--popover-bg)] text-[var(--foreground)] shadow-2xl overflow-hidden z-[9999] transition-all">
									{/* Header User Card */}
									<div className="p-4 border-b border-[var(--card-border)] flex items-center gap-3.5 bg-[var(--input-bg)]">
										<div className="relative shrink-0">
											<div className="h-10 w-10 rounded-full overflow-hidden border border-[var(--card-border)] shadow-md">
												{userProfile?.avatar_url ? (
													<img
														src={userProfile.avatar_url}
														alt="User Avatar"
														className="h-full w-full object-cover"
													/>
												) : (
													<div className="h-full w-full bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] flex items-center justify-center text-xs font-bold uppercase">
														{userProfile
															? `${userProfile.firstname?.[0] || ""}${userProfile.lastname?.[0] || ""}`
															: "NB"}
													</div>
												)}
											</div>
											<span
												className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-[var(--popover-bg)] ${getStatusColor(
													userStatus,
												)}`}
											/>
										</div>
										<div className="overflow-hidden">
											<h4 className="font-bold text-xs truncate">
												{userProfile
													? `${userProfile.firstname} ${userProfile.lastname}`.trim()
													: "Loading Profile..."}
											</h4>
											<p
												className={`text-[11px] truncate mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}
											>
												{userProfile?.email || ""}
											</p>
										</div>
									</div>

									{/* Popover Menu Links */}
									<div className="p-2 space-y-0.5 text-xs font-medium">
										{/* Auto Status Display Row */}
										<div
											className={`px-3 py-2 rounded-xl flex items-center justify-between transition-all ${
												isDark ? "bg-slate-800/40" : "bg-slate-50"
											}`}
										>
											<span className="flex items-center gap-2 text-xs text-slate-400 font-medium">
												<span>{t("nav.status")}</span>
											</span>
											<div className="flex items-center gap-1.5 text-xs font-semibold">
												<span
													className={`h-2.5 w-2.5 rounded-full ${getStatusColor(
														userStatus,
													)}`}
												/>
												<span className="text-xs font-bold capitalize text-[var(--foreground)]">
													{userStatus === "active"
														? t("nav.status_active")
														: userStatus === "away"
														? t("nav.status_away")
														: t("nav.status_offline")}
												</span>
											</div>
										</div>

										<div
											className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}
										></div>

										<button
											className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
										>
											<User className="h-4 w-4 text-slate-400" />
											<span>{t("nav.profile")}</span>
										</button>

										<button
											onClick={() => {
												setShowProfile(false);
												setShowDisplaySettingsModal(true);
											}}
											className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
										>
											<Settings className="h-4 w-4 text-slate-400" />
											<span>{t("nav.settings")}</span>
										</button>

										<div
											className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}
										></div>

										{/* Theme Toggle */}
										<button
											onClick={(e) => toggleTheme(e)}
											className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
										>
											<span className="flex items-center gap-3">
												{isDark ? (
													<Moon className="h-4 w-4 text-amber-400" />
												) : (
													<Sun className="h-4 w-4 text-amber-500" />
												)}
												<span>{t("nav.theme")}</span>
											</span>
											<span className="text-[10px] font-bold capitalize text-slate-400">
												{isDark ? t("nav.theme_dark") : t("nav.theme_light")}
											</span>
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
											<span className="text-[10px] font-bold text-slate-400">
												{language === "th" ? t("nav.lang_th") : t("nav.lang_en")}
											</span>
										</button>

										<div
											className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}
										></div>

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

			{/* Reusable Create Project Modal */}
			<CreateProjectModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
			/>

			{/* Display Settings Modal */}
			<DisplaySettingsModal
				isOpen={showDisplaySettingsModal}
				onClose={() => setShowDisplaySettingsModal(false)}
			/>

			{/* Project Description Modal */}
			{showDescModal && (
				<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
					<div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl p-6 space-y-4 relative text-[var(--foreground)]">
						<button
							onClick={() => setShowDescModal(false)}
							className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
						>
							<X className="h-4 w-4" />
						</button>

						<div className="flex items-center gap-2.5 border-b border-[var(--card-border)] pb-3">
							<div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
								<FileText className="h-5 w-5" />
							</div>
							<h3 className="font-bold text-base text-[var(--foreground)] truncate">
								{title || t("project.description")}
							</h3>
						</div>

						<div className="space-y-2">
							<span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider">
								{t("project.description")}
							</span>
							<p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-line bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--card-border)] max-h-60 overflow-y-auto">
								{description || t("common.no_description")}
							</p>
						</div>

						<div className="pt-2 flex justify-end">
							<button
								onClick={() => setShowDescModal(false)}
								className="px-4 py-2 bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
							>
								{t("common.close")}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
