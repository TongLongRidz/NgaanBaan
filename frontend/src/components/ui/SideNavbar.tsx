"use client";

import {
	AlertCircle,
	Bell,
	CalendarDays,
	CheckCheck,
	ChevronDown,
	ChevronRight,
	Clock,
	FolderKanban,
	Home,
	Layout,
	LayoutDashboard,
	PanelLeftClose,
	PanelLeftOpen,
	Star,
	User,
	UserCheck,
	Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

// Cookie Helper Utilities
function getCookieValue(key: string): string | null {
	if (typeof document === "undefined") return null;
	const match = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]*)`));
	return match ? decodeURIComponent(match[1]) : null;
}

function setCookieValue(key: string, value: string, days = 365) {
	if (typeof document === "undefined") return;
	const maxAge = days * 24 * 60 * 60;
	document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function getStoredState<T>(key: string, defaultValue: T): T {
	if (typeof window === "undefined") return defaultValue;
	try {
		// 1. Try Cookie first
		const cookieVal = getCookieValue(key);
		if (cookieVal !== null) {
			return JSON.parse(cookieVal);
		}
		// 2. Fallback to LocalStorage
		const saved = localStorage.getItem(key);
		if (saved !== null) {
			return JSON.parse(saved);
		}
	} catch {}
	return defaultValue;
}

function saveState<T>(key: string, value: T) {
	try {
		const stringified = JSON.stringify(value);
		setCookieValue(key, stringified);
		if (typeof window !== "undefined") {
			localStorage.setItem(key, stringified);
		}
	} catch {}
}

export function SideNavbar() {
	const pathname = usePathname();
	const { t } = useLanguage();

	const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
		if (typeof window !== "undefined") {
			const saved = getStoredState<boolean | null>(
				"sidenavbar_is_collapsed",
				null,
			);
			if (saved !== null) return saved;
			return window.innerWidth < 768;
		}
		return false;
	});

	// Track last main page (recents, starred, shared, mine, my-tasks)
	const [lastMainPage, setLastMainPage] = useState<string>("/projects/recent");

	useEffect(() => {
		if (typeof window !== "undefined" && pathname) {
			let mainRoute: string | null = null;

			if (pathname.startsWith("/my-tasks")) {
				mainRoute = "/my-tasks";
			} else if (pathname.startsWith("/projects/recent") || pathname.startsWith("/projects/recently")) {
				mainRoute = "/projects/recent";
			} else if (pathname.startsWith("/projects/starred")) {
				mainRoute = "/projects/starred";
			} else if (pathname.startsWith("/projects/shared")) {
				mainRoute = "/projects/shared";
			} else if (pathname.startsWith("/projects/mine")) {
				mainRoute = "/projects/mine";
			}

			if (mainRoute) {
				setLastMainPage(mainRoute);
				try {
					sessionStorage.setItem("last_main_page", mainRoute);
				} catch {}
			} else {
				const saved = sessionStorage.getItem("last_main_page");
				if (saved) {
					setLastMainPage(saved);
				}
			}
		}
	}, [pathname]);

	const [isRecentsOpen, setIsRecentsOpen] = useState<boolean>(() =>
		getStoredState<boolean>("sidenavbar_is_recents_open", true),
	);

	const [isMyProjectsOpen, setIsMyProjectsOpen] = useState<boolean>(() =>
		getStoredState<boolean>("sidenavbar_is_myprojects_open", true),
	);

	const [isMyTasksOpen, setIsMyTasksOpen] = useState<boolean>(() =>
		getStoredState<boolean>("sidenavbar_is_mytasks_open", true),
	);

	const toggleCollapsed = () => {
		setIsCollapsed((prev: boolean) => {
			const next = !prev;
			saveState("sidenavbar_is_collapsed", next);
			return next;
		});
	};

	const toggleRecentsOpen = () => {
		setIsRecentsOpen((prev: boolean) => {
			const next = !prev;
			saveState("sidenavbar_is_recents_open", next);
			return next;
		});
	};

	const toggleMyProjectsOpen = () => {
		setIsMyProjectsOpen((prev: boolean) => {
			const next = !prev;
			saveState("sidenavbar_is_myprojects_open", next);
			return next;
		});
	};

	const toggleMyTasksOpen = () => {
		setIsMyTasksOpen((prev: boolean) => {
			const next = !prev;
			saveState("sidenavbar_is_mytasks_open", next);
			return next;
		});
	};

	const [isSharedProjectsOpen, setIsSharedProjectsOpen] = useState<boolean>(() =>
		getStoredState<boolean>("sidenavbar_is_sharedprojects_open", true),
	);

	const toggleSharedProjectsOpen = () => {
		setIsSharedProjectsOpen((prev: boolean) => {
			const next = !prev;
			saveState("sidenavbar_is_sharedprojects_open", next);
			return next;
		});
	};

	const [recentProjects, setRecentProjects] = useState<
		Array<{ id: string; title: string; href: string }>
	>([]);
	const [myProjects, setMyProjects] = useState<
		Array<{ id: string; title: string; href: string }>
	>([]);
	const [sharedProjects, setSharedProjects] = useState<
		Array<{ id: string; title: string; href: string }>
	>([]);

	useEffect(() => {
		const fetchSidebarProjects = async () => {
			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

				// Fetch Recent Projects (limit 10)
				const recentRes = await fetch(
					`${apiUrl}/api/projects/recent?limit=10`,
					{
						credentials: "include",
					},
				);
				if (recentRes.ok) {
					const data = await recentRes.json();
					const items = Array.isArray(data) ? data : data.projects || [];
					const mapped = items.slice(0, 10).map((p: any) => ({
						id: p.id,
						title: p.title,
						href: `/projects/${p.id}`,
					}));
					setRecentProjects(mapped);
				}

				// Fetch Projects & categorize into My Projects (Owner) and Shared Projects (Editor/Viewer)
				const myRes = await fetch(`${apiUrl}/api/projects`, {
					credentials: "include",
				});
				if (myRes.ok) {
					const data = await myRes.json();
					if (Array.isArray(data)) {
						const mine = data
							.filter((p: any) => !p.role || p.role === "owner")
							.slice(0, 10)
							.map((p: any) => ({
								id: p.id,
								title: p.title,
								href: `/projects/${p.id}`,
							}));

						const shared = data
							.filter((p: any) => p.role && p.role !== "owner")
							.slice(0, 10)
							.map((p: any) => ({
								id: p.id,
								title: p.title,
								href: `/projects/${p.id}`,
							}));

						setMyProjects(mine);
						setSharedProjects(shared);
					}
				}
			} catch (err) {
				console.error("Failed to fetch sidebar projects:", err);
			}
		};

		fetchSidebarProjects();
	}, []);

	const myTasksSubItems = [
		{
			label: t("nav.assigned_to_me") || "Assigned to me",
			href: "/my-tasks/assigned",
			icon: UserCheck,
		},
		{
			label: t("nav.overdue") || "Overdue",
			href: "/my-tasks/overdue",
			icon: AlertCircle,
		},
		{
			label: t("nav.upcoming") || "Upcoming Due",
			href: "/my-tasks/upcoming",
			icon: CalendarDays,
		},
		{
			label: t("nav.completed") || "Completed",
			href: "/my-tasks/done",
			icon: CheckCheck,
		},
	];

	return (
		<aside
			className={`sticky top-0 left-0 h-screen self-start border-r border-[var(--card-border)] bg-[var(--card-bg)] text-[var(--foreground)] flex flex-col justify-between p-3 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto scrollbar-none shrink-0 z-50 animate-slide-down ${
				isCollapsed ? "w-16" : "w-64"
			}`}
		>
			<div className="space-y-4 w-full">
				{/* Brand Logo & Collapse Toggle Header */}
				<div
					className={`h-12 flex items-center ${isCollapsed ? "justify-center" : "justify-between px-1"} border-b border-[var(--card-border)] pb-3`}
				>
					{!isCollapsed ? (
						<>
							<Link
								href="/home"
								className="flex items-center gap-2.5 select-none overflow-hidden min-w-0 group cursor-pointer"
								title="Back to Home Overview"
							>
								<div className="h-8 w-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform">
									<LayoutDashboard className="h-4 w-4 text-slate-100" />
								</div>
								<h1 className="font-bold text-base leading-none truncate text-[var(--foreground)] transition-all duration-300 group-hover:text-indigo-400">
									{t("common.brand")}
								</h1>
							</Link>
							<button
								onClick={toggleCollapsed}
								className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors shrink-0 cursor-pointer"
								title="Collapse sidebar"
							>
								<PanelLeftClose className="h-4 w-4" />
							</button>
						</>
					) : (
						<button
							onClick={toggleCollapsed}
							className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-all shrink-0 cursor-pointer"
							title="Expand sidebar"
						>
							<PanelLeftOpen className="h-5 w-5" />
						</button>
					)}
				</div>

				<nav className="space-y-3">
					{/* SECTION 1: NAVIGATION & ACTIVITY ITEMS */}
					<div className="space-y-1">
						{/* Home */}
						<Link
							href="/home"
							title={isCollapsed ? `${t("nav.home") || "Home"}` : undefined}
							className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
								pathname === "/home"
									? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
									: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
							}`}
						>
							<div className="flex items-center gap-3 min-w-0">
								<Home
									className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/home" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
								/>
								<span
									className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
								>
									{t("nav.home") || "หน้าแรก"}
								</span>
							</div>
						</Link>

						{/* Notifications */}
						<Link
							href="/notifications"
							title={isCollapsed ? `${t("nav.notifications")}` : undefined}
							className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
								pathname === "/notifications"
									? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
									: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
							}`}
						>
							<div className="flex items-center gap-3 min-w-0">
								<Bell
									className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/notifications" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
								/>
								<span
									className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
								>
									{t("nav.notifications") || "Notification"}
								</span>
							</div>
						</Link>
					</div>

					<div className="border-t border-[var(--card-border)] pt-1 transition-all duration-300"></div>

					{/* SECTION 2: WORKSPACE & PROJECTS */}
					<div className="space-y-1">
						{/* Recently Section with Projects Submenu */}
						<div>
							<div
								className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
									pathname === "/projects/recent" ||
									pathname === "/projects/recently"
										? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
										: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
								}`}
							>
								<Link
									href="/projects/recent"
									title={isCollapsed ? `${t("nav.recents")}` : undefined}
									className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : "flex-1"}`}
								>
									<Clock
										className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/recent" || pathname === "/projects/recently" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
									/>
									<span
										className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
									>
										{t("nav.recents")}
									</span>
								</Link>
								{!isCollapsed && recentProjects.length > 0 && (
									<button
										onClick={toggleRecentsOpen}
										className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-opacity duration-200"
									>
										{isRecentsOpen ? (
											<ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
										) : (
											<ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
										)}
									</button>
								)}
							</div>

							{/* Recent Projects Submenu (Max 10 items) */}
							{isRecentsOpen && !isCollapsed && recentProjects.length > 0 && (
								<div className="ml-5 pl-3 border-l border-[var(--card-border)] space-y-1 mt-1 transition-all duration-300">
									{recentProjects.slice(0, 10).map((project) => {
										const isActive =
											pathname === project.href &&
											(lastMainPage === "/projects/recent" || lastMainPage === "/projects/recently");
										return (
											<Link
												key={`recent-${project.id}`}
												href={project.href}
												onClick={() => {
													try {
														sessionStorage.setItem("last_main_page", "/projects/recent");
														setLastMainPage("/projects/recent");
													} catch {}
												}}
												className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
													isActive
														? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
														: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
												}`}
											>
												<Layout className="h-3 w-3 text-amber-500 shrink-0" />
												<span className="truncate">{project.title}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>

						{/* Starred */}
						<Link
							href="/projects/starred"
							title={isCollapsed ? `${t("nav.starred")}` : undefined}
							className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
								pathname === "/projects/starred"
									? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
									: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
							}`}
						>
							<div className="flex items-center gap-3 min-w-0">
								<Star
									className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/starred" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
								/>
								<span
									className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
								>
									{t("nav.starred")}
								</span>
							</div>
						</Link>

						{/* Shared with me Section with Dropdown Submenu */}
						<div>
							<div
								className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
									pathname === "/projects/shared"
										? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
										: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
								}`}
							>
								<Link
									href="/projects/shared"
									title={isCollapsed ? `${t("nav.shared_with_me")}` : undefined}
									className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : "flex-1"}`}
								>
									<Users
										className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/shared" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
									/>
									<span
										className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
									>
										{t("nav.shared_with_me") || "Shared with me"}
									</span>
								</Link>
								{!isCollapsed && sharedProjects.length > 0 && (
									<button
										onClick={toggleSharedProjectsOpen}
										className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-opacity duration-200"
									>
										{isSharedProjectsOpen ? (
											<ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
										) : (
											<ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
										)}
									</button>
								)}
							</div>

							{/* Shared Projects Submenu */}
							{isSharedProjectsOpen && !isCollapsed && sharedProjects.length > 0 && (
								<div className="ml-5 pl-3 border-l border-[var(--card-border)] space-y-1 mt-1 transition-all duration-300">
									{sharedProjects.slice(0, 10).map((project) => {
										const isActive =
											pathname === project.href && lastMainPage === "/projects/shared";
										return (
											<Link
												key={`shared-${project.id}`}
												href={project.href}
												onClick={() => {
													try {
														sessionStorage.setItem("last_main_page", "/projects/shared");
														setLastMainPage("/projects/shared");
													} catch {}
												}}
												className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
													isActive
														? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
														: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
												}`}
											>
												<Layout className="h-3 w-3 text-indigo-400 shrink-0" />
												<span className="truncate">{project.title}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>

						{/* My Projects Section with Dropdown Submenu */}
						<div>
							<div
								className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
									pathname === "/projects/mine" || pathname === "/projects"
										? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
										: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
								}`}
							>
								<Link
									href="/projects/mine"
									title={isCollapsed ? `${t("nav.my_projects")}` : undefined}
									className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : "flex-1"}`}
								>
									<FolderKanban
										className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname === "/projects/mine" || pathname === "/projects" ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
									/>
									<span
										className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
									>
										{t("nav.my_projects") || "My Projects"}
									</span>
								</Link>
								{!isCollapsed && myProjects.length > 0 && (
									<button
										onClick={toggleMyProjectsOpen}
										className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-opacity duration-200"
									>
										{isMyProjectsOpen ? (
											<ChevronDown className="h-3.5 w-3.5 transition-transform duration-200" />
										) : (
											<ChevronRight className="h-3.5 w-3.5 transition-transform duration-200" />
										)}
									</button>
								)}
							</div>

							{/* My Projects Submenu */}
							{isMyProjectsOpen && !isCollapsed && myProjects.length > 0 && (
								<div className="ml-5 pl-3 border-l border-[var(--card-border)] space-y-1 mt-1 transition-all duration-300">
									{myProjects.slice(0, 10).map((project) => {
										const isActive =
											pathname === project.href &&
											(lastMainPage === "/projects/mine" || lastMainPage === "/projects");
										return (
											<Link
												key={`my-${project.id}`}
												href={project.href}
												onClick={() => {
													try {
														sessionStorage.setItem("last_main_page", "/projects/mine");
														setLastMainPage("/projects/mine");
													} catch {}
												}}
												className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
													isActive
														? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
														: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
												}`}
											>
												<Layout className="h-3 w-3 text-blue-500 shrink-0" />
												<span className="truncate">{project.title}</span>
											</Link>
										);
									})}
								</div>
							)}
						</div>
					</div>

					<div className="border-t border-[var(--card-border)] pt-1 transition-all duration-300"></div>

					{/* SECTION 3: MY TASKS */}
					<div className="space-y-1">
						<div
							className={`w-full flex items-center ${isCollapsed ? "justify-center" : "justify-between"} px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
								pathname.startsWith("/my-tasks")
									? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
									: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
							}`}
						>
							<Link
								href="/my-tasks"
								title={isCollapsed ? `${t("nav.my_tasks")}` : undefined}
								className={`flex items-center gap-3 min-w-0 ${isCollapsed ? "justify-center" : "flex-1"}`}
							>
								<User
									className={`h-4 w-4 shrink-0 transition-transform duration-200 ${pathname.startsWith("/my-tasks") ? "text-[var(--foreground)] scale-110" : "text-[var(--muted-foreground)]"}`}
								/>
								<span
									className={`truncate transition-all duration-300 ${isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100 w-auto"}`}
								>
									{t("nav.my_tasks")}
								</span>
							</Link>
							{!isCollapsed && (
								<button
									onClick={toggleMyTasksOpen}
									className="p-0.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded transition-opacity duration-200 cursor-pointer"
								>
									{isMyTasksOpen ? (
										<ChevronDown className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
									) : (
										<ChevronRight className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
									)}
								</button>
							)}
						</div>

						{/* My Tasks Submenu Dropdown */}
						{isMyTasksOpen && !isCollapsed && (
							<div className="ml-5 pl-3 border-l border-[var(--card-border)] space-y-1 mt-1 transition-all duration-300">
								{myTasksSubItems.map((sub) => {
									const SubIcon = sub.icon;
									const isSubActive = pathname === sub.href;
									return (
										<Link
											key={sub.label}
											href={sub.href}
											className={`flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
												isSubActive
													? "bg-[var(--input-bg)] text-[var(--foreground)] font-semibold"
													: "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)]"
											}`}
										>
											<div className="flex items-center gap-2.5 min-w-0">
												<SubIcon className="h-3.5 w-3.5 text-[var(--muted-foreground)] shrink-0" />
												<span className="truncate">{sub.label}</span>
											</div>
										</Link>
									);
								})}
							</div>
						)}
					</div>
				</nav>
			</div>
		</aside>
	);
}
