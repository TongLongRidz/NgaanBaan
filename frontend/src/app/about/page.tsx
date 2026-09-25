"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Footer } from "@/components/ui/Footer";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { LayoutDashboard, Target, Users, ShieldCheck, ArrowLeft } from "lucide-react";

export default function AboutUsPage() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDark ? "bg-[#0d0f17] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}
    >
      <TopNavbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
        <Link
          href="/"
          className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
            isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{language === "th" ? "กลับสู่หน้าหลัก" : "Back to Home"}</span>
        </Link>

        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-500">
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>NgaanBaanBoard</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("common.about_us")}
          </h1>
          <p className={`text-base leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {t("common.about_us_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">{language === "th" ? "เป้าหมายของเรา" : "Our Mission"}</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "ส่งเสริมการบริหารจัดการงานย่อยในทีมด้วยบอร์ดคันบันที่เรียบง่าย ทรงพลัง และเข้าถึงได้ฟรีโดยไม่มีข้อจำกัด"
                : "Empower team task management with a simple, powerful, and accessible Kanban board platform without limits."}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">{language === "th" ? "การทำงานร่วมกัน" : "Team Collaboration"}</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "ออกแบบมาเพื่อให้สมาชิกทุกคนในทีมสามารถติดตามสถานะงาน เพิ่มเช็คลิสต์ และอัปเดตงานย่อยได้อย่างชัดเจนและเป็นระเบียบ"
                : "Designed to help all team members track task statuses, add subtask checklists, and stay synchronized effortless."}
            </p>
          </div>

          <div className={`p-6 rounded-2xl border space-y-3 ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-sm">{language === "th" ? "ความเรียบง่ายและปลอดภัย" : "Simplicity & Security"}</h3>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "เน้นการใช้งานที่ตรงไปตรงมา ปลอดภัย ใช้งานง่าย ให้คุณโฟกัสกับเนื้องานได้อย่างเต็มประสิทธิภาพ"
                : "Focusing on intuitive user interface and secure features so you can fully dedicate your focus to task execution."}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
