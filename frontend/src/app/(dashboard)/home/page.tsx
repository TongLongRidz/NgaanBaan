"use client";

import {
	Clock,
	Eye,
	FolderKanban,
	Grid,
	Layout,
	Pin,
	Users,
	ChevronRight,
	Sparkles,
	CheckSquare,
	CheckCircle2,
	Circle,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { useLanguage } from "@/hooks/useLanguage";
import { useDateTimeFormat } from "@/hooks/useDateTimeFormat";

interface ProjectItem {
	id: string;
	title: string;
	description: string;
	role?: string;
	members_count?: number;
	is_pinned?: boolean;
	updated_at?: string;
	last_viewed_at?: string;
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
	const [myProjects, setMyProjects] = useState<ProjectItem[]>([]);
	const [sharedProjects, setSharedProjects] = useState<ProjectItem[]>([]);
	const [myTasks, setMyTasks] = useState<TaskItem[]>([]);
	const [taskFilter, setTaskFilter] = useState<"all" | "overdue" | "upcoming" | "done">("all");
	const [projectTab, setProjectTab] = useState<"recent" | "shared" | "mine">("recent");
	const [loading, setLoading] = useState(true);

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

			// Fetch All Projects (Categorize My Projects vs Shared Projects)
			const allRes = await fetch(`${apiUrl}/api/projects`, { credentials: "include" });
			if (allRes.ok) {
				const data = await allRes.json();
				if (Array.isArray(data)) {
					const mine = data.filter((p: any) => !p.role || p.role.toLowerCase() === "owner");
					const shared = data.filter((p: any) => p.role && p.role.toLowerCase() !== "owner");
					setMyProjects(mine);
					setSharedProjects(shared);
				}
			}

			// Fetch My Tasks
			const tasksRes = await fetch(`${apiUrl}/api/tasks/my-tasks`, { credentials: "include" });
			if (tasksRes.ok) {
				const data = await tasksRes.json();
				const items = Array.isArray(data) ? data : data.tasks || [];
				setMyTasks(items);
			}
		} catch (err) {
			console.error("Failed to load dashboard data:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const [confirmModalState, setConfirmModalState] = useState<{
		isOpen: boolean;
		projectId: string;
		projectTitle: string;
		isPinned: boolean;
	}>({
		isOpen: false,
		projectId: "",
		projectTitle: "",
		isPinned: false,
	});

	const requestTogglePin = (e: React.MouseEvent, projectId: string, projectTitle: string, isPinned: boolean) => {
		e.preventDefault();
		e.stopPropagation();
		setConfirmModalState({
			isOpen: true,
			projectId,
			projectTitle,
			isPinned,
		});
	};

	const handleConfirmPinToggle = async () => {
		const { projectId } = confirmModalState;
		setConfirmModalState((prev) => ({ ...prev, isOpen: false }));
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			const res = await fetch(`${apiUrl}/api/projects/${projectId}/pin`, {
				method: "POST",
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				toast.success(
					data.is_pinned
						? t("projects.pinned_success") || "ปักหมุดโปรเจกต์แล้ว"
						: t("projects.unpinned_success") || "ยกเลิกการปักหมุดแล้ว",
				);
				fetchDashboardData();
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("projects-updated"));
				}
			}
		} catch (err) {
			console.error("Failed to pin project:", err);
		}
	};

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

	const formatRelativeTime = (dateStr?: string) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);
		const now = new Date();
		let diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (isNaN(diffInSeconds)) return "";
		if (diffInSeconds < 0) diffInSeconds = 1;

		const secondsInMinute = 60;
		const secondsInHour = 3600;
		const secondsInDay = 86400;

		if (diffInSeconds < secondsInMinute) {
			const sec = Math.max(1, diffInSeconds);
			return `${sec} วินาทีที่แล้ว`;
		} else if (diffInSeconds < secondsInHour) {
			const min = Math.floor(diffInSeconds / secondsInMinute);
			return `${min} นาทีที่แล้ว`;
		} else if (diffInSeconds < secondsInDay) {
			const hr = Math.floor(diffInSeconds / secondsInHour);
			return `${hr} ชั่วโมงที่แล้ว`;
		} else {
			const days = Math.floor(diffInSeconds / secondsInDay);
			return `${days} วันที่แล้ว`;
		}
	};

	const renderProjectCard = (p: ProjectItem, showPin = true) => (
		<Link
			key={p.id}
			href={`/projects/${p.id}`}
			className="group p-4 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between text-left"
		>
			<div>
				<div className="flex items-start justify-between gap-3 mb-2.5">
					<div className="h-8 w-8 rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--card-border)] flex items-center justify-center font-bold text-xs shrink-0">
						<Grid className="h-4 w-4 text-[var(--foreground)]" />
					</div>
					<div className="flex items-center gap-2">
						{showPin && (
							<button
								type="button"
								onClick={(e) => requestTogglePin(e, p.id, p.title, !!p.is_pinned)}
								title={p.is_pinned ? "ยกเลิกปักหมุด" : "ปักหมุดโปรเจกต์"}
								className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
									p.is_pinned
										? "bg-blue-500/10 border-blue-500/30 text-blue-500"
										: "bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-blue-500 hover:border-blue-500/30"
								}`}
							>
								<Pin className={`h-3.5 w-3.5 ${p.is_pinned ? "fill-blue-500 text-blue-500" : ""}`} />
							</button>
						)}
						<span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
							<Eye className="h-3 w-3 text-[var(--muted-foreground)]" />
							{formatRelativeTime(p.last_viewed_at || p.updated_at)}
						</span>
					</div>
				</div>

				<h3 className="font-bold text-sm md:text-base text-[var(--foreground)] group-hover:text-blue-500 transition-colors mb-1 truncate">
					{p.title}
				</h3>

				<p className="text-xs text-[var(--muted-foreground)] line-clamp-1 mb-3 leading-relaxed">
					{p.description || t("common.no_description") || "ไม่มีรายละเอียด"}
				</p>
			</div>

			<div className="flex items-center justify-between pt-2.5 border-t border-[var(--card-border)] text-xs text-[var(--muted-foreground)]">
				<div className="flex items-center gap-1.5">
					<Users className="h-3.5 w-3.5" />
					<span>
						{p.members_count || 1} {t("common.members") || "สมาชิก"}
					</span>
				</div>
				<span className="text-blue-500 font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
					{t("common.open") || "เปิด"} →
				</span>
			</div>
		</Link>
	);

	return (
		<>
			<TopNavbar />

			<main className="flex-1 px-4 py-6 md:px-6 md:py-8 w-full max-w-full space-y-6">
				{/* Layout: Left 50% for My Tasks (Square aspect-ratio), Right 50% for 3 stacked rows */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
					{/* Left Side (50%): My Tasks List Panel */}
					<div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-col justify-between w-full h-full">
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

							{filteredTasks.length > 0 ? (
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

					{/* Right Side (50%): Projects Tabbed Panel */}
					<div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs flex flex-col justify-between w-full h-full">
						<div className="space-y-4">
							<div className="flex items-center justify-between border-b border-[var(--card-border)] pb-4">
								<div className="flex items-center gap-2.5">
									{projectTab === "recent" && (
										<div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
											<Clock className="h-4 w-4" />
										</div>
									)}
									{projectTab === "shared" && (
										<div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
											<Users className="h-4 w-4" />
										</div>
									)}
									{projectTab === "mine" && (
										<div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
											<FolderKanban className="h-4 w-4" />
										</div>
									)}
									<h3 className="font-bold text-sm md:text-base text-[var(--foreground)]">
										{projectTab === "recent" && (t("nav.recents") || "เปิดล่าสุด")}
										{projectTab === "shared" && (t("nav.shared_with_me") || "แชร์กับฉัน")}
										{projectTab === "mine" && (t("nav.my_projects") || "โปรเจกต์ของฉัน")}
									</h3>
								</div>
								<Link
									href={
										projectTab === "recent"
											? "/projects/recent"
											: projectTab === "shared"
											? "/projects/shared"
											: "/projects/mine"
									}
									className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:underline flex items-center gap-1"
								>
									ดูทั้งหมด <ChevronRight className="h-3.5 w-3.5" />
								</Link>
							</div>

							{/* Project Sub-Filter Tabs */}
							<div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
								{[
									{ id: "recent", label: "ล่าสุด" },
									{ id: "shared", label: "แชร์กับฉัน" },
									{ id: "mine", label: "โปรเจกต์ของฉัน" },
								].map((tab) => (
									<button
										key={tab.id}
										onClick={() => setProjectTab(tab.id as any)}
										className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
											projectTab === tab.id
												? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs"
												: "bg-[var(--input-bg)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
										}`}
									>
										{tab.label}
									</button>
								))}
							</div>

							{/* List by Active Tab */}
							{projectTab === "recent" && (
								recentProjects.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
										{recentProjects.slice(0, 6).map((p) => renderProjectCard(p, false))}
									</div>
								) : (
									<div className="py-10 text-center text-xs text-[var(--muted-foreground)] space-y-1">
										<Clock className="h-6 w-6 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
										<p className="font-semibold text-[var(--foreground)]">ยังไม่มีโปรเจกต์ที่เปิดล่าสุด</p>
									</div>
								)
							)}

							{projectTab === "shared" && (
								sharedProjects.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
										{sharedProjects.slice(0, 6).map((p) => renderProjectCard(p))}
									</div>
								) : (
									<div className="py-10 text-center text-xs text-[var(--muted-foreground)] space-y-1">
										<Users className="h-6 w-6 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
										<p className="font-semibold text-[var(--foreground)]">ยังไม่มีโปรเจกต์ที่แชร์กับฉัน</p>
									</div>
								)
							)}

							{projectTab === "mine" && (
								myProjects.length > 0 ? (
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
										{myProjects.slice(0, 6).map((p) => renderProjectCard(p))}
									</div>
								) : (
									<div className="py-10 text-center text-xs text-[var(--muted-foreground)] space-y-1">
										<FolderKanban className="h-6 w-6 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
										<p className="font-semibold text-[var(--foreground)]">ยังไม่มีโปรเจกต์ของฉัน</p>
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</main>

			{/* Confirm Pin / Unpin Modal */}
			{confirmModalState.isOpen && (
				<div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
					<div className="w-full max-w-sm rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-6 shadow-2xl space-y-4 text-left">
						<div className="flex items-center gap-3">
							<div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
								<Pin className="h-5 w-5 fill-blue-500" />
							</div>
							<div>
								<h3 className="font-bold text-base text-[var(--foreground)]">
									{confirmModalState.isPinned ? "ยืนยันการยกเลิกปักหมุด" : "ยืนยันการปักหมุดโปรเจกต์"}
								</h3>
								<p className="text-xs text-[var(--muted-foreground)]">
									{confirmModalState.isPinned ? "ต้องการยกเลิกปักหมุด" : "ต้องการปักหมุดโปรเจกต์"}{" "}
									<span className="font-semibold text-[var(--foreground)]">"{confirmModalState.projectTitle}"</span>{" "}
									ใช่หรือไม่?
								</p>
							</div>
						</div>

						<div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[var(--card-border)]">
							<button
								type="button"
								onClick={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
								className="px-4 py-2 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors cursor-pointer"
							>
								ยกเลิก
							</button>
							<button
								type="button"
								onClick={handleConfirmPinToggle}
								className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
							>
								ยืนยัน
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
