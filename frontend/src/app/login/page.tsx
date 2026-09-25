"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import {
  LayoutDashboard,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sun,
  Moon,
  Globe
} from "lucide-react";

function UnifiedAuthForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const isDark = theme === "dark";

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Logging in with email: ${loginEmail}`);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Registering user: ${firstname} ${lastname} (${regEmail})`);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 ${isDark ? "bg-[#0d0f17] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
    >
      {/* Absolute Top Control Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        <button
          onClick={toggleLanguage}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all ${isDark
              ? "bg-slate-900 text-indigo-400 border-slate-800 hover:bg-slate-800"
              : "bg-white text-indigo-600 border-slate-200 hover:bg-slate-100 shadow-sm"
            }`}
          title="Switch Language"
        >
          <Globe className="h-4 w-4" />
          <span>{language.toUpperCase()}</span>
        </button>

        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all ${isDark
              ? "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
            }`}
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-3 group">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105">
              <LayoutDashboard className="h-6 w-6 text-slate-100" />
            </div>
          </Link>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>
            {mode === "login" ? t("auth.welcome_back") : t("auth.create_account")}
          </h1>
          <p className={`text-xs mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {mode === "login" ? t("auth.login_subtitle") : t("auth.register_subtitle")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={`p-1 rounded-2xl border flex mb-6 transition-colors ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-200/60 border-slate-200"}`}>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === "login"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
          >
            {t("common.sign_in")}
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${mode === "register"
                ? "bg-slate-800 text-white border border-slate-700 shadow-sm"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
              }`}
          >
            {t("common.sign_up")}
          </button>
        </div>

        {/* Auth Card */}
        <div
          className={`p-8 rounded-2xl border shadow-xl transition-all duration-300 ${isDark
              ? "bg-[#131625] border-slate-800/90 shadow-slate-950/20"
              : "bg-white border-slate-200/80 shadow-slate-200/50"
            }`}
        >
          {/* Google OAuth Login Button */}
          <button
            type="button"
            className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border font-semibold text-xs transition-all mb-6 ${isDark
                ? "bg-slate-900/90 border-slate-800 hover:bg-slate-800 text-slate-200"
                : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{t("auth.continue_google")}</span>
          </button>

          <div className="relative flex items-center justify-center mb-6">
            <div className={`w-full border-t ${isDark ? "border-slate-800" : "border-slate-200"}`} />
            <span
              className={`absolute px-3 text-[10px] uppercase font-semibold tracking-wider ${isDark ? "bg-[#131625] text-slate-500" : "bg-white text-slate-400"
                }`}
            >
              {t("auth.or_with_email")}
            </span>
          </div>

          {/* Form Switcher */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {t("auth.email_address")}
                </label>
                <div className="relative">
                  <Mail className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 focus:outline-none transition-colors ${isDark
                        ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                        : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                      }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {t("auth.password")}
                  </label>
                  <a href="#" className="text-[11px] font-medium text-blue-400 hover:underline">
                    {t("auth.forgot_password")}
                  </a>
                </div>
                <div className="relative">
                  <Lock className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 focus:outline-none transition-colors ${isDark
                        ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                        : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                      }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl border border-slate-700 shadow-md transition-all mt-2"
              >
                <span>{t("common.sign_in")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {t("auth.firstname")}
                  </label>
                  <div className="relative">
                    <User className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      required
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                      placeholder=""
                      className={`w-full rounded-xl text-xs pl-9 pr-3 py-2.5 focus:outline-none transition-colors ${isDark
                          ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                          : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                        }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {t("auth.lastname")}
                  </label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={(e) => setLastname(e.target.value)}
                    placeholder="K."
                    className={`w-full rounded-xl text-xs px-3 py-2.5 focus:outline-none transition-colors ${isDark
                        ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                        : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {t("auth.email_address")}
                </label>
                <div className="relative">
                  <Mail className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 focus:outline-none transition-colors ${isDark
                        ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                        : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                      }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 focus:outline-none transition-colors ${isDark
                        ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                        : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                      }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl border border-slate-700 shadow-md transition-all mt-2"
              >
                <span>{t("auth.create_account")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Toggle Helper Footer Link */}
          <p className={`text-center text-xs mt-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {mode === "login" ? (
              <>
                {t("auth.dont_have_account")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-semibold text-blue-400 hover:underline"
                >
                  {t("common.sign_up")}
                </button>
              </>
            ) : (
              <>
                {t("auth.already_have_account")}{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold text-blue-400 hover:underline"
                >
                  {t("common.sign_in")}
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function UnifiedAuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f17] flex items-center justify-center text-slate-400 text-xs">Loading...</div>}>
      <UnifiedAuthForm />
    </Suspense>
  );
}
