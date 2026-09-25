"use client";

import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TaskListView } from "../page";
import { Clock } from "lucide-react";

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
