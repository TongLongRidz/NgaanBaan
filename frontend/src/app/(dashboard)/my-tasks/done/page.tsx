"use client";

import { CheckCheck } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { TaskListView } from "../page";

export default function DoneTasksPage() {
	const { t } = useLanguage();
	return (
		<TaskListView
			pageTitle={t("nav.completed") || "Completed Tasks"}
			headerIcon={<CheckCheck className="h-5 w-5 text-emerald-400" />}
			modeFilter="done"
		/>
	);
}
