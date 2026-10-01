"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type DateOrder = "DMY" | "YMD";
export type YearSystem = "CE" | "BE";
export type MonthFormat = "full" | "short" | "numeric";
export type DateSeparator = "." | "/" | "-" | " ";
export type TimeFormat = "12" | "24";

export interface DateTimeFormatSettings {
	dateOrder: DateOrder;
	yearSystem: YearSystem;
	monthFormat: MonthFormat;
	dateSeparator: DateSeparator;
	timeFormat: TimeFormat;
}

interface DateTimeFormatContextType {
	settings: DateTimeFormatSettings;
	updateSettings: (newSettings: Partial<DateTimeFormatSettings>) => void;
	formatDate: (dateInput?: Date | string | number | null) => string;
	formatTime: (dateInput?: Date | string | number | null) => string;
	formatDateTime: (dateInput?: Date | string | number | null) => string;
}

const defaultSettings: DateTimeFormatSettings = {
	dateOrder: "YMD",
	yearSystem: "CE",
	monthFormat: "numeric",
	dateSeparator: "-",
	timeFormat: "24",
};

const DateTimeFormatContext = createContext<DateTimeFormatContextType | undefined>(
	undefined
);

const STORAGE_KEY = "display_datetime_settings";

export function DateTimeFormatProvider({ children }: { children: React.ReactNode }) {
	const [settings, setSettings] = useState<DateTimeFormatSettings>(defaultSettings);

	useEffect(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem(STORAGE_KEY);
				if (saved) {
					setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
				}
			} catch (e) {
				console.error("Failed to load datetime settings from localStorage:", e);
			}
		}
	}, []);

	const updateSettings = (newSettings: Partial<DateTimeFormatSettings>) => {
		setSettings((prev) => {
			const updated = { ...prev, ...newSettings };
			if (typeof window !== "undefined") {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
			}
			return updated;
		});
	};

	const formatDate = (dateInput?: Date | string | number | null): string => {
		if (!dateInput) return "";
		const d = new Date(dateInput);
		if (isNaN(d.getTime())) return "";

		const rawYear = d.getFullYear();
		const yearVal = settings.yearSystem === "BE" ? rawYear + 543 : rawYear;

		const monthIdx = d.getMonth();
		const monthNum = String(monthIdx + 1).padStart(2, "0");

		const thaiMonthsFull = [
			"มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
			"กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
		];
		const thaiMonthsShort = [
			"ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
			"ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
		];

		let monthVal = monthNum;
		if (settings.monthFormat === "full") {
			monthVal = thaiMonthsFull[monthIdx];
		} else if (settings.monthFormat === "short") {
			monthVal = thaiMonthsShort[monthIdx];
		}

		const rawDay = d.getDate();
		const dayVal = settings.dateOrder === "DMY" ? String(rawDay) : String(rawDay).padStart(2, "0");

		const sep = settings.dateSeparator;

		if (settings.dateOrder === "DMY") {
			return `${dayVal}${sep}${monthVal}${sep}${yearVal}`;
		}
		return `${yearVal}${sep}${monthVal}${sep}${dayVal}`;
	};

	const formatTime = (dateInput?: Date | string | number | null): string => {
		if (!dateInput) return "";
		const d = new Date(dateInput);
		if (isNaN(d.getTime())) return "";

		let hours = d.getHours();
		const minutes = String(d.getMinutes()).padStart(2, "0");
		const seconds = String(d.getSeconds()).padStart(2, "0");

		if (settings.timeFormat === "12") {
			const ampm = hours >= 12 ? "PM" : "AM";
			hours = hours % 12;
			if (hours === 0) hours = 12;
			const hoursStr = String(hours).padStart(2, "0");
			return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
		} else {
			const hoursStr = String(hours).padStart(2, "0");
			return `${hoursStr}:${minutes}:${seconds} น.`;
		}
	};

	const formatDateTime = (dateInput?: Date | string | number | null): string => {
		if (!dateInput) return "";
		const dateStr = formatDate(dateInput);
		const timeStr = formatTime(dateInput);
		return `${dateStr} ${timeStr}`;
	};

	return (
		<DateTimeFormatContext.Provider
			value={{
				settings,
				updateSettings,
				formatDate,
				formatTime,
				formatDateTime,
			}}
		>
			{children}
		</DateTimeFormatContext.Provider>
	);
}

export function useDateTimeFormat() {
	const context = useContext(DateTimeFormatContext);
	if (!context) {
		throw new Error("useDateTimeFormat must be used within a DateTimeFormatProvider");
	}
	return context;
}
