"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Footer } from "@/components/ui/Footer";
import {
  LayoutDashboard,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  CheckCircle2,
  ShieldCheck,
  Users,
  Settings,
  X,
  Sparkles,
  History,
  MessageSquare,
  CreditCard,
  Ban,
  Banknote
} from "lucide-react";

export default function MainPage() {
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === "dark";
  const [showSettings, setShowSettings] = React.useState(false);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
      {/* Navigation Bar */}
      <nav className="h-16 border-b border-[var(--nav-border)] bg-[var(--nav-bg)] backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-md shrink-0">
            <LayoutDashboard className="h-5 w-5 text-slate-100" />
          </div>
          <span className={`font-bold text-base sm:text-lg tracking-tight truncate ${isDark ? "text-slate-50" : "text-slate-900"}`}>
            {t("common.brand")}
          </span>
        </div>

        {/* Desktop Navigation Items */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={toggleLanguage}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDark
                ? "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
            }`}
            title="Switch Language"
            aria-label="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-slate-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDark
                ? "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
            }`}
            title="Toggle Theme"
            aria-label="Toggle Theme"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <Link
            href="/login"
            className={`text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              isDark
                ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200"
                : "bg-white border-slate-200 hover:bg-slate-100 text-slate-800 shadow-sm"
            }`}
          >
            {t("common.sign_in")}
          </Link>

          <Link
            href="/login?mode=register"
            className={`text-xs font-semibold px-4 py-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
              isDark
                ? "bg-slate-100 text-slate-900 border-slate-100 hover:bg-white"
                : "bg-slate-900 text-slate-50 border-slate-900 hover:bg-slate-800"
            }`}
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
                : isDark
                  ? "bg-slate-900 text-slate-300 border-slate-800"
                  : "bg-white text-slate-700 border-slate-200"
            }`}
            aria-label="Settings Menu"
          >
            <Settings className="h-4 w-4" />
          </button>

          <Link
            href="/login"
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
              isDark
                ? "bg-slate-100 text-slate-900 border-slate-100"
                : "bg-slate-900 text-slate-50 border-slate-900"
            }`}
          >
            {t("common.sign_in")}
          </Link>

          {showSettings && (
            <div
              className={`absolute right-4 top-16 w-56 rounded-2xl border shadow-2xl p-3 z-50 transition-all ${
                isDark ? "bg-[#131625] border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
              }`}
            >
              <div className="space-y-2 text-xs font-medium">
                <button
                  onClick={toggleTheme}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
                    isDark ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isDark ? <Moon className="h-3.5 w-3.5 text-amber-400" /> : <Sun className="h-3.5 w-3.5 text-amber-500" />}
                    Theme
                  </span>
                  <span className="text-[10px] font-bold capitalize">{theme}</span>
                </button>

                <button
                  onClick={toggleLanguage}
                  className={`w-full flex items-center justify-between p-2 rounded-xl border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
                    isDark ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/80" : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    Language
                  </span>
                  <span className="text-[10px] font-bold">{language.toUpperCase()}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area with Language Fade Effect */}
      <div key={language} className="animate-fade-in flex flex-col flex-1">
        {/* Hero Section */}
        <header className="max-w-5xl w-full mx-auto px-6 min-h-[calc(75vh-64px)] text-center flex flex-col items-center justify-center py-12">
          {/* Title Part 1 & 2 */}
          <div data-aos="fade-up" data-aos-duration="600" className="max-w-3xl mb-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
              {t("landing.hero_title_1")}{" "}
              <span className={`font-black animate-underline-expand ${isDark ? "text-slate-50" : "text-slate-900"}`}>
                &ldquo;{t("landing.hero_title_2")}&rdquo;
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <div data-aos="fade-up" data-aos-delay="200" data-aos-duration="600" className="max-w-2xl mb-8">
            <p className={`text-base md:text-lg leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {t("landing.hero_subtitle")}
            </p>
          </div>

          {/* Get Started Button */}
          <div data-aos="fade-up" data-aos-delay="400" data-aos-duration="600">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/projects"
                className={`flex items-center gap-2 font-semibold px-6 py-3.5 rounded-xl border text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 ${
                  isDark
                    ? "bg-slate-100 text-slate-900 border-slate-100 hover:bg-white"
                    : "bg-slate-900 text-slate-50 border-slate-900 hover:bg-slate-800"
                }`}
              >
                <span>{t("landing.get_started")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>


        {/* Feature Showcase Section Container */}
        <section className={`w-full py-20 border-t select-none ${isDark ? "bg-slate-900/40 border-slate-800/80" : "bg-slate-100/70 border-slate-200/80"}`}>
          <div className="max-w-5xl w-full mx-auto px-6 space-y-24 py-4">
            {/* Feature 1: Left Image / Right Text */}
            <div data-aos="fade-up" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
                  <div className={`aspect-video rounded-2xl border flex flex-col p-4 space-y-3 ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-400"></div>
                        <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                        <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
                      </div>
                      <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                        {t("common.task_checklists")}
                      </span>
                    </div>
                    <div className="space-y-2 pt-1 text-left">
                      <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${isDark ? "bg-slate-800/80 border-slate-700/60 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium line-through opacity-75">{t("landing.demo_task_1")}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl border flex items-center gap-3 ${isDark ? "bg-slate-800/80 border-slate-700/60 text-slate-200" : "bg-white border-slate-200 text-slate-800"}`}>
                        <div className={`h-4 w-4 rounded-full border shrink-0 ${isDark ? "border-slate-400" : "border-slate-400"}`}></div>
                        <span className="text-xs font-medium">{t("landing.demo_task_2")}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-4 text-center md:text-left">
                  <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight whitespace-pre-line ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {t("landing.feature_1_title")}
                  </h2>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("landing.feature_1_desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2: Left Text / Right Image */}
            <div data-aos="fade-up" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {t("landing.feature_2_title")}
                  </h2>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("landing.feature_2_desc")}
                  </p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
                  <div className={`aspect-video rounded-2xl border flex flex-col p-4 justify-between ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}>
                      <span className={`text-xs font-bold ${isDark ? "text-slate-400" : "text-slate-600"}`}>
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
                    <p className={`text-[11px] text-left ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("common.role_based_access")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Real-time Activity */}
            <div data-aos="fade-up" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <div className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
                  <div className={`aspect-video rounded-2xl border flex flex-col p-4 space-y-2.5 justify-between ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${isDark ? "border-slate-700/30" : "border-slate-200"}`}>
                      <span className={`text-xs font-bold flex items-center gap-1.5 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        <History className="h-3.5 w-3.5 text-indigo-400" /> {t("common.activity_logs")}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <div className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-white border-slate-200"}`}>
                        <span className="font-semibold text-indigo-400 truncate">{t("landing.demo_audit_1")}</span>
                        <span className={`text-[9px] shrink-0 ml-2 tabular-nums ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("landing.demo_audit_time_1")}</span>
                      </div>
                      <div className={`p-2 rounded-xl border text-[11px] flex items-center justify-between ${isDark ? "bg-slate-800/80 border-slate-700/60" : "bg-white border-slate-200 text-slate-700"}`}>
                        <span className={`font-medium truncate ${isDark ? "text-slate-300" : "text-slate-700"}`}>{t("landing.demo_audit_2")}</span>
                        <span className={`text-[9px] shrink-0 ml-2 tabular-nums ${isDark ? "text-slate-500" : "text-slate-500"}`}>{t("landing.demo_audit_time_2")}</span>
                      </div>
                    </div>
                    <p className={`text-[10px] flex items-center gap-1 text-left ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      <MessageSquare className="h-3 w-3 text-indigo-400" /> {t("landing.demo_audit_footer")}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <div className="space-y-4 text-center md:text-left">
                  <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {t("landing.feature_4_title")}
                  </h2>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("landing.feature_4_desc")}
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 4: 100% Free Usage */}
            <div data-aos="fade-up" className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="space-y-4 text-center md:text-left">
                  <h2 className={`text-2xl md:text-3xl font-extrabold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                    {t("landing.feature_3_title")}
                  </h2>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {t("landing.feature_3_desc")}
                  </p>
                </div>
              </div>

              <div className="order-1 md:order-2">
                <div className={`p-6 rounded-3xl border transition-colors duration-300 pointer-events-none ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200/80 shadow-sm"}`}>
                  <div className={`aspect-video rounded-2xl border flex flex-col items-center justify-center p-6 text-center ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-slate-50 border-slate-200/80"}`}>
                    <div className="relative mb-3 flex items-center justify-center">
                      <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 shadow-sm">
                        <CreditCard className={`h-8 w-8 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                        <Ban className="absolute inset-0 h-16 w-16 text-red-500/80 stroke-[1.5]" />
                      </div>
                    </div>
                    <span className={`text-xl font-extrabold tabular-nums ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                      {t("common.free_forever")}
                    </span>
                    <span className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {t("landing.demo_no_credit_card")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
