"use client";

import AOS from "aos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import "aos/dist/aos.css";
import {
	ArrowRight,
	Ban,
	CheckCircle2,
	CreditCard,
	History,
	MessageSquare,
} from "lucide-react";
import { Footer } from "@/components/ui/Footer";
import { LandingNavbar } from "@/components/ui/LandingNavbar";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

export default function MainPage() {
	const router = useRouter();
	const { theme } = useTheme();
	const { language, t } = useLanguage();
	const isDark = theme === "dark";
	const [checkingAuth, setCheckingAuth] = useState(false);

	const handleGetStarted = async (e: React.MouseEvent) => {
		e.preventDefault();
		if (checkingAuth) return;
		setCheckingAuth(true);
		try {
			const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
			const res = await fetch(`${apiUrl}/api/auth/me`, {
				credentials: "include",
			});
			if (res.ok) {
				router.push("/home");
			} else {
				router.push("/login");
			}
		} catch {
			router.push("/login");
		} finally {
			setCheckingAuth(false);
		}
	};

	useEffect(() => {
		AOS.init({
			duration: 800,
			once: true,
			easing: "ease-out-cubic",
		});
	}, []);

	useEffect(() => {
		AOS.refresh();
	}, [language]);

	return (
		<div className="min-h-screen flex flex-col font-sans bg-[var(--background)] text-[var(--foreground)]">
			{/* Navigation Bar */}
			<LandingNavbar />

			{/* Main Content Area */}
			<div className="animate-fade-in flex flex-col flex-1">
				{/* Hero Section */}
				<header className="max-w-5xl w-full mx-auto px-6 min-h-[calc(75vh-64px)] text-center flex flex-col items-center justify-center py-12">
					{/* Title Lines with Staggered Fade Delays */}
					<div className="max-w-4xl mb-6">
						<h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight flex flex-col items-center justify-center gap-1.5 sm:gap-2">
							<span
								data-aos="fade-up"
								data-aos-delay="100"
								data-aos-duration="600"
							>
								{t("landing.hero_title_1")}
							</span>
							<span
								data-aos="fade-up"
								data-aos-delay="100"
								data-aos-duration="600"
							>
								{t("landing.hero_title_2")}
							</span>
							<span
								data-aos="fade-up"
								data-aos-delay="300"
								data-aos-duration="600"
								className="text-[var(--foreground)]"
							>
								&ldquo;
								<span className="font-black animate-underline-expand">
									{t("landing.hero_title_3")}
								</span>
								&rdquo;
							</span>
						</h1>
					</div>

					{/* Subtitle */}
					<div
						data-aos="fade-up"
						data-aos-delay="450"
						data-aos-duration="600"
						className="max-w-2xl mb-8"
					>
						<p
							className={`text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-line sm:whitespace-normal ${isDark ? "text-slate-400" : "text-slate-600"}`}
						>
							{t("landing.hero_subtitle")}
						</p>
					</div>

					{/* Get Started Button */}
					<div data-aos="fade-up" data-aos-delay="600" data-aos-duration="600">
						<div className="flex flex-wrap items-center justify-center gap-4">
							<button
								onClick={handleGetStarted}
								disabled={checkingAuth}
								className={`flex items-center gap-2 font-semibold px-6 py-3.5 rounded-xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 cursor-pointer ${
									isDark
										? "bg-slate-100 text-slate-900 border-slate-100 hover:bg-white"
										: "bg-slate-900 text-slate-50 border-slate-900 hover:bg-slate-800"
								}`}
							>
								<span>{t("landing.get_started")}</span>
								<ArrowRight className="h-4 w-4" />
							</button>
						</div>
					</div>
				</header>

				{/* Feature Showcase Section Container */}
				<section
					className={`w-full py-20 border-t select-none ${isDark ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-100/70 border-slate-200/80"}`}
				>
					<div className="max-w-5xl w-full mx-auto px-6 space-y-24 py-4">
						{/* Feature 1: Left Image / Right Text */}
						<div
							data-aos="fade-up"
							className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
						>
							<div>
								<div
									className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
								>
									<div
										className={`aspect-video rounded-2xl border flex flex-col p-4 space-y-3 ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}
									>
										<div
											className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}
										>
											<div className="flex items-center gap-2">
												<div className="h-3 w-3 rounded-full bg-rose-400"></div>
												<div className="h-3 w-3 rounded-full bg-amber-400"></div>
												<div className="h-3 w-3 rounded-full bg-emerald-400"></div>
											</div>
											<span
												className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}
											>
												{t("common.task_checklists")}
											</span>
										</div>
										<div className="space-y-2 pt-1 text-left">
											<div
												className={`p-2.5 rounded-xl border flex items-center gap-3 ${isDark ? "bg-slate-800/80 border-slate-700/60 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
											>
												<CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
												<span className="text-xs font-medium line-through opacity-75">
													{t("landing.demo_task_1")}
												</span>
											</div>
											<div
												className={`p-2.5 rounded-xl border flex items-center gap-3 ${isDark ? "bg-slate-800/80 border-slate-700/60 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}
											>
												<div
													className={`h-4 w-4 rounded-full border shrink-0 ${isDark ? "border-slate-400" : "border-slate-400"}`}
												></div>
												<span className="text-xs font-medium">
													{t("landing.demo_task_2")}
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div>
								<div className="space-y-4 text-center md:text-left">
									<h2
										className={`text-2xl md:text-3xl font-extrabold tracking-tight whitespace-pre-line ${isDark ? "text-slate-100" : "text-slate-900"}`}
									>
										{t("landing.feature_1_title")}
									</h2>
									<p
										className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-slate-400" : "text-slate-600"}`}
									>
										{t("landing.feature_1_desc")}
									</p>
								</div>
							</div>
						</div>

						{/* Feature 2: Left Text / Right Image */}
						<div
							data-aos="fade-up"
							className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
						>
							<div className="order-2 md:order-1">
								<div className="space-y-4 text-center md:text-left">
									<h2
										className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
									>
										{t("landing.feature_2_title")}
									</h2>
									<p
										className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
									>
										{t("landing.feature_2_desc")}
									</p>
								</div>
							</div>

							<div className="order-1 md:order-2">
								<div
									className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
								>
									<div
										className={`aspect-video rounded-2xl border flex flex-col p-4 justify-between ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}
									>
										<div
											className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}
										>
											<span
												className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}
											>
												{t("kanban.board_members")}
											</span>
										</div>
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-amber-500 border-2 border-amber-400 flex items-center justify-center text-xs font-bold text-amber-950 shadow-md">
												SJ
											</div>
											<div className="h-10 w-10 rounded-full bg-blue-600 border-2 border-blue-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
												DT
											</div>
											<div className="h-10 w-10 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center text-xs font-bold text-slate-300 shadow-md tabular-nums">
												+2
											</div>
										</div>
										<p
											className={`text-[11px] text-left ${isDark ? "text-slate-400" : "text-slate-600"}`}
										>
											{t("common.role_based_access")}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Feature 3: Real-time Activity */}
						<div
							data-aos="fade-up"
							className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
						>
							<div>
								<div
									className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
								>
									<div
										className={`aspect-video rounded-2xl border flex flex-col p-4 space-y-2.5 justify-between ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}
									>
										<div
											className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}
										>
											<span
												className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}
											>
												<History className="h-3.5 w-3.5 text-indigo-400" />{" "}
												{t("common.activity_logs")}
											</span>
										</div>
										<div className="space-y-1.5 text-left">
											<div
												className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-white border-slate-200"}`}
											>
												<span className="font-semibold text-indigo-400 truncate">
													{t("landing.demo_audit_1")}
												</span>
												<span
													className={`text-[9px] shrink-0 ml-2 tabular-nums ${isDark ? "text-slate-500" : "text-slate-500"}`}
												>
													{t("landing.demo_audit_time_1")}
												</span>
											</div>
											<div
												className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-white border-slate-200 text-slate-700"}`}
											>
												<span
													className={`font-medium truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}
												>
													{t("landing.demo_audit_2")}
												</span>
												<span
													className={`text-[9px] shrink-0 ml-2 tabular-nums ${isDark ? "text-slate-500" : "text-slate-500"}`}
												>
													{t("landing.demo_audit_time_2")}
												</span>
											</div>
										</div>
										<p
											className={`text-[10px] flex items-center gap-1 text-left ${isDark ? "text-slate-400" : "text-slate-600"}`}
										>
											<MessageSquare className="h-3 w-3 text-indigo-400" />{" "}
											{t("landing.demo_audit_footer")}
										</p>
									</div>
								</div>
							</div>

							<div>
								<div className="space-y-4 text-center md:text-left">
									<h2
										className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
									>
										{t("landing.feature_4_title")}
									</h2>
									<p
										className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-slate-400" : "text-slate-600"}`}
									>
										{t("landing.feature_4_desc")}
									</p>
								</div>
							</div>
						</div>

						{/* Feature 4: 100% Free Usage */}
						<div
							data-aos="fade-up"
							className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
						>
							<div className="order-2 md:order-1">
								<div className="space-y-4 text-center md:text-left">
									<h2
										className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}
									>
										{t("landing.feature_3_title")}
									</h2>
									<p
										className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}
									>
										{t("landing.feature_3_desc")}
									</p>
								</div>
							</div>

							<div className="order-1 md:order-2">
								<div
									className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}
								>
									<div
										className={`aspect-video rounded-2xl border flex flex-col items-center justify-center p-6 text-center ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}
									>
										<div className="relative mb-3 flex items-center justify-center">
											<div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-sm">
												<CreditCard
													className={`h-8 w-8 ${isDark ? "text-slate-400" : "text-slate-500"}`}
												/>
												<Ban className="absolute inset-0 h-16 w-16 text-red-500/80 stroke-[1.5]" />
											</div>
										</div>
										<span
											className={`text-xl font-extrabold tabular-nums ${isDark ? "text-slate-100" : "text-slate-900"}`}
										>
											{t("common.free_forever")}
										</span>
										<span
											className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}
										>
											{t("landing.demo_no_credit_card")}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>

			{/* Scroll To Top Floating Button */}
			<ScrollToTop />

			{/* Footer */}
			<Footer />
		</div>
	);
}
