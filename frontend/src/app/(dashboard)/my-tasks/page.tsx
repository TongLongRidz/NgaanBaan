"use client";

import {
	AlertCircle,
	CalendarDays,
	CheckCheck,
	CheckCircle2,
	CheckSquare,
	Circle,
	Clock,
	UserCheck,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { useLanguage } from "@/hooks/useLanguage";
import { useDateTimeFormat } from "@/hooks/useDateTimeFormat";

export interface TaskItem {
	id: string;
	board_id: string;
	board_name: string;
	title: string;
	description: string;
	priority: "low" | "medium" | "high" | "urgent";
	due_date?: string;
	is_overdue?: boolean;
	is_today?: boolean;
	is_completed: boolean;
}

export interface TaskListViewProps {
	pageTitle: string;
	headerIcon: React.ReactNode;
	modeFilter?: "assigned" | "overdue" | "upcoming" | "done";
}

export function TaskListView({
	pageTitle,
	headerIcon,
	modeFilter,
}: TaskListViewProps) {
	const { t } = useLanguage();
	const { formatDate } = useDateTimeFormat();
	const [tasks, setTasks] = useState<TaskItem[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchMyTasks = async () => {
			setLoading(true);
			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				const res = await fetch(`${apiUrl}/api/tasks/my-tasks`, { credentials: "include" });
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data)) {
						setTasks(data);
					}
				}
			} catch (err) {
				console.error("Failed to fetch my tasks:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchMyTasks();
	}, []);

	const toggleTaskCompletion = (taskId: string) => {
		setTasks((prev) =>
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

	const filteredTasks = tasks.filter((task) => {
		if (modeFilter === "overdue") return task.is_overdue || (task.due_date && new Date(task.due_date) < new Date() && !task.is_completed);
		if (modeFilter === "upcoming") return !task.is_overdue && !task.is_completed;
		if (modeFilter === "done") return task.is_completed;
		return true;
	});

	return (
		<>
			<TopNavbar title={pageTitle} />

			<main className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-6 animate-fade-in">
				{/* Page Header */}
				<div className="flex items-center gap-3 border-b border-[var(--card-border)] pb-4">
					<div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
						{headerIcon}
					</div>
					<div>
						<h1 className="text-xl md:text-2xl font-bold text-[var(--foreground)]">
							{pageTitle}
						</h1>
						<p className="text-xs text-[var(--muted-foreground)]">
							{t("tasks.subtitle") || "รวมรายการงานที่ได้รับมอบหมายและสถานะความคืบหน้า"}
						</p>
					</div>
				</div>

				{/* Task List Container */}
				<div className="p-6 rounded-3xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs space-y-4">
					{loading ? (
						<div className="space-y-3">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="h-14 rounded-2xl bg-[var(--input-bg)] animate-pulse border border-[var(--card-border)]"
								/>
							))}
						</div>
					) : filteredTasks.length > 0 ? (
						<div className="space-y-2.5">
							{filteredTasks.map((task) => (
								<div
									key={task.id}
									className="flex items-center justify-between p-4 rounded-2xl bg-[var(--input-bg)] border border-[var(--card-border)] hover:border-indigo-500/30 transition-all group"
								>
									<div className="flex items-center gap-3 min-w-0">
										<button
											onClick={() => toggleTaskCompletion(task.id)}
											className="cursor-pointer shrink-0"
										>
											{task.is_completed ? (
												<CheckCircle2 className="h-5 w-5 text-emerald-500" />
											) : (
												<Circle className="h-5 w-5 text-[var(--muted-foreground)] hover:text-indigo-400" />
											)}
										</button>
										<div className="truncate">
											<h4
												className={`font-semibold text-xs md:text-sm truncate ${
													task.is_completed
														? "line-through text-[var(--muted-foreground)]"
														: "text-[var(--foreground)]"
												}`}
											>
												{task.title}
											</h4>
											{task.board_name && (
												<p className="text-[11px] text-[var(--muted-foreground)] truncate mt-0.5">
													{task.board_name}
												</p>
											)}
										</div>
									</div>

									<div className="flex items-center gap-3 shrink-0 ml-3">
										{task.due_date && (
											<span className="text-[11px] text-[var(--muted-foreground)] tabular-nums hidden sm:inline-block">
												{formatDate(task.due_date)}
											</span>
										)}
										<span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
											{task.priority || "medium"}
										</span>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="py-12 text-center space-y-2">
							<CheckSquare className="h-8 w-8 mx-auto text-[var(--muted-foreground)] opacity-40 mb-2" />
							<h3 className="font-bold text-sm text-[var(--foreground)]">
								{t("tasks.no_tasks") || "ไม่มีรายการงานในหมวดหมู่นี้"}
							</h3>
							<p className="text-xs text-[var(--muted-foreground)] max-w-sm mx-auto">
								{t("tasks.no_tasks_desc") || "คุณได้จัดการงานทั้งหมดเรียบร้อยแล้ว หรือยังไม่มีการมอบหมายงานใหม่"}
							</p>
						</div>
					)}
				</div>
			</main>
		</>
	);
}

export default function MyTasksPage() {
	const { t } = useLanguage();
	return (
		<TaskListView
			pageTitle={t("nav.my_tasks") || "My Tasks"}
			headerIcon={<CheckSquare className="h-5 w-5" />}
		/>
	);
}
