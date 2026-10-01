"use client";

import {
	ChevronLeft,
	ChevronRight,
	Clock,
	ListFilter,
	Plus,
} from "lucide-react";
import React, { useMemo, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";

export interface CalendarEvent {
	id: string;
	title: string;
	date: string; // YYYY-MM-DD
	endDate?: string;
	color?: string; // Tailwind bg color class or hex
	badgeText?: string;
	status?: string;
	data?: any;
}

interface CalendarProps {
	events?: CalendarEvent[];
	onEventClick?: (event: CalendarEvent) => void;
	onDateClick?: (dateStr: string) => void;
	onAddEvent?: (dateStr: string) => void;
	initialDate?: Date;
}

const MONTH_NAMES_TH = [
	"มกราคม",
	"กุมภาพันธ์",
	"มีนาคม",
	"เมษายน",
	"พฤษภาคม",
	"มิถุนายน",
	"กรกฎาคม",
	"สิงหาคม",
	"กันยายน",
	"ตุลาคม",
	"พฤศจิกายน",
	"ธันวาคม",
];

const MONTH_NAMES_EN = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

const DAY_NAMES_TH = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];
const DAY_NAMES_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
	events = [],
	onEventClick,
	onDateClick,
	onAddEvent,
	initialDate,
}: CalendarProps) {
	const { language } = useLanguage();
	const [currentDate, setCurrentDate] = useState<Date>(
		initialDate || new Date(),
	);
	const [selectedDateStr, setSelectedDateStr] = useState<string>("");
	const [viewMode, setViewMode] = useState<"month" | "week">("month");

	const isTh = language === "th";
	const monthNames = isTh ? MONTH_NAMES_TH : MONTH_NAMES_EN;
	const dayNames = isTh ? DAY_NAMES_TH : DAY_NAMES_EN;

	const year = currentDate.getFullYear();
	const month = currentDate.getMonth();

	// Format Date to YYYY-MM-DD
	const formatDateKey = (d: Date): string => {
		const yyyy = d.getFullYear();
		const mm = String(d.getMonth() + 1).padStart(2, "0");
		const dd = String(d.getDate()).padStart(2, "0");
		return `${yyyy}-${mm}-${dd}`;
	};

	const todayKey = useMemo(() => formatDateKey(new Date()), []);

	// Group events by date string (YYYY-MM-DD)
	const eventsByDate = useMemo(() => {
		const map: Record<string, CalendarEvent[]> = {};
		events.forEach((evt) => {
			if (!evt.date) return;
			// Normalize date string (in case it contains time T00:00:00Z)
			const key = evt.date.split("T")[0];
			if (!map[key]) map[key] = [];
			map[key].push(evt);
		});
		return map;
	}, [events]);

	// Calculate calendar grid days for Month View
	const calendarDays = useMemo(() => {
		const firstDayOfMonth = new Date(year, month, 1);
		const lastDayOfMonth = new Date(year, month + 1, 0);

		const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
		const totalDaysInMonth = lastDayOfMonth.getDate();

		const days: {
			date: Date;
			dateStr: string;
			dayNumber: number;
			isCurrentMonth: boolean;
			isToday: boolean;
		}[] = [];

		// Previous month padding days
		const prevMonthLastDay = new Date(year, month, 0).getDate();
		for (let i = startingDayOfWeek - 1; i >= 0; i--) {
			const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
			const dateStr = formatDateKey(prevDate);
			days.push({
				date: prevDate,
				dateStr,
				dayNumber: prevDate.getDate(),
				isCurrentMonth: false,
				isToday: dateStr === todayKey,
			});
		}

		// Current month days
		for (let day = 1; day <= totalDaysInMonth; day++) {
			const date = new Date(year, month, day);
			const dateStr = formatDateKey(date);
			days.push({
				date,
				dateStr,
				dayNumber: day,
				isCurrentMonth: true,
				isToday: dateStr === todayKey,
			});
		}

		// Next month padding days to complete 35 or 42 grid cells
		const remainingGridCells = (7 - (days.length % 7)) % 7;
		for (let day = 1; day <= remainingGridCells; day++) {
			const nextDate = new Date(year, month + 1, day);
			const dateStr = formatDateKey(nextDate);
			days.push({
				date: nextDate,
				dateStr,
				dayNumber: day,
				isCurrentMonth: false,
				isToday: dateStr === todayKey,
			});
		}

		return days;
	}, [year, month, todayKey]);

	const handlePrevMonth = () => {
		setCurrentDate(new Date(year, month - 1, 1));
	};

	const handleNextMonth = () => {
		setCurrentDate(new Date(year, month + 1, 1));
	};

	const handleToday = () => {
		setCurrentDate(new Date());
	};

	return (
		<div className="w-full rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-xs p-4 sm:p-6 space-y-4">
			{/* Calendar Header Toolbar */}
			<div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--card-border)]">
				<div className="flex items-center gap-3">
					<h2 className="font-extrabold text-lg sm:text-xl text-[var(--foreground)] tracking-tight">
						{monthNames[month]} {year + (isTh ? 543 : 0)}
					</h2>
				</div>

				<div className="flex items-center gap-2">
					{/* Month/Week View Switcher */}
					<div className="flex p-1 bg-[var(--input-bg)] rounded-xl border border-[var(--card-border)]">
						<button
							onClick={() => setViewMode("month")}
							className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
								viewMode === "month"
									? "bg-[var(--card-bg)] text-[var(--foreground)] shadow-xs"
									: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
							}`}
						>
							{isTh ? "เดือน" : "Month"}
						</button>
						<button
							onClick={() => setViewMode("week")}
							className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
								viewMode === "week"
									? "bg-[var(--card-bg)] text-[var(--foreground)] shadow-xs"
									: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
							}`}
						>
							{isTh ? "สัปดาห์" : "Week"}
						</button>
					</div>

					{/* Nav Arrows */}
					<div className="flex items-center gap-1 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-1">
						<button
							onClick={handlePrevMonth}
							className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors"
							title="Previous Month"
						>
							<ChevronLeft className="h-4 w-4" />
						</button>
						<button
							onClick={handleNextMonth}
							className="p-1.5 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card-bg)] transition-colors"
							title="Next Month"
						>
							<ChevronRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* Main Grid View */}
			<div>
				{/* Day of Week Headers */}
				<div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-[var(--muted-foreground)] pb-3 border-b border-[var(--card-border)] uppercase tracking-wider">
					{dayNames.map((name, i) => (
						<div
							key={name}
							className={i === 0 || i === 6 ? "text-amber-500/80" : ""}
						>
							{name}
						</div>
					))}
				</div>

				{/* Days Grid */}
				<div className="grid grid-cols-7 gap-1.5 sm:gap-2 mt-3 text-xs">
					{calendarDays.map((cell) => {
						const dayEvents = eventsByDate[cell.dateStr] || [];
						const isSelected = selectedDateStr === cell.dateStr;

						return (
							<div
								key={cell.dateStr}
								onClick={() => {
									setSelectedDateStr(cell.dateStr);
									onDateClick?.(cell.dateStr);
								}}
								className={`group min-h-[95px] sm:min-h-[110px] p-2 rounded-xl border transition-all flex flex-col justify-between cursor-pointer ${
									cell.isToday
										? "border-indigo-500 bg-indigo-500/10 shadow-xs ring-1 ring-indigo-500/30"
										: isSelected
											? "border-slate-400 bg-slate-500/10"
											: cell.isCurrentMonth
												? "border-[var(--card-border)] bg-[var(--background)] hover:border-indigo-500/40"
												: "border-[var(--card-border)]/40 bg-[var(--background)]/30 opacity-40 hover:opacity-70"
								}`}
							>
								{/* Day Header */}
								<div className="flex items-center justify-between">
									<span
										className={`text-xs font-bold rounded-md px-1.5 py-0.5 ${
											cell.isToday
												? "bg-indigo-600 text-white shadow-xs"
												: cell.isCurrentMonth
													? "text-[var(--foreground)]"
													: "text-[var(--muted-foreground)]"
										}`}
									>
										{cell.dayNumber}
									</span>

									{onAddEvent && (
										<button
											onClick={(e) => {
												e.stopPropagation();
												onAddEvent(cell.dateStr);
											}}
											className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-indigo-400 hover:bg-indigo-500/20 transition-all"
											title={isTh ? "เพิ่มงาน" : "Add Task"}
										>
											<Plus className="h-3 w-3" />
										</button>
									)}
								</div>

								{/* Events List for this Day */}
								<div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[70px] scrollbar-none">
									{dayEvents.slice(0, 3).map((evt) => (
										<button
											key={evt.id}
											onClick={(e) => {
												e.stopPropagation();
												onEventClick?.(evt);
											}}
											className={`w-full text-left text-[10px] p-1.5 rounded-lg border font-semibold truncate transition-all flex items-center justify-between gap-1 shadow-xs hover:scale-[1.02] ${
												evt.color ||
												"bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25"
											}`}
											title={evt.title}
										>
											<span className="truncate">{evt.title}</span>
											{evt.badgeText && (
												<span className="text-[9px] px-1 rounded-xs bg-black/20 shrink-0">
													{evt.badgeText}
												</span>
											)}
										</button>
									))}

									{dayEvents.length > 3 && (
										<div className="text-[9px] font-bold text-indigo-400 text-center py-0.5">
											+{dayEvents.length - 3} {isTh ? "เพิ่มเติม" : "more"}
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
