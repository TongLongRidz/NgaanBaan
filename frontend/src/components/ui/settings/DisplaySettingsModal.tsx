"use client";

import { Settings, X } from "lucide-react";
import React, { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import {
	useDateTimeFormat,
	DateOrder,
	YearSystem,
	MonthFormat,
	DateSeparator,
	TimeFormat,
} from "@/hooks/useDateTimeFormat";

interface DisplaySettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export function DisplaySettingsModal({ isOpen, onClose }: DisplaySettingsModalProps) {
	const { t } = useLanguage();
	const { settings, updateSettings, formatDate, formatTime } = useDateTimeFormat();

	const [activeTab, setActiveTab] = useState<"general" | "date" | "time">("date");

	if (!isOpen) return null;

	const handleDateOrderChange = (val: DateOrder) => updateSettings({ dateOrder: val });
	const handleYearSystemChange = (val: YearSystem) => updateSettings({ yearSystem: val });
	const handleMonthFormatChange = (val: MonthFormat) => updateSettings({ monthFormat: val });
	const handleDateSeparatorChange = (val: DateSeparator) => updateSettings({ dateSeparator: val });
	const handleTimeFormatChange = (val: TimeFormat) => updateSettings({ timeFormat: val });

	// Fixed sample date: Oct 1, 2026
	const sampleDate = new Date("2026-10-01T12:01:57");

	return (
		<div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
			<div className="w-full max-w-lg bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl shadow-2xl p-6 sm:p-7 space-y-6 relative text-[var(--foreground)] transition-colors">
				{/* Modal Header */}
				<div className="flex items-start gap-3.5">
					<div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500 shrink-0">
						<Settings className="h-6 w-6" />
					</div>
					<div>
						<h2 className="font-bold text-lg text-[var(--foreground)]">
							ตั้งค่าการแสดงผล
						</h2>
						<p className="text-xs text-[var(--muted-foreground)] mt-0.5">
							ตั้งค่ากำหนดรูปแบบการแสดงผลของระบบ
						</p>
					</div>
				</div>

				{/* Custom Tabs Navigation */}
				<div className="flex items-center border-b border-[var(--card-border)] text-xs font-semibold text-[var(--muted-foreground)]">
					<button
						onClick={() => setActiveTab("general")}
						className={`flex-1 py-3 text-center transition-all border-b-2 ${
							activeTab === "general"
								? "border-emerald-500 text-emerald-600 font-bold"
								: "border-transparent hover:text-[var(--foreground)]"
						}`}
					>
						ทั่วไป
					</button>
					<button
						onClick={() => setActiveTab("date")}
						className={`flex-1 py-3 text-center transition-all border-b-2 ${
							activeTab === "date"
								? "border-emerald-500 text-emerald-600 font-bold"
								: "border-transparent hover:text-[var(--foreground)]"
						}`}
					>
						รูปแบบวันที่
					</button>
					<button
						onClick={() => setActiveTab("time")}
						className={`flex-1 py-3 text-center transition-all border-b-2 ${
							activeTab === "time"
								? "border-emerald-500 text-emerald-600 font-bold"
								: "border-transparent hover:text-[var(--foreground)]"
						}`}
					>
						รูปแบบเวลา
					</button>
				</div>

				{/* Tab Content */}
				{activeTab === "general" && (
					<div className="py-8 text-center text-xs text-[var(--muted-foreground)]">
						ไม่มีการตั้งค่าทั่วไปเพิ่มเติม
					</div>
				)}

				{activeTab === "date" && (
					<div className="space-y-5">
						{/* การเรียงวันที่ */}
						<div className="flex items-center justify-between gap-4">
							<span className="text-xs font-bold text-[var(--foreground)]">
								การเรียงวันที่
							</span>
							<div className="flex items-center p-1 bg-[var(--input-bg)] rounded-full border border-[var(--card-border)]">
								<button
									onClick={() => handleDateOrderChange("DMY")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.dateOrder === "DMY"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									วัน/เดือน/ปี
								</button>
								<button
									onClick={() => handleDateOrderChange("YMD")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.dateOrder === "YMD"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ปี/เดือน/วัน
								</button>
							</div>
						</div>

						{/* ระบบปี (พ.ศ. / ค.ศ.) */}
						<div className="flex items-center justify-between gap-4">
							<span className="text-xs font-bold text-[var(--foreground)]">
								ระบบปี (พ.ศ. / ค.ศ.)
							</span>
							<div className="flex items-center p-1 bg-[var(--input-bg)] rounded-full border border-[var(--card-border)]">
								<button
									onClick={() => handleYearSystemChange("CE")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.yearSystem === "CE"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ค.ศ. (C.E.)
								</button>
								<button
									onClick={() => handleYearSystemChange("BE")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.yearSystem === "BE"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									พ.ศ. (B.E.)
								</button>
							</div>
						</div>

						{/* รูปแบบเดือน */}
						<div className="flex items-center justify-between gap-4">
							<span className="text-xs font-bold text-[var(--foreground)]">
								รูปแบบเดือน
							</span>
							<div className="flex items-center p-1 bg-[var(--input-bg)] rounded-full border border-[var(--card-border)]">
								<button
									onClick={() => handleMonthFormatChange("full")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.monthFormat === "full"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ชื่อเต็ม
								</button>
								<button
									onClick={() => handleMonthFormatChange("short")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.monthFormat === "short"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ตัวย่อ
								</button>
								<button
									onClick={() => handleMonthFormatChange("numeric")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.monthFormat === "numeric"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ตัวเลข
								</button>
							</div>
						</div>

						{/* ตัวคั่นวันที่ */}
						<div className="flex items-center justify-between gap-4">
							<span className="text-xs font-bold text-[var(--foreground)]">
								ตัวคั่นวันที่
							</span>
							<div className="flex items-center p-1 bg-[var(--input-bg)] rounded-full border border-[var(--card-border)]">
								<button
									onClick={() => handleDateSeparatorChange(".")}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.dateSeparator === "."
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									จุด ( . )
								</button>
								<button
									onClick={() => handleDateSeparatorChange("/")}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.dateSeparator === "/"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ทับ ( / )
								</button>
								<button
									onClick={() => handleDateSeparatorChange("-")}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.dateSeparator === "-"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									ขีดกลาง ( - )
								</button>
								<button
									onClick={() => handleDateSeparatorChange(" ")}
									className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.dateSeparator === " "
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									เว้นวรรค (  )
								</button>
							</div>
						</div>

						{/* Preview Container */}
						<div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--input-bg)] space-y-1 mt-4">
							<span className="text-[11px] font-bold text-[var(--muted-foreground)]">
								ตัวอย่างรูปแบบวันที่
							</span>
							<p className="text-base font-bold text-[var(--foreground)]">
								{formatDate(sampleDate)}
							</p>
						</div>
					</div>
				)}

				{activeTab === "time" && (
					<div className="space-y-5">
						{/* รูปแบบเวลา */}
						<div className="flex items-center justify-between gap-4">
							<span className="text-xs font-bold text-[var(--foreground)]">
								รูปแบบเวลา
							</span>
							<div className="flex items-center p-1 bg-[var(--input-bg)] rounded-full border border-[var(--card-border)]">
								<button
									onClick={() => handleTimeFormatChange("12")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.timeFormat === "12"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									12 ชั่วโมง
								</button>
								<button
									onClick={() => handleTimeFormatChange("24")}
									className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
										settings.timeFormat === "24"
											? "bg-emerald-500 text-white shadow-xs"
											: "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
									}`}
								>
									24 ชั่วโมง
								</button>
							</div>
						</div>

						{/* Preview Container */}
						<div className="p-4 rounded-2xl border border-[var(--card-border)] bg-[var(--input-bg)] space-y-1 mt-4">
							<span className="text-[11px] font-bold text-[var(--muted-foreground)]">
								ตัวอย่างรูปแบบเวลา
							</span>
							<p className="text-base font-bold text-[var(--foreground)]">
								{formatTime(sampleDate)}
							</p>
						</div>
					</div>
				)}

				{/* Close Button */}
				<div className="pt-2 flex justify-end">
					<button
						onClick={onClose}
						className="px-6 py-2 rounded-full border border-[var(--card-border)] hover:bg-[var(--input-bg)] text-xs font-semibold text-[var(--foreground)] transition-all cursor-pointer"
					>
						{t("common.close") || "ปิด"}
					</button>
				</div>
			</div>
		</div>
	);
}
