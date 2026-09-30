"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import {
  FolderKanban,
  Home,
  ArrowLeft,
  Compass,
  Globe,
  LogIn
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    setMounted(true);

    const checkAuthStatus = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/auth/me`, {
          credentials: "include",
        });

        if (res.ok) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (err) {
        setIsLoggedIn(false);
      }
    };

    checkAuthStatus();
  }, []);

  const isDark = theme === "dark";

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 relative overflow-hidden ${
      isDark ? "bg-[#0d0f17] text-slate-100" : "bg-[#fafafa] text-slate-900"
    }`}>
      {/* Background Ambient Blur */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-20 transition-all duration-700 ${
          isDark ? "bg-indigo-900" : "bg-indigo-100"
        }`} />
        <div className={`absolute -bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-15 transition-all duration-700 ${
          isDark ? "bg-slate-800" : "bg-slate-200"
        }`} />

        {/* Structural Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(${isDark ? "#ffffff" : "#000000"} 1px, transparent 1px)`,
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* Top Bar with Language and Theme Controls */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-end">
        <div className="flex items-center gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className={`h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl border text-xs font-semibold transition-all ${
              isDark 
                ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800" 
                : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
            }`}
            title="Toggle Language"
          >
            <Globe className="h-4 w-4 text-indigo-500" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Circle Animated Theme Switcher */}
          <AnimatedThemeToggler
            theme={theme}
            onThemeChange={() => toggleTheme()}
            variant="circle"
            duration={500}
            className={`w-9 h-9 inline-flex items-center justify-center rounded-xl border transition-all ${
              isDark
                ? "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
            }`}
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          />
        </div>
      </header>

      {/* Main 404 Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center max-w-3xl mx-auto">
        {/* Large 404 Display */}
        <div className="relative mb-6 select-none">
          <h1 className="text-8xl sm:text-9xl font-black tracking-tight tabular-nums text-slate-900 dark:text-slate-100">
            404
          </h1>
          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-full blur-md ${
            isDark ? "bg-slate-800/40" : "bg-slate-300/40"
          }`} />
        </div>

        {/* Title and Description */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
          {t("not_found.title")}
        </h2>
        <p className={`text-sm sm:text-base leading-relaxed max-w-lg mb-8 ${
          isDark ? "text-slate-400" : "text-slate-600"
        }`}>
          {t("not_found.description")}
        </p>

        {/* Dynamic CTA depending on Login status */}
        <div className="flex items-center justify-center w-full max-w-xs">
          {isLoggedIn === null ? (
            /* Loading State while Checking Session */
            <div className={`w-full h-12 rounded-xl animate-pulse flex items-center justify-center text-xs font-medium ${
              isDark ? "bg-slate-900/80 border border-slate-800 text-slate-400" : "bg-slate-200 text-slate-500"
            }`}>
              {t("not_found.status_checking")}
            </div>
          ) : isLoggedIn ? (
            /* LOGGED IN USER: Go to /projects */
            <Link
              href="/projects"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-md shadow-indigo-600/20 transition-all duration-200"
            >
              <FolderKanban className="h-4 w-4" />
              <span>{t("not_found.btn_return_projects")}</span>
            </Link>
          ) : (
            /* NOT LOGGED IN USER: Go to Landing Page / */
            <Link
              href="/"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] shadow-md shadow-indigo-600/20 transition-all duration-200"
            >
              <Home className="h-4 w-4" />
              <span>{t("not_found.btn_return_home")}</span>
            </Link>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
        <p>{t("common.footer_text")}</p>
      </footer>
    </div>
  );
}
