"use client";

import { Clock } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { TaskListView } from "../page";

export default function OverdueTasksPage() {
	const { t } = useLanguage();
	return (
		<TaskListView
			pageTitle="Overdue Tasks"
			headerIcon={<Clock className="h-5 w-5 text-rose-400" />}
			modeFilter="overdue"
		/>
	);
}
