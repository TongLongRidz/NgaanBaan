"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { showAlert } from "@/components/ui/notification/sweetalert/sweetalert";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sun,
  Moon,
  Globe,
  KeyRound
} from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted ? theme === "dark" : false;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { percent: 0, label: "", color: "bg-slate-300", isValid: false };
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass) || /[a-z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;

    let label = "";
    let color = "bg-rose-500";
    if (score <= 25) {
      label = language === "th" ? "อ่อนมาก" : "Very Weak";
      color = "bg-rose-500";
    } else if (score <= 50) {
      label = language === "th" ? "ปานกลาง" : "Medium";
      color = "bg-amber-500";
    } else if (score <= 75) {
      label = language === "th" ? "ดี" : "Good";
      color = "bg-emerald-400";
    } else {
      label = language === "th" ? "ปลอดภัยมาก" : "Strong";
      color = "bg-emerald-500";
    }

    const isValid = pass.length >= 8;
    return { percent: score, label, color, isValid };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setErrorMsg("ไม่พบโทเค็นรีเซ็ตรหัสผ่าน กรุณาขอลิงก์ใหม่อีกครั้ง");
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg("รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("รหัสผ่านทั้งสองช่องไม่ตรงกัน");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      }

      await showAlert({
        title: "เปลี่ยนรหัสผ่านสำเร็จ!",
        text: "กรุณาเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณ",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });

      router.push("/login");
    } catch (err: any) {
      setErrorMsg(err.message || "เกิดข้อผิดพลาดในการตั้งรหัสผ่านใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 ${
        isDark ? "bg-[#0d0f17] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* Top Navbar */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <button
          type="button"
          onClick={toggleLanguage}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{language.toUpperCase()}</span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className={`p-2 rounded-xl border text-xs transition-all ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-sm"
          }`}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-3 group">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105">
              <KeyRound className="h-6 w-6 text-slate-100" />
            </div>
          </Link>
          <h1 className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}>
            ตั้งรหัสผ่านใหม่
          </h1>
          <p className={`text-xs mt-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ
          </p>
        </div>

        {/* Form Container Card */}
        <div
          className={`p-8 rounded-2xl border shadow-xl transition-all duration-300 ${
            isDark
              ? "bg-[#131625] border-slate-800/90 shadow-slate-950/20"
              : "bg-white border-slate-200/80 shadow-slate-200/50"
          }`}
        >
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className={`block text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  รหัสผ่านใหม่
                </label>
                {newPassword && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {getPasswordStrength(newPassword).percent}% {getPasswordStrength(newPassword).label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร)"
                  className={`w-full rounded-xl text-xs pl-9 pr-10 py-2.5 outline-none transition-colors ${
                    isDark
                      ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                      : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                  }`}
                  autoFocus
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-3 transition-colors ${
                    isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Progress Bar */}
              {newPassword && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div
                    className={`h-full ${getPasswordStrength(newPassword).color} transition-all duration-300`}
                    style={{ width: `${getPasswordStrength(newPassword).percent}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                ยืนยันรหัสผ่านใหม่
              </label>
              <div className="relative">
                <Lock className={`h-4 w-4 absolute left-3 top-3 ${isDark ? "text-slate-500" : "text-slate-400"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                  className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 outline-none transition-colors ${
                    isDark
                      ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                      : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border shadow-md transition-all mt-4 ${
                isDark
                  ? "bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700"
                  : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
              } disabled:opacity-50 cursor-pointer`}
            >
              <span>{loading ? "กำลังบันทึก..." : "ยืนยันตั้งรหัสผ่านใหม่"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className={`text-center text-xs mt-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <Link href="/login" className="font-semibold text-blue-400 hover:underline">
              ← กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
