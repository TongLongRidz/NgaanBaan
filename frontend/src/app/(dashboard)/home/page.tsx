"use client";

import {
	Clock,
	FolderKanban,
	Layout,
	Star,
	Users,
	ChevronRight,
	Sparkles,
	CheckSquare,
	CheckCircle2,
	Circle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { useLanguage } from "@/hooks/useLanguage";
import { useDateTimeFormat } from "@/hooks/useDateTimeFormat";

interface ProjectItem {
	id: string;
	title: string;
	description: string;
	role?: string;
	updated_at?: string;
}

interface TaskItem {
	id: string;
	board_id?: string;
	board_name?: string;
	title: string;
	priority?: string;
	due_date?: string;
	is_overdue?: boolean;
	is_completed?: boolean;
}

export default function DashboardOverviewPage() {
	const { t } = useLanguage();
	const { formatDate } = useDateTimeFormat();

	const [userName, setUserName] = useState<string>("");
	const [recentProjects, setRecentProjects] = useState<ProjectItem[]>([]);
	const [starredProjects, setStarredProjects] = useState<ProjectItem[]>([]);
	const [myProjects, setMyProjects] = useState<ProjectItem[]>([]);
	const [sharedProjects, setSharedProjects] = useState<ProjectItem[]>([]);
	const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
	const [taskFilter, setTaskFilter] = useState<"all" | "overdue" | "upcoming" | "done">("all");
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

				// Fetch current user
				const userRes = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
				if (userRes.ok) {
					const userData = await userRes.json();
					if (userData.firstname) {
						setUserName(`${userData.firstname}${userData.lastname ? " " + userData.lastname : ""}`);
					}
				}

				// Fetch Recent Projects
				const recentRes = await fetch(`${apiUrl}/api/projects/recent?limit=5`, { credentials: "include" });
				if (recentRes.ok) {
					const data = await recentRes.json();
					const items = Array.isArray(data) ? data : data.projects || [];
					setRecentProjects(items.slice(0, 5));
				}

				// Fetch Starred Projects
				const starredRes = await fetch(`${apiUrl}/api/projects/starred`, { credentials: "include" });
				if (starredRes.ok) {
					const data = await starredRes.json();
					if (Array.isArray(data)) {
						setStarredProjects(data.slice(0, 5));
					}
				}

				// Fetch All Projects (Categorize My Projects vs Shared Projects)
				const allRes = await fetch(`${apiUrl}/api/projects`, { credentials: "include" });
				if (allRes.ok) {
					const data = await allRes.json();
					if (Array.isArray(data)) {
						const mine = data.filter((p: any) => !p.role || p.role === "owner");
						const shared = data.filter((p: any) => p.role && p.role !== "owner");
						setMyProjects(mine.slice(0, 5));
						setSharedProjects(shared.slice(0, 5));
					}
				}

				// Fetch My Tasks
				const tasksRes = await fetch(`${apiUrl}/api/tasks/my-tasks`, { credentials: "include" });
				if (tasksRes.ok) {
					const data = await tasksRes.json();
					if (Array.isArray(data)) {
						setMyTasks(data);
					}
				}
			} catch (err) {
				console.error("Failed to load dashboard data:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, []);

	const toggleTaskCompletion = (taskId: string) => {
		setMyTasks((prev) =>
			prev.map((task) =>
				task.id === taskId
					? {
						...task,
						is_completed: !task.is_completed,
					}
					: task,
			),
		);
	};

	const filteredTasks = myTasks.filter((task) => {
		if (taskFilter === "overdue") {
			return task.is_overdue || (task.due_date && new Date(task.due_date) < new Date() && !task.is_completed);
		}
		if (taskFilter === "upcoming") {
			return !task.is_overdue && !task.is_completed;
		}
		if (taskFilter === "done") {
			return task.is_completed;
		}
		return true;
	}).slice(0, 5);

	return (
		<>
			<TopNavbar />

			<main className="flex-1 px-4 py-6 md:px-6 md:py-8 w-full max-w-full space-y-6 animate-fade-in">
				{/* Welcome Hero Card */}
				<div className="p-6 md:p-8 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs relative overflow-hidden text-[var(--foreground)] transition-all">
					<div className="relative z-10 space-y-2">
						<h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
							ยินดีต้อนรับกลับมา, <span className="text-indigo-500 dark:text-indigo-400">{userName || "ผู้ใช้งาน"}</span>
						</h1>
						<p className="text-xs md:text-sm text-[var(--muted-foreground)] max-w-xl leading-relaxed">
							สรุปภาพรวมพื้นที่ทำงานของคุณ ทั้งโปรเจกต์ที่เปิดล่าสุด ที่ติดดาวไว้ งานของฉัน และโปรเจกต์ที่ได้รับสิทธิ์เข้าร่วม
						</p>
					</div>
				</div>

				{/* 2 Core Summary Grid Cards: My Projects & Shared Projects */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{/* Card 1: My Projects */}
					<Link
						href="/projects/mine"
						className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/40 hover:shadow-md transition-all duration-200 group flex items-center justify-between"
					>
						<div className="flex items-center gap-3.5 min-w-0">
							<div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-105 transition-transform shrink-0">
								<FolderKanban className="h-5 w-5" />
							</div>
							<div className="truncate">
								<h4 className="font-bold text-sm text-[var(--foreground)] truncate">
									{t("nav.my_projects")}
								</h4>
								<p className="text-xs text-[var(--muted-foreground)] tabular-nums truncate mt-0.5">
									{myProjects.length} {t("nav.my_projects") || "โปรเจกต์ของฉัน"}
								</p>
							</div>
						</div>
						<ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
					</Link>

					{/* Card 2: Shared With Me */}
					<Link
						href="/projects/shared"
						className="p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-purple-500/40 hover:shadow-md transition-all duration-200 group flex items-center justify-between"
					>
						<div className="flex items-center gap-3.5 min-w-0">
							<div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-105 transition-transform shrink-0">
								<Users className="h-5 w-5" />
							</div>
							<div className="truncate">
								<h4 className="font-bold text-sm text-[var(--foreground)] truncate">
									{t("nav.shared")}
								</h4>
								<p className="text-xs text-[var(--muted-foreground)] tabular-nums truncate mt-0.5">
									{sharedProjects.length} {t("nav.shared") || "แชร์กับฉัน"}
								</p>
							</div>
						</div>
						<ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
					</Link>
				</div>

				{/* 3 Detailed Panels Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Panel 1: My Tasks List Panel */}
					<div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4 flex flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
								<div className="flex items-center gap-2.5">
									<div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
										<CheckSquare className="h-4 w-4" />
									</div>
									<h3 className="font-bold text-sm md:text-base text-[var(--foreground)]">
										{t("nav.my_tasks")}
									</h3>
								</div>
								<Link
									href="/my-tasks"
									className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1"
								>
									ดูทั้งหมด <ChevronRight className="h-3.5 w-3.5" />
								</Link>
							</div>

							{/* Task Sub-Filter Pills (Placed below the main panel divider) */}
							<div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
								{[
									{ id: "all", label: "ได้รับมอบหมาย" },
									{ id: "overdue", label: "เลยกำหนด" },
									{ id: "upcoming", label: "ใกล้ถึงกำหนด" },
									{ id: "done", label: "เสร็จสิ้น" },
								].map((filter) => (
									<button
										key={filter.id}
										onClick={() => setTaskFilter(filter.id as any)}
										className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${taskFilter === filter.id
												? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
												: "bg-[var(--input-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
											}`}
									>
										{filter.label}
									</button>
								))}
							</div>

							{loading ? (
								<div className="space-y-3">
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className="h-14 rounded-2xl bg-[var(--input-bg)] animate-pulse border border-[var(--card-border)]"
										/>
									))}
								</div>
							) : filteredTasks.length > 0 ? (
								<div className="space-y-2.5">
									{filteredTasks.map((t) => (
										<div
											key={t.id}
											className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-emerald-500/30 hover:shadow-xs transition-all group"
										>
											<div className="flex items-center gap-3 min-w-0">
												<button
													onClick={() => toggleTaskCompletion(t.id)}
													className="cursor-pointer shrink-0"
												>
													{t.is_completed ? (
														<CheckCircle2 className="h-4 w-4 text-emerald-500" />
													) : (
														<Circle className="h-4 w-4 text-[var(--muted-foreground)] hover:text-emerald-500" />
													)}
												</button>
												<div className="truncate">
													<h5 className={`font-bold text-xs truncate ${t.is_completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"}`}>
														{t.title}
													</h5>
													{t.board_name && (
														<p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
															{t.board_name}
														</p>
													)}
												</div>
											</div>
											<span className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0 ml-2">
												{t.priority || "medium"}
											</span>
										</div>
									))}
								</div>
							) : (
								<div className="py-10 text-center text-xs text-[var(--muted-foreground)] space-y-1">
									<CheckSquare className="h-6 w-6 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
									<p className="font-semibold text-[var(--foreground)]">ไม่มีรายการงานในหมวดหมู่นี้</p>
								</div>
							)}
						</div>
					</div>

					{/* Panel 2: Recent Projects */}
					<div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4 flex flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
								<div className="flex items-center gap-2.5">
									<div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
										<Clock className="h-4 w-4" />
									</div>
									<h3 className="font-bold text-sm md:text-base text-[var(--foreground)]">
										{t("nav.recents")}
									</h3>
								</div>
								<Link
									href="/projects/recent"
									className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1"
								>
									ดูทั้งหมด <ChevronRight className="h-3.5 w-3.5" />
								</Link>
							</div>

							{loading ? (
								<div className="space-y-3">
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className="h-14 rounded-2xl bg-[var(--input-bg)] animate-pulse border border-[var(--card-border)]"
										/>
									))}
								</div>
							) : recentProjects.length > 0 ? (
								<div className="space-y-2.5">
									{recentProjects.slice(0, 5).map((p) => (
										<Link
											key={p.id}
											href={`/projects/${p.id}`}
											className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-indigo-500/30 hover:shadow-xs transition-all group"
										>
											<div className="flex items-center gap-3 min-w-0">
												<div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-105 transition-transform shrink-0">
													<Layout className="h-4 w-4" />
												</div>
												<div className="truncate">
													<h5 className="font-bold text-xs text-[var(--foreground)] truncate">
														{p.title}
													</h5>
													<p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
														{p.description || t("common.no_description")}
													</p>
												</div>
											</div>
											<ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
										</Link>
									))}
								</div>
							) : (
								<div className="py-10 text-center text-xs text-[var(--muted-foreground)] space-y-1">
									<Clock className="h-6 w-6 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
									<p className="font-semibold text-[var(--foreground)]">ยังไม่มีโปรเจกต์ที่เปิดล่าสุด</p>
								</div>
							)}
						</div>
					</div>

					{/* Panel 3: Starred Projects */}
					<div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4 flex flex-col justify-between">
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
								<div className="flex items-center gap-2.5">
									<div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500">
										<Star className="h-4 w-4 fill-yellow-500" />
									</div>
									<h3 className="font-bold text-sm md:text-base text-[var(--foreground)]">
										{t("nav.starred")}
									</h3>
								</div>
								<Link
									href="/projects/starred"
									className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1"
								>
									ดูทั้งหมด <ChevronRight className="h-3.5 w-3.5" />
								</Link>
							</div>

							{loading ? (
								<div className="space-y-3">
									{[1, 2, 3, 4, 5].map((i) => (
										<div
											key={i}
											className="h-14 rounded-2xl bg-[var(--input-bg)] animate-pulse border border-[var(--card-border)]"
										/>
									))}
								</div>
							) : starredProjects.length > 0 ? (
								<div className="space-y-2.5">
									{starredProjects.map((p) => (
										<Link
											key={p.id}
											href={`/projects/${p.id}`}
											className="flex items-center justify-between p-3.5 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-yellow-500/30 hover:shadow-xs transition-all group"
										>
											<div className="flex items-center gap-3 min-w-0">
												<div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 group-hover:scale-105 transition-transform shrink-0">
													<Star className="h-4 w-4 fill-yellow-500" />
												</div>
												<div className="truncate">
													<h5 className="font-bold text-xs text-[var(--foreground)] truncate">
														{p.title}
													</h5>
													<p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
														{p.description || t("common.no_description")}
													</p>
												</div>
											</div>
											<ChevronRight className="h-4 w-4 text-[var(--muted-foreground)] group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
										</Link>
									))}
								</div>
							) : (
								<div className="py-10 text-center text-xs text-[var(--muted-foreground)] space-y-1">
									<Star className="h-6 w-6 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
									<p className="font-semibold text-[var(--foreground)]">ยังไม่มีโปรเจกต์ที่ติดดาวไว้</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
