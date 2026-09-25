"use client";

import React from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { TaskListView } from "../page";
import { UserCheck } from "lucide-react";

export default function AssignedToMePage() {
  const { t } = useLanguage();
  return (
    <TaskListView
      pageTitle={t("nav.assigned_to_me") || "Assigned to me"}
      headerIcon={<UserCheck className="h-5 w-5" />}
      modeFilter="assigned"
    />
  );
}
