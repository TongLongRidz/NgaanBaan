"use client";

import { FileText, Globe, LayoutDashboard, LogOut, Moon, Plus, Settings, Sun, User, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showConfirm } from "@/components/ui/notification/sweetalert/sweetalert";
import { CreateProjectModal } from "@/components/ui/project/CreateProjectModal";
import { DisplaySettingsModal } from "@/components/ui/settings/DisplaySettingsModal";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

export function LandingNavbar() {
	const router = useRouter();
	const { theme, toggleTheme } = useTheme();
	const { language, toggleLanguage, t } = useLanguage();
	const isDark = theme === "dark";
	const [showSettings, setShowSettings] = useState(false);

	const [authChecking, setAuthChecking] = useState(true);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
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

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				let res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
				
				if (!res.ok) {
					const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
						method: "POST",
						credentials: "include",
					});
					if (refreshRes.ok) {
						res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
					}
				}

				if (res.ok) {
					const data = await res.json();
					const userData = data.user || data;
					if (userData && userData.is_email_verified) {
						setUserProfile(userData);
						setIsLoggedIn(true);
					}
				}
			} catch (_) {
			} finally {
				setAuthChecking(false);
			}
		};
		checkAuth();
	}, []);

	const handleStatusChange = async (status: UserStatus) => {
		setUserStatus(status);

		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
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
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				await fetch(`${apiUrl}/api/auth/logout`, {
					method: "POST",
					credentials: "include",
				});
			} catch (e) {
				console.error("Logout error:", e);
			}
			setIsLoggedIn(false);
			setUserProfile(null);
			router.push("/login");
		}
	};

	return (
		<>
			<nav className="h-16 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
				<Link href={isLoggedIn ? "/home" : "/"} className="flex items-center gap-2.5">
					<div className="h-9 w-9 rounded-xl bg-[var(--primary-btn-bg)] border border-[var(--card-border)] flex items-center justify-center shadow-md shrink-0">
						<LayoutDashboard className="h-5 w-5 text-[var(--primary-btn-text)]" />
					</div>
					<span className="font-bold text-base sm:text-lg tracking-tight truncate text-[var(--foreground)]">
						{t("common.brand")}
					</span>
				</Link>

				{/* Right Navigation Actions */}
				<div className="flex items-center gap-3">
					{isLoggedIn ? (
						<>
							{/* Go to App / Workspace Button */}
							<Link
								href="/home"
								className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] rounded-xl text-xs font-semibold shadow-xs transition-transform active:scale-95 duration-150"
								title={language === "th" ? "พื้นที่ทำงาน" : "Workspace"}
							>
								<LayoutDashboard className="h-4 w-4" />
								<span className="inline">{language === "th" ? "พื้นที่ทำงาน" : "Workspace"}</span>
							</Link>

							{/* User Profile Popover */}
							<div className="relative">
								<button
									onClick={() => setShowProfile(!showProfile)}
									className={`relative h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105 border-[var(--card-border)] cursor-pointer ${
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

										<div className="p-2 space-y-0.5 text-xs font-medium">
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

											<Link
												href="/home"
												onClick={() => setShowProfile(false)}
												className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
											>
												<LayoutDashboard className="h-4 w-4 text-slate-400" />
												<span>{t("common.brand")} (Dashboard)</span>
											</Link>

											<button
												onClick={() => {
													setShowProfile(false);
													setShowDisplaySettingsModal(true);
												}}
												className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all cursor-pointer ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
											>
												<Settings className="h-4 w-4 text-slate-400" />
												<span>{t("nav.settings")}</span>
											</button>

											<div
												className={`my-1 border-t ${isDark ? "border-slate-800/80" : "border-slate-200/80"}`}
											></div>

											<button
												onClick={toggleTheme}
												className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
											>
												<span className="flex items-center gap-3">
													{isDark ? (
														<Sun className="h-4 w-4 text-amber-400" />
													) : (
														<Moon className="h-4 w-4 text-slate-700 dark:text-amber-400" />
													)}
													<span>{t("nav.theme")}</span>
												</span>
												<span className="text-[10px] font-bold capitalize text-slate-400">
													{isDark ? t("nav.theme_dark") : t("nav.theme_light")}
												</span>
											</button>

											<button
												onClick={toggleLanguage}
												className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all cursor-pointer ${isDark ? "hover:bg-slate-800/60 text-slate-200" : "hover:bg-slate-100 text-slate-700"}`}
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
												className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-red-500 hover:bg-red-500/10 text-left cursor-pointer`}
											>
												<LogOut className="h-4 w-4 text-red-500" />
												<span>{t("common.sign_out")}</span>
											</button>
										</div>
									</div>
								)}
							</div>
						</>
					) : (
						/* Guest Controls: Language, Theme, Login, Register */
						<div className="flex items-center gap-2.5">
							<button
								onClick={toggleLanguage}
								className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs cursor-pointer"
								title="Switch Language"
							>
								<Globe className="h-3.5 w-3.5 text-slate-400" />
								<span>{language.toUpperCase()}</span>
							</button>

							<button
								onClick={toggleTheme}
								className="p-2 rounded-xl border transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs cursor-pointer"
								title="Toggle Theme"
							>
								{isDark ? (
									<Sun className="h-4 w-4 text-amber-400" />
								) : (
									<Moon className="h-4 w-4 text-slate-700 dark:text-amber-400" />
								)}
							</button>

							<Link
								href="/login"
								onClick={() => {
									if (typeof window !== "undefined") {
										sessionStorage.setItem("auth_mode", "login");
									}
								}}
								className="text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
							>
								{t("common.sign_in")}
							</Link>

							<Link
								href="/login"
								onClick={() => {
									if (typeof window !== "undefined") {
										sessionStorage.setItem("auth_mode", "register");
									}
								}}
								className="text-xs font-semibold px-4 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] border-[var(--card-border)] hover:opacity-90 shadow-sm"
							>
								{t("common.sign_up")}
							</Link>
						</div>
					)}
				</div>
			</nav>

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
		</>
	);
}
