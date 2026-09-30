"use client";

import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { ProjectActivityView } from "@/components/project/ProjectActivityView";
import { ProjectCalendarView } from "@/components/project/ProjectCalendarView";
import { ProjectGanttView } from "@/components/project/ProjectGanttView";
import { ProjectKanbanView } from "@/components/project/ProjectKanbanView";
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

	// Tab State: Summary -> Kanban Board -> Gantt Chart -> Calendar -> Activity -> Settings
	const [activeTab, setActiveTabState] = useState<
		"summary" | "kanban" | "gantt" | "calendar" | "activity" | "settings"
	>(() => {
		if (typeof window !== "undefined") {
			try {
				const savedTab = localStorage.getItem(`project_tab_${projectId}`);
				const validTabs = [
					"summary",
					"kanban",
					"gantt",
					"calendar",
					"activity",
					"settings",
				];
				if (savedTab && validTabs.includes(savedTab)) {
					return savedTab as any;
				}
			} catch {}
		}
		return "summary";
	});

	// Clean up any legacy ?tab= query param from URL address bar while saving to localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			const urlParams = new URLSearchParams(window.location.search);
			const tabParam = urlParams.get("tab");
			const validTabs = [
				"summary",
				"kanban",
				"gantt",
				"calendar",
				"activity",
				"settings",
			];

			if (tabParam && validTabs.includes(tabParam)) {
				setActiveTabState(tabParam as any);
				try {
					localStorage.setItem(`project_tab_${projectId}`, tabParam);
				} catch {}
			}

			// Strip query param from address bar if present
			if (window.location.search.includes("tab=")) {
				window.history.replaceState({}, "", window.location.pathname);
			}
		}
	}, [projectId]);

	// Tab Change handler that updates local state & localStorage WITHOUT adding ?tab= to URL bar
	const handleTabChange = (
		tab: "summary" | "kanban" | "gantt" | "calendar" | "activity" | "settings",
	) => {
		setActiveTabState(tab);
		try {
			localStorage.setItem(`project_tab_${projectId}`, tab);
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

	const handleRoleChange = (
		memberId: string,
		newRole: "Owner" | "Editor" | "Viewer",
	) => {
		setMembers((prev) =>
			prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
		);
	};

	const handleRemoveMember = (memberId: string) => {
		setMembers((prev) => prev.filter((m) => m.id !== memberId));
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
			<TopNavbar title={projectTitle} />

			{/* Project Header Sub Navbar */}
			<ProjectSubNavbar activeTab={activeTab} setActiveTab={handleTabChange} />

			{/* Render Subpage Components */}
			{activeTab === "summary" && <ProjectSummaryView columns={columns} />}
			{activeTab === "kanban" && (
				<ProjectKanbanView
					columns={columns}
					onSelectTask={(task) => setSelectedTask(task)}
				/>
			)}
			{activeTab === "gantt" && <ProjectGanttView columns={columns} />}
			{activeTab === "calendar" && <ProjectCalendarView columns={columns} />}
			{activeTab === "activity" && (
				<ProjectActivityView activities={activities} />
			)}
			{activeTab === "settings" && (
				<ProjectSettingsView
					projectId={projectId}
					projectTitle={projectTitle}
					setProjectTitle={setProjectTitle}
					projectDescription={projectDescription}
					setProjectDescription={setProjectDescription}
					members={members}
					onAddMember={handleAddMember}
					onRoleChange={handleRoleChange}
					onRemoveMember={handleRemoveMember}
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
