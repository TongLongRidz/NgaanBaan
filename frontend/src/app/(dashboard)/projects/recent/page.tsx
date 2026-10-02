"use client";

import {
	ChevronLeft,
	ChevronRight,
	Clock,
	Eye,
	FolderKanban,
	Grid,
	Pin,
	Plus,
	Users,
} from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreateProjectModal } from "@/components/ui/project/CreateProjectModal";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { useLanguage } from "@/hooks/useLanguage";

interface Project {
	id: string;
	title: string;
	description: string;
	members_count: number;
	is_pinned?: boolean;
	last_viewed_at?: string;
	updated_at: string;
}

export default function RecentProjectsPage() {
	const { t } = useLanguage();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [showCreateModal, setShowCreateModal] = useState(false);

	const formatRelativeTime = (dateStr?: string) => {
		if (!dateStr) return "";
		const date = new Date(dateStr);
		const now = new Date();
		const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (isNaN(diffInSeconds) || diffInSeconds <= 0) {
			return "เมื่อสักครู่";
		}

		const secondsInMinute = 60;
		const secondsInHour = 3600;
		const secondsInDay = 86400;

		if (diffInSeconds < secondsInMinute) {
			return `${diffInSeconds} วินาทีที่แล้ว`;
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

	// Pagination State
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(6);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);

	const fetchRecentProjects = async (
		currentPage: number,
		currentLimit: number,
	) => {
		setLoading(true);
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			const res = await fetch(
				`${apiUrl}/api/projects/recent?page=${currentPage}&limit=${currentLimit}`,
				{
					credentials: "include",
				},
			);
			if (res.ok) {
				const data = await res.json();
				setProjects(data.projects || []);
				setTotalPages(data.total_pages || 1);
				setTotalItems(data.total || 0);
			}
		} catch (err) {
			console.error("Failed to fetch recent projects:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRecentProjects(page, limit);
	}, [page, limit]);

	const togglePin = async (e: React.MouseEvent, projectId: string) => {
		e.preventDefault();
		e.stopPropagation();
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
				fetchRecentProjects(page, limit);
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("projects-updated"));
				}
			}
		} catch (err) {
			console.error("Failed to pin project:", err);
		}
	};

	const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const newLimit = parseInt(e.target.value, 10);
		setLimit(newLimit);
		setPage(1);
	};

	return (
		<>
			<TopNavbar />

			{/* Main Content */}
			<main className="flex-1 p-6 md:p-8 flex flex-col min-h-[calc(100vh-64px)]">
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
					<div className="flex items-center gap-3">
						<div className="h-10 w-10 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-[var(--foreground)] flex items-center justify-center shadow-xs">
							<Clock className="h-5 w-5" />
						</div>
						<div>
							<h2 className="font-bold text-2xl leading-none text-[var(--foreground)]">
								{t("nav.recents") || "Recently Opened Projects"}
							</h2>
						</div>
					</div>

					{/* Page Limit Selector */}
					{totalItems > 0 && (
						<div className="flex items-center gap-3 self-end md:self-auto">
							<label className="text-xs text-[var(--muted-foreground)] font-medium">
								Items per page:
							</label>
							<select
								value={limit}
								onChange={handleLimitChange}
								className="px-3 py-1.5 rounded-lg bg-[var(--card-bg)] border border-[var(--card-border)] text-xs text-[var(--foreground)] font-medium focus:outline-hidden focus:ring-2 focus:ring-primary/20"
							>
								<option value={6}>6</option>
								<option value={12}>12</option>
								<option value={24}>24</option>
								<option value={48}>48</option>
							</select>
						</div>
					)}
				</div>

				{/* Content Area */}
				{projects.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto w-full">
						<div className="w-12 h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--muted-foreground)] mb-3.5 shadow-xs">
							<FolderKanban className="w-5 h-5 opacity-70" />
						</div>
						<h3 className="font-bold text-base md:text-lg text-[var(--foreground)] tracking-tight mb-1">
							{t("empty.no_recent_projects")}
						</h3>
						<p className="text-xs text-[var(--muted-foreground)] max-w-[320px] sm:max-w-md mb-5 leading-relaxed whitespace-pre-line">
							{t("empty.no_recent_desc")}
						</p>
						<button
							onClick={() => setShowCreateModal(true)}
							className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary-btn-bg)] hover:opacity-90 text-[var(--primary-btn-text)] font-semibold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
						>
							<Plus className="w-3.5 h-3.5 stroke-[2.5]" />
							<span>{t("empty.new_project_btn")}</span>
						</button>
						<CreateProjectModal
							isOpen={showCreateModal}
							onClose={() => setShowCreateModal(false)}
							onProjectCreated={() => window.location.reload()}
						/>
					</div>
				)}

				{!loading && projects.length > 0 && (
					<div className="flex-1 flex flex-col justify-between">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
							{projects.map((project) => (
								<Link
									key={project.id}
									href={`/projects/${project.id}`}
									className="group p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-[var(--muted-foreground)]/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
								>
									<div>
										<div className="flex items-start justify-between gap-3 mb-3">
											<div className="h-8 w-8 rounded-lg bg-[var(--input-bg)] text-[var(--foreground)] border border-[var(--card-border)] flex items-center justify-center font-bold text-xs shrink-0">
												<Grid className="h-4 w-4" />
											</div>
											<div className="flex items-center gap-2">
												<span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]" title="เปิดล่าสุด (Last viewed)">
													<Eye className="h-3 w-3 text-[var(--muted-foreground)]" />
													{formatRelativeTime(project.last_viewed_at || project.updated_at)}
												</span>
											</div>
										</div>

										<h3 className="font-bold text-base text-[var(--foreground)] group-hover:underline transition-colors mb-2">
											{project.title}
										</h3>

										<p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
											{project.description || t("common.no_description")}
										</p>
									</div>

									<div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)] text-xs text-[var(--muted-foreground)]">
										<div className="flex items-center gap-1.5">
											<Users className="h-3.5 w-3.5" />
											<span>
												{project.members_count} {t("common.members")}
											</span>
										</div>
										<span className="text-[var(--foreground)] font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
											{t("common.open")} →
										</span>
									</div>
								</Link>
							))}
						</div>

						{/* Pagination Controls */}
						{totalPages > 1 && (
							<div className="flex items-center justify-between pt-6 border-t border-[var(--card-border)] mt-auto">
								<p className="text-xs text-[var(--muted-foreground)]">
									Showing{" "}
									<span className="font-semibold text-[var(--foreground)]">
										{(page - 1) * limit + 1}
									</span>{" "}
									to{" "}
									<span className="font-semibold text-[var(--foreground)]">
										{Math.min(page * limit, totalItems)}
									</span>{" "}
									of{" "}
									<span className="font-semibold text-[var(--foreground)]">
										{totalItems}
									</span>{" "}
									results
								</p>

								<div className="flex items-center gap-2">
									<button
										onClick={() => setPage((p) => Math.max(p - 1, 1))}
										disabled={page === 1}
										className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--input-bg)] transition-colors"
									>
										<ChevronLeft className="h-4 w-4" />
									</button>

									<div className="flex items-center gap-1 px-2">
										{Array.from({ length: totalPages }, (_, i) => i + 1).map(
											(p) => (
												<button
													key={p}
													onClick={() => setPage(p)}
													className={`h-8 w-8 rounded-lg text-xs font-semibold transition-all ${
														page === p
															? "bg-[var(--foreground)] text-[var(--background)] shadow-xs"
															: "text-[var(--muted-foreground)] hover:bg-[var(--input-bg)]"
													}`}
												>
													{p}
												</button>
											),
										)}
									</div>

									<button
										onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
										disabled={page === totalPages}
										className="p-2 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--input-bg)] transition-colors"
									>
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							</div>
						)}
					</div>
				)}
			</main>
		</>
	);
}
