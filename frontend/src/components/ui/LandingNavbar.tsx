"use client";

import { Globe, LayoutDashboard, Moon, Settings, Sun } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

export function LandingNavbar() {
	const { theme, toggleTheme } = useTheme();
	const { language, toggleLanguage, t } = useLanguage();
	const isDark = theme === "dark";
	const [showSettings, setShowSettings] = useState(false);

	return (
		<nav className="h-16 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
			<div className="flex items-center gap-2.5">
				<div className="h-9 w-9 rounded-xl bg-[var(--primary-btn-bg)] border border-[var(--card-border)] flex items-center justify-center shadow-md shrink-0">
					<LayoutDashboard className="h-5 w-5 text-[var(--primary-btn-text)]" />
				</div>
				<span className="font-bold text-base sm:text-lg tracking-tight truncate text-[var(--foreground)]">
					{t("common.brand")}
				</span>
			</div>

			{/* Desktop Navigation Items */}
			<div className="hidden sm:flex items-center gap-2.5">
				<button
					onClick={toggleLanguage}
					className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
					title="Switch Language"
					aria-label="Switch Language"
				>
					<Globe className="h-3.5 w-3.5 text-slate-400" />
					<span>{language.toUpperCase()}</span>
				</button>

				<button
					onClick={toggleTheme}
					className="p-2 rounded-xl border transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
					title="Toggle Theme"
					aria-label="Toggle Theme"
				>
					{isDark ? (
						<Sun className="h-4 w-4 text-amber-400" />
					) : (
						<Moon className="h-4 w-4 text-slate-700 dark:text-amber-400" />
					)}
				</button>

				<Link
					href="/login"
					onClick={() => {
						if (typeof window !== "undefined") {
							sessionStorage.setItem("auth_mode", "login");
						}
					}}
					className="text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
				>
					{t("common.sign_in")}
				</Link>

				<Link
					href="/login"
					onClick={() => {
						if (typeof window !== "undefined") {
							sessionStorage.setItem("auth_mode", "register");
						}
					}}
					className="text-xs font-semibold px-4 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 bg-[var(--primary-btn-bg)] text-[var(--primary-btn-text)] border-[var(--card-border)] hover:opacity-90 shadow-sm"
				>
					{t("common.sign_up")}
				</Link>
			</div>

			{/* Mobile Navigation Dropdown Button */}
			<div className="flex sm:hidden items-center gap-2">
				<button
					onClick={() => setShowSettings(!showSettings)}
					className={`p-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
						showSettings
							? "bg-slate-800 text-white border-slate-700"
							: "bg-white text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800"
					}`}
					aria-label="Settings Menu"
				>
					<Settings className="h-4 w-4" />
				</button>

				<Link
					href="/login"
					className="text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 bg-slate-900 text-slate-50 border-slate-900 dark:bg-slate-100 dark:text-slate-900 dark:border-slate-100"
				>
					{t("common.sign_in")}
				</Link>

				{showSettings && (
					<div className="absolute right-4 top-16 w-56 rounded-2xl border shadow-2xl p-3 z-50 transition-all origin-top-right animate-in fade-in zoom-in-95 duration-200 bg-white border-slate-200 text-slate-900 dark:bg-[#131625] dark:border-slate-800 dark:text-slate-100">
						<div className="space-y-2 text-xs font-medium">
							<button
								onClick={toggleTheme}
								className="w-full flex items-center justify-between p-2 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-800/80"
							>
								<span className="flex items-center gap-2">
									{isDark ? (
										<Moon className="h-3.5 w-3.5 text-amber-400" />
									) : (
										<Sun className="h-3.5 w-3.5 text-amber-500" />
									)}
									Theme
								</span>
								<span className="text-[10px] font-bold capitalize">
									{theme}
								</span>
							</button>

							<button
								onClick={toggleLanguage}
								className="w-full flex items-center justify-between p-2 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-900/60 dark:border-slate-800 dark:hover:bg-slate-800/80"
							>
								<span className="flex items-center gap-2">
									<Globe className="h-3.5 w-3.5 text-slate-400" />
									Language
								</span>
								<span className="text-[10px] font-bold">
									{language.toUpperCase()}
								</span>
							</button>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
}
