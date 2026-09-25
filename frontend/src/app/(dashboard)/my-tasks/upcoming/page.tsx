"use client";

import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TaskListView } from "../page";
import { Calendar } from "lucide-react";

export default function UpcomingTasksPage() {
  const { t } = useLanguage();
  return (
    <TaskListView
      pageTitle="Upcoming Tasks"
      headerIcon={<Calendar className="h-5 w-5 text-indigo-400" />}
      modeFilter="upcoming"
    />
  );
}
