"use client";

import {
	Activity,
	BarChart3,
	CalendarDays,
	GanttChart,
	Kanban,
	Settings,
	Users,
} from "lucide-react";
import type React from "react";
import { useLanguage } from "@/hooks/useLanguage";

export type ProjectSubTab =
	| "summary"
	| "kanban"
	| "gantt"
	| "calendar"
	| "activity"
	| "members"
	| "settings";

interface ProjectSubNavbarProps {
	activeTab: ProjectSubTab;
	setActiveTab: (tab: ProjectSubTab) => void;
	userRole?: string;
}

export function ProjectSubNavbar({
	activeTab,
	setActiveTab,
	userRole,
}: ProjectSubNavbarProps) {
	const { t } = useLanguage();

	const allTabs: {
		id: ProjectSubTab;
		labelKey: string;
		defaultLabel: string;
		icon: React.ReactNode;
	}[] = [
		{
			id: "summary",
			labelKey: "project.summary",
			defaultLabel: "Summary",
			icon: <BarChart3 className="h-4 w-4" />,
		},
		{
			id: "kanban",
			labelKey: "project.kanban",
			defaultLabel: "Kanban",
			icon: <Kanban className="h-4 w-4" />,
		},
		{
			id: "gantt",
			labelKey: "project.gantt",
			defaultLabel: "Gantt Chart",
			icon: <GanttChart className="h-4 w-4" />,
		},
		{
			id: "calendar",
			labelKey: "project.calendar",
			defaultLabel: "Calendar",
			icon: <CalendarDays className="h-4 w-4" />,
		},
		{
			id: "activity",
			labelKey: "project.activity",
			defaultLabel: "Activity",
			icon: <Activity className="h-4 w-4" />,
		},
		{
			id: "members",
			labelKey: "project.members",
			defaultLabel: "Members",
			icon: <Users className="h-4 w-4" />,
		},
		{
			id: "settings",
			labelKey: "project.settings",
			defaultLabel: "Settings",
			icon: <Settings className="h-4 w-4" />,
		},
	];

	const tabs = allTabs.filter(
		(tab) => tab.id !== "settings" || !userRole || userRole === "Owner",
	);

	return (
		<div className="sticky top-16 z-40 px-6 pt-4 pb-0 border-b border-[var(--card-border)] bg-[var(--card-bg)]/95 backdrop-blur-md flex items-center justify-between gap-4 transition-colors">
			<div className="flex items-center gap-6 overflow-x-auto">
				{tabs.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-all shrink-0 ${
								isActive
									? "border-indigo-500 text-indigo-500 font-bold"
									: "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
							}`}
						>
							{tab.icon}
							<span>{t(tab.labelKey) || tab.defaultLabel}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
