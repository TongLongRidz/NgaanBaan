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

const INITIAL_MEMBERS: ProjectMember[] = [
  {
    id: "e50337c7-c50d-405a-8b1e-7b70743b0001",
    name: "Somchai Jaidee (You)",
    email: "somchai.j@gmail.com",
    role: "Owner",
    avatar_url: "https://placehold.co/400x400?text=SJ",
    status: "Active"
  },
  {
    id: "e50337c7-c50d-405a-8b1e-7b70743b0002",
    name: "Somying Singjad",
    email: "somying.s@gmail.com",
    role: "Editor",
    avatar_url: "https://placehold.co/400x400?text=SS",
    status: "Active"
  },
  {
    id: "e50337c7-c50d-405a-8b1e-7b70743b0003",
    name: "Sarah Chen",
    email: "sarah.chen@company.com",
    role: "Editor",
    avatar_url: "https://placehold.co/400x400?text=SC",
    status: "Active"
  },
  {
    id: "e50337c7-c50d-405a-8b1e-7b70743b0004",
    name: "Mike Ross",
    email: "mike.ross@pearson.com",
    role: "Viewer",
    avatar_url: "https://placehold.co/400x400?text=MR",
    status: "Pending"
  }
];

const INITIAL_COLUMNS: Column[] = [
  {
    id: "c1111111-1111-4111-8111-111111111111",
    name: "To Do",
    tasks: [
      {
        id: "t1111111-1111-4111-8111-111111111111",
        title: "Setup Next.js 15 & Tailwind CSS",
        description: "Initialize workspace repo, configure TypeScript, Tailwind CSS, and folder structure.",
        assignees: ["Somying Singjad"],
        start_date: "2026-09-22",
        due_date: "2026-09-28",
        labels: ["Frontend", "Setup"],
        subtasks: [
          { id: "s1111111-1111-4111-8111-111111111111", title: "Setup CSS Variables in globals.css", is_completed: true },
          { id: "s1111111-1111-4111-8111-111111111112", title: "Refactor TopNavbar & SideNavbar", is_completed: true },
          { id: "s1111111-1111-4111-8111-111111111113", title: "Build My Tasks dedicated dashboard view", is_completed: false }
        ],
        attachments: [
          { id: "a1111111-1111-4111-8111-111111111111", name: "architecture-diagram.png", size: "1.2 MB", type: "image/png" }
        ],
        comments: [
          { id: "m1111111-1111-4111-8111-111111111111", author: "Alex", content: "Great start! Please include dark mode support.", created_at: "2 hours ago" }
        ]
      },
      {
        id: "t2222222-2222-4222-8222-222222222222",
        title: "Design System Tokens",
        description: "Define HSL color palettes, spacing tokens, typography, and dark theme support.",
        assignees: ["Sarah Chen"],
        start_date: "2026-09-24",
        due_date: "2026-09-30",
        labels: ["Design", "UI"],
        subtasks: [
          { id: "s2222222-2222-4222-8222-222222222221", title: "Glassmorphism cards styling", is_completed: false }
        ]
      }
    ]
  },
  {
    id: "c2222222-2222-4222-8222-222222222222",
    name: "In Progress",
    tasks: [
      {
        id: "t3333333-3333-4333-8333-333333333333",
        title: "SideNavbar Navigation Redesign",
        description: "Implement responsive collapsable sidebar with persistent expanded state.",
        assignees: ["Somying Singjad", "Mike Ross"],
        start_date: "2026-09-20",
        due_date: "2026-09-26",
        labels: ["Frontend", "UX"],
        subtasks: [
          { id: "s3333333-3333-4333-8333-333333333331", title: "Add toggle collapse button", is_completed: true },
          { id: "s3333333-3333-4333-8333-333333333332", title: "Submenu recents accordion", is_completed: true }
        ]
      }
    ]
  },
  {
    id: "c3333333-3333-4333-8333-333333333333",
    name: "Review",
    tasks: [
      {
        id: "t4444444-4444-4444-8444-444444444444",
        title: "Language & i18n Context Support",
        description: "Add Thai (th) and English (en) translation hooks with localStorage persistence.",
        assignees: ["Sarah Chen"],
        start_date: "2026-09-21",
        due_date: "2026-09-25",
        labels: ["i18n"],
        subtasks: [
          { id: "s4444444-4444-4444-8444-444444444441", title: "Add th.json and en.json translation keys", is_completed: true }
        ]
      }
    ]
  },
  {
    id: "c4444444-4444-4444-8444-444444444444",
    name: "Done",
    tasks: [
      {
        id: "t5555555-5555-4555-8555-555555555555",
        title: "Landing Page AOS Animation",
        description: "Integrate AOS scroll animations and polished feature cards.",
        assignees: ["Somying Singjad"],
        start_date: "2026-09-18",
        due_date: "2026-09-24",
        labels: ["Frontend"],
        subtasks: [
          { id: "s5555555-5555-4555-8555-555555555551", title: "AOS init on useEffect", is_completed: true }
        ]
      }
    ]
  }
];

const INITIAL_ACTIVITIES: ActivityLog[] = [
  {
    id: "act-11111111-1111-4111-8111-111111111111",
    user: "Somying Singjad",
    action: "moved task",
    target: "SideNavbar Navigation Redesign to 'In Progress'",
    time: "15 mins ago",
    icon_type: "move"
  },
  {
    id: "act-22222222-2222-4222-8222-222222222222",
    user: "Sarah Chen",
    action: "commented on",
    target: "Setup Next.js 15 & Tailwind CSS",
    time: "2 hours ago",
    icon_type: "comment"
  },
  {
    id: "act-33333333-3333-4333-8333-333333333333",
    user: "Mike Ross",
    action: "completed subtask in",
    target: "PostgreSQL & MongoDB Schema",
    time: "4 hours ago",
    icon_type: "complete"
  },
  {
    id: "act-44444444-4444-4444-8444-444444444444",
    user: "Alex Turner",
    action: "created new task",
    target: "Design System Tokens",
    time: "Yesterday, 3:45 PM",
    icon_type: "create"
  }
];

function ProjectDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [activities] = useState<ActivityLog[]>(INITIAL_ACTIVITIES);
  const [members, setMembers] = useState<ProjectMember[]>(INITIAL_MEMBERS);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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

  // Load initial tab from URL query param if present (e.g. ?tab=kanban), otherwise default to "summary" or localStorage
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs = ["summary", "kanban", "gantt", "calendar", "activity", "settings"];

    if (tabParam && validTabs.includes(tabParam)) {
      setActiveTabState(tabParam as any);
      try {
        localStorage.setItem(`project_tab_${projectId}`, tabParam);
      } catch {}
    } else {
      setActiveTabState("summary");
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

  // Project Title & Description
  const initialTitle =
    projectId === "f47ac10b-58cc-4372-a567-0e02b2c3d4e5"
      ? "UI/UX Redesign Project"
      : projectId === "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
      ? "Backend API Infrastructure"
      : "Sprint Workspace Project";

  const initialDesc =
    projectId === "f47ac10b-58cc-4372-a567-0e02b2c3d4e5"
      ? "Design system migration, glassmorphism components, and dark mode theme implementation."
      : projectId === "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
      ? "Go REST API, PostgreSQL database migration, Google OAuth 2.0 and JWT middleware."
      : "Main kanban board for product features development, sprint tasks, and bug tracking.";

  const [projectTitle, setProjectTitle] = useState(initialTitle);
  const [projectDescription, setProjectDescription] = useState(initialDesc);

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
