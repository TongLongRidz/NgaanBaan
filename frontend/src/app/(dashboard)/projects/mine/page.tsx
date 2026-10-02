"use client";

import { Eye, FolderKanban, Grid, Pin, Plus, Users } from "lucide-react";
import Link from "next/link";
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

export default function MyProjectsPage() {
	const { t } = useLanguage();
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);

	const [showCreateModal, setShowCreateModal] = useState(false);

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

	const fetchProjects = async () => {
		try {
			const apiUrl =
				process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			const res = await fetch(`${apiUrl}/api/projects`, {
				credentials: "include",
			});
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data)) {
					const mineOnly = data.filter(
						(p: any) => !p.role || p.role.toLowerCase() === "owner",
					);
					setProjects(mineOnly);
				}
			}
		} catch (err) {
			console.error("Failed to fetch my projects:", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchProjects();
	}, []);

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
				fetchProjects();
				if (typeof window !== "undefined") {
					window.dispatchEvent(new Event("projects-updated"));
				}
			}
		} catch (err) {
			console.error("Failed to pin project:", err);
		}
	};

	return (
		<>
			<TopNavbar />

			{/* Main Content */}
			<main className="flex-1 p-6 md:p-8 flex flex-col min-h-[calc(100vh-64px)]">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shadow-xs">
							<FolderKanban className="h-4 w-4" />
						</div>
						<div>
							<h2 className="font-bold text-xl leading-none text-[var(--foreground)]">
								{t("nav.my_projects") || "My Projects"}
							</h2>
						</div>
					</div>
				</div>

				{/* Grid of projects */}
				{!loading && projects.length === 0 && (
					<div className="flex flex-col items-center justify-center py-12 px-4 text-center my-auto w-full">
						<div className="w-12 h-12 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] flex items-center justify-center text-[var(--muted-foreground)] mb-3.5 shadow-xs">
							<FolderKanban className="w-5 h-5 opacity-70" />
						</div>
						<h3 className="font-bold text-base md:text-lg text-[var(--foreground)] tracking-tight mb-1">
							{t("empty.no_projects_found")}
						</h3>
						<p className="text-xs text-[var(--muted-foreground)] max-w-[320px] sm:max-w-md mb-5 leading-relaxed whitespace-pre-line">
							{t("empty.create_to_get_started")}
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
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
						{projects.map((project) => (
							<Link
								key={project.id}
								href={`/projects/${project.id}`}
								className="group p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
							>
								<div>
									<div className="flex items-start justify-between gap-3 mb-3">
										<div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
											<Grid className="h-4 w-4" />
										</div>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={(e) => togglePin(e, project.id)}
												title={project.is_pinned ? "ยกเลิกปักหมุด" : "ปักหมุดโปรเจกต์"}
												className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
													project.is_pinned
														? "bg-blue-500/10 border-blue-500/30 text-blue-500"
														: "bg-[var(--input-bg)] border-[var(--card-border)] text-[var(--muted-foreground)] hover:text-blue-500 hover:border-blue-500/30"
												}`}
											>
												<Pin className={`h-3.5 w-3.5 ${project.is_pinned ? "fill-blue-500" : ""}`} />
											</button>
											<span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
												<Eye className="h-3 w-3 text-[var(--muted-foreground)]" />
												{formatRelativeTime(project.last_viewed_at || project.updated_at)}
											</span>
										</div>
									</div>

									<h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-blue-500 transition-colors mb-2">
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
									<span className="text-blue-500 font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
										{t("common.open")} →
									</span>
								</div>
							</Link>
						))}
					</div>
				)}
			</main>
		</>
	);
}
