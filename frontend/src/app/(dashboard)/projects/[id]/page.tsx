"use client";

import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { ProjectActivityView } from "@/components/project/ProjectActivityView";
import { ProjectCalendarView } from "@/components/project/ProjectCalendarView";
import { ProjectGanttView } from "@/components/project/ProjectGanttView";
import { ProjectKanbanView } from "@/components/project/ProjectKanbanView";
import { ProjectMembersView } from "@/components/project/ProjectMembersView";
import { ProjectSettingsView } from "@/components/project/ProjectSettingsView";
import {
	ProjectSubNavbar,
	ProjectSubTab,
} from "@/components/project/ProjectSubNavbar";
// Import Modular Subpage Components
import { ProjectSummaryView } from "@/components/project/ProjectSummaryView";
import { TaskDetailModal } from "@/components/project/TaskDetailModal";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { useLanguage } from "@/hooks/useLanguage";
// Import Types
import type { ActivityLog, Column, ProjectMember, Task } from "@/types/project";

function ProjectDetailContent({ params }: { params: Promise<{ id: string }> }) {
	const resolvedParams = React.use(params);
	const projectId = resolvedParams.id;
	const router = useRouter();
	const searchParams = useSearchParams();
	const { t } = useLanguage();

	const [columns, setColumns] = useState<Column[]>([]);
	const [activities, setActivities] = useState<ActivityLog[]>([]);
	const [members, setMembers] = useState<ProjectMember[]>([]);
	const [projectTitle, setProjectTitle] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const [isPinned, setIsPinned] = useState<boolean>(false);
	const [userRole, setUserRole] = useState<string>("Owner");
	const [projectVisibility, setProjectVisibility] = useState<"private" | "specific_people" | "anyone_with_link">("private");
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [loading, setLoading] = useState(true);

	const [notFound, setNotFound] = useState(false);

	// Fetch real project data from backend API
	useEffect(() => {
		const fetchProjectDetails = async () => {
			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				const res = await fetch(`${apiUrl}/api/projects/${projectId}`, {
					credentials: "include",
				});
				if (res.ok) {
					const data = await res.json();
					if (data.project) {
						setProjectTitle(data.project.title);
						setProjectDescription(data.project.description);
						if (data.project.is_pinned !== undefined) {
							setIsPinned(data.project.is_pinned);
						}
						if (data.project.visibility) {
							setProjectVisibility(data.project.visibility as any);
						}
						if (data.project.role) {
							setUserRole(data.project.role);
						}
					}
					if (data.columns) setColumns(data.columns);
					if (data.activities) setActivities(data.activities);
					if (data.members) setMembers(data.members);
				} else {
					setNotFound(true);
				}
			} catch (err) {
				console.error("Failed to fetch project detail:", err);
				setNotFound(true);
			} finally {
				setLoading(false);
			}
		};

		fetchProjectDetails();
	}, [projectId]);

	// Tab State: Summary -> Kanban Board -> Gantt Chart -> Calendar -> Activity -> Members -> Settings
	const [activeTab, setActiveTabState] = useState<ProjectSubTab>(() => {
		if (typeof window !== "undefined") {
			try {
				const navEntries = performance.getEntriesByType("navigation");
				const isReload =
					navEntries.length > 0 &&
					(navEntries[0] as PerformanceNavigationTiming).type === "reload";

				if (isReload) {
					const savedTab = sessionStorage.getItem(`project_tab_${projectId}`);
					const validTabs: ProjectSubTab[] = [
						"summary",
						"kanban",
						"gantt",
						"calendar",
						"activity",
						"members",
						"settings",
					];
					if (savedTab && validTabs.includes(savedTab as any)) {
						return savedTab as ProjectSubTab;
					}
				}
			} catch {}
		}
		return "summary";
	});

	// Clean up any legacy ?tab= query param from URL address bar while saving to sessionStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const tabParam = urlParams.get("tab");
			const validTabs: ProjectSubTab[] = [
				"summary",
				"kanban",
				"gantt",
				"calendar",
				"activity",
				"members",
				"settings",
			];

			if (tabParam && validTabs.includes(tabParam as any)) {
				setActiveTabState(tabParam as ProjectSubTab);
				try {
					sessionStorage.setItem(`project_tab_${projectId}`, tabParam);
				} catch {}
			}

			// Strip query param from address bar if present
			if (window.location.search.includes("tab=")) {
				window.history.replaceState({}, "", window.location.pathname);
			}
		}
	}, [projectId]);

	// Tab Change handler that updates local state & sessionStorage WITHOUT adding ?tab= to URL bar
	const handleTabChange = (tab: ProjectSubTab) => {
		setActiveTabState(tab);
		try {
			sessionStorage.setItem(`project_tab_${projectId}`, tab);
		} catch {}
	};

	const handleToggleSubtask = (taskId: string, subtaskId: string) => {
		setColumns((prev) =>
			prev.map((col) => ({
				...col,
				tasks: col.tasks.map((t) => {
					if (t.id !== taskId) return t;
					return {
						...t,
						subtasks: t.subtasks?.map((st) =>
							st.id === subtaskId
								? { ...st, is_completed: !st.is_completed }
								: st,
						),
					};
				}),
			})),
		);

		if (selectedTask && selectedTask.id === taskId) {
			setSelectedTask((prev) =>
				prev
					? {
							...prev,
							subtasks: prev.subtasks?.map((st) =>
								st.id === subtaskId
									? { ...st, is_completed: !st.is_completed }
									: st,
							),
						}
					: null,
			);
		}
	};

	const handleAddMember = (
		email: string,
		role: "Owner" | "Editor" | "Viewer",
	) => {
		const nameFromEmail = email.split("@")[0];
		const formattedName =
			nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

		const newMember: ProjectMember = {
			id: `m-${Date.now()}`,
			name: formattedName,
			email,
			role,
			avatar_url: `https://placehold.co/400x400?text=${formattedName.substring(0, 2).toUpperCase()}`,
			status: "Pending",
		};

		setMembers((prev) => [...prev, newMember]);
	};

	const handleRoleChange = async (
		memberId: string,
		newRole: "Owner" | "Editor" | "Viewer",
	) => {
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
		);
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			await fetch(`${apiUrl}/api/projects/${projectId}/members/${memberId}/role`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ role: newRole }),
			});
		} catch (err) {
			console.error("Failed to update role:", err);
		}
	};

	const handleRemoveMember = async (memberId: string) => {
		setMembers((prev) => prev.filter((m) => m.id !== memberId));
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			await fetch(`${apiUrl}/api/projects/${projectId}/members/${memberId}`, {
				method: "DELETE",
				credentials: "include",
			});
		} catch (err) {
			console.error("Failed to remove member:", err);
		}
	};

	const handleVisibilityChange = async (newVisibility: "private" | "specific_people" | "anyone_with_link") => {
		setProjectVisibility(newVisibility);
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			await fetch(`${apiUrl}/api/projects/${projectId}/visibility`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ visibility: newVisibility }),
			});
		} catch (err) {
			console.error("Failed to update project visibility:", err);
		}
	};

	const handleSaveSettings = () => {};

	if (loading) {
		return <TopNavbar title={projectTitle} />;
	}

	if (notFound) {
		return (
			<>
				<TopNavbar />
				<div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh]">
					<h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
						{t("not_found.project_not_found_title")}
					</h2>
					<p className="text-sm text-[var(--muted-foreground)] whitespace-pre-line leading-relaxed max-w-md">
						{t("not_found.project_not_found_desc")}
					</p>
				</div>
			</>
		);
	}

	return (
		<>
			<TopNavbar title={projectTitle} description={projectDescription} projectId={projectId} isPinned={isPinned} />

			{/* Project Sub Tabs Navigation Row */}
			<ProjectSubNavbar
				activeTab={activeTab}
				setActiveTab={handleTabChange}
				userRole={userRole}
			/>

			{/* Render Subpage Components */}
			{activeTab === "summary" && (
				<ProjectSummaryView
					columns={columns}
					projectDescription={projectDescription}
				/>
			)}
			{activeTab === "kanban" && (
				<ProjectKanbanView
					columns={columns}
					onSelectTask={(task) => setSelectedTask(task)}
				/>
			)}
			{activeTab === "gantt" && <ProjectGanttView columns={columns} />}
			{activeTab === "calendar" && (
				<ProjectCalendarView
					columns={columns}
					onSelectTask={(task) => setSelectedTask(task)}
				/>
			)}
			{activeTab === "activity" && (
				<ProjectActivityView activities={activities} />
			)}
			{activeTab === "members" && (
				<ProjectMembersView
					projectId={projectId}
					members={members}
					userRole={userRole}
					projectVisibility={projectVisibility}
					onVisibilityChange={handleVisibilityChange}
					onAddMember={handleAddMember}
					onRoleChange={handleRoleChange}
					onRemoveMember={handleRemoveMember}
				/>
			)}
			{activeTab === "settings" && (
				<ProjectSettingsView
					projectId={projectId}
					projectTitle={projectTitle}
					setProjectTitle={setProjectTitle}
					projectDescription={projectDescription}
					setProjectDescription={setProjectDescription}
					onSaveSettings={handleSaveSettings}
				/>
			)}

			{/* Task Detail Modal */}
			{selectedTask && (
				<TaskDetailModal
					task={selectedTask}
					onClose={() => setSelectedTask(null)}
					onToggleSubtask={handleToggleSubtask}
				/>
			)}
		</>
	);
}

export default function ProjectDetailPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	return (
		<Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
			<ProjectDetailContent params={params} />
		</Suspense>
	);
}
