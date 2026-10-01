"use client";

import React, { useMemo } from "react";
import { Calendar, CalendarEvent } from "@/components/ui/calendar/Calendar";
import { useLanguage } from "@/hooks/useLanguage";
import type { Column, Task } from "@/types/project";

interface ProjectCalendarViewProps {
	columns: Column[];
	onSelectTask?: (task: Task) => void;
}

export function ProjectCalendarView({
	columns,
	onSelectTask,
}: ProjectCalendarViewProps) {
	const { t } = useLanguage();

	// Convert tasks in all columns to calendar events
	const calendarEvents: CalendarEvent[] = useMemo(() => {
		const events: CalendarEvent[] = [];

		columns.forEach((col) => {
			const isDone =
				col.name.toLowerCase().includes("done") ||
				col.name.includes("เสร็จ");
			const isInProgress =
				col.name.toLowerCase().includes("progress") ||
				col.name.includes("กำลัง");

			col.tasks.forEach((task) => {
				const taskDate = task.due_date || task.start_date;
				if (taskDate) {
					let colorClass =
						"bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25";
					if (isDone) {
						colorClass =
							"bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25";
					} else if (isInProgress) {
						colorClass =
							"bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25";
					}

					events.push({
						id: task.id,
						title: task.title,
						date: taskDate,
						badgeText: col.name,
						color: colorClass,
						data: task,
					});
				}
			});
		});

		return events;
	}, [columns]);

	const handleEventClick = (event: CalendarEvent) => {
		if (event.data && onSelectTask) {
			onSelectTask(event.data as Task);
		}
	};

	return (
		<main className="flex-1 p-6 md:p-8 space-y-6 animate-fade-in w-full">
			<Calendar
				events={calendarEvents}
				onEventClick={handleEventClick}
			/>
		</main>
	);
}
