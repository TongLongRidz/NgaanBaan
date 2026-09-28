"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";

// Import Modular Subpage Components
import { ProjectSummaryView } from "@/components/project/ProjectSummaryView";
import { ProjectKanbanView } from "@/components/project/ProjectKanbanView";
import { ProjectGanttView } from "@/components/project/ProjectGanttView";
import { ProjectCalendarView } from "@/components/project/ProjectCalendarView";
import { ProjectActivityView } from "@/components/project/ProjectActivityView";
import { ProjectSettingsView } from "@/components/project/ProjectSettingsView";
import { ProjectSubNavbar, ProjectSubTab } from "@/components/project/ProjectSubNavbar";
import { TaskDetailModal } from "@/components/project/TaskDetailModal";

// Import Types
import { Column, ActivityLog, ProjectMember, Task } from "@/types/project";
import {
  Check
} from "lucide-react";



function ProjectDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [columns, setColumns] = useState<Column[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectTitle, setProjectTitle] = useState("Loading...");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch real project data from backend API
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const token = localStorage.getItem("user_session_id");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/projects/${projectId}`, {
          headers,
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
        }
      } catch (err) {
        console.error("Failed to fetch project detail:", err);
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
        const validTabs = ["summary", "kanban", "gantt", "calendar", "activity", "settings"];
        if (savedTab && validTabs.includes(savedTab)) {
          return savedTab as any;
        }
      } catch {}
    }
    return "summary";
  });

  // Load initial tab from URL query param if present
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["summary", "kanban", "gantt", "calendar", "activity", "settings"];

    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTabState(tabParam as any);
      try {
        localStorage.setItem(`project_tab_${projectId}`, tabParam);
      } catch {}
    }
  }, [searchParams, projectId]);

  // Tab Change handler that syncs state, URL query parameter, and localStorage
  const handleTabChange = (
    tab: "summary" | "kanban" | "gantt" | "calendar" | "activity" | "settings"
  ) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem(`project_tab_${projectId}`, tab);
    } catch {}
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`/projects/${projectId}?${params.toString()}`, { scroll: false });
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
              st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
            )
          };
        })
      }))
    );

    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              subtasks: prev.subtasks?.map((st) =>
                st.id === subtaskId ? { ...st, is_completed: !st.is_completed } : st
              )
            }
          : null
      );
    }
  };

  const handleAddMember = (email: string, role: "Owner" | "Editor" | "Viewer") => {
    const nameFromEmail = email.split("@")[0];
    const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

    const newMember: ProjectMember = {
      id: `m-${Date.now()}`,
      name: formattedName,
      email,
      role,
      avatar_url: `https://placehold.co/400x400?text=${formattedName.substring(0, 2).toUpperCase()}`,
      status: "Pending"
    };

    setMembers((prev) => [...prev, newMember]);
  };

  const handleRoleChange = (memberId: string, newRole: "Owner" | "Editor" | "Viewer") => {
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );
  };

  const handleRemoveMember = (memberId: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  const handleSaveSettings = () => {};

  return (
    <>
      <TopNavbar title={projectTitle} />

      {/* Project Header Sub Navbar */}
      <ProjectSubNavbar activeTab={activeTab} setActiveTab={handleTabChange} />

      {/* Render Subpage Components */}
      {activeTab === "summary" && <ProjectSummaryView columns={columns} />}
      {activeTab === "kanban" && (
        <ProjectKanbanView columns={columns} onSelectTask={(task) => setSelectedTask(task)} />
      )}
      {activeTab === "gantt" && <ProjectGanttView columns={columns} />}
      {activeTab === "calendar" && <ProjectCalendarView columns={columns} />}
      {activeTab === "activity" && <ProjectActivityView activities={activities} />}
      {activeTab === "settings" && (
        <ProjectSettingsView
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

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-xs text-[var(--muted-foreground)]">Loading project details...</div>
      }
    >
      <ProjectDetailContent params={params} />
    </Suspense>
  );
}
