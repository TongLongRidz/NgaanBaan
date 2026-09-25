"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { LayoutDashboard, Mail } from "lucide-react";

export function Footer() {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === "dark";

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isDark
          ? "border-slate-800/80 bg-[#0d0f17] text-slate-400"
          : "border-slate-200/90 bg-slate-50 text-slate-600"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b ${isDark ? "border-slate-800/60" : "border-slate-200/60"}`}>
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-indigo-400 shadow-md">
                <LayoutDashboard className="h-5 w-5 text-indigo-400" />
              </div>
              <span className={`text-lg font-bold tracking-tight ${isDark ? "text-slate-100" : "text-slate-900"}`}>
                {t("common.brand")}
              </span>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-900"}`}>
              {t("common.product")}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <span className={`select-none ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  {t("common.kanban_boards")}
                </span>
              </li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-200" : "text-slate-900"}`}>
              {t("common.connect")}
            </h4>
            <div className="flex items-center gap-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={`p-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isDark
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-indigo-400"
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 shadow-sm"
                }`}
                title="GitHub"
                aria-label="GitHub Repository"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <a
                href="mailto:support@ngaanbaanboard.com"
                className={`p-2 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  isDark
                    ? "bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-indigo-400"
                    : "bg-white border-slate-200 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 shadow-sm"
                }`}
                title={t("common.email_support")}
                aria-label="Email Support"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className={`flex items-center gap-1 tabular-nums ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span>© 2026 {t("common.brand")}. {t("common.all_rights_reserved")}</span>
          </div>

          <div className={`flex items-center gap-6 font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Link
              href="/about"
              className="hover:text-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1 py-0.5"
            >
              {t("common.about_us")}
            </Link>
            <Link
              href="/privacy"
              className="hover:text-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1 py-0.5"
            >
              {t("common.privacy_policy")}
            </Link>
            <Link
              href="/terms"
              className="hover:text-indigo-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-md px-1 py-0.5"
            >
              {t("common.terms_of_service")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
