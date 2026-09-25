"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Footer } from "@/components/ui/Footer";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { Shield, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy & Security</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("common.privacy_policy")}
          </h1>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "th" ? "อัปเดตล่าสุด: กันยายน 2026" : "Last updated: September 2026"}
          </p>
        </div>

        <div className={`p-8 rounded-3xl border space-y-8 ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Eye className="h-4 w-4 text-indigo-500" />
              <span>{language === "th" ? "1. การเก็บรวบรวมข้อมูล" : "1. Information We Collect"}</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "เราเก็บรวบรวมข้อมูลเฉพาะที่จำเป็นสำหรับการลงทะเบียนและการใช้งานระบบกระดานคันบัน เช่น ชื่อ อีเมล และข้อมูลการจัดการงานย่อยภายในบอร์ด เพื่อให้บริการระบบได้อย่างสมบูรณ์"
                : "We collect information strictly required for user registration and workspace usage, such as your name, email address, and task board data to provide our Kanban service effectively."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-500" />
              <span>{language === "th" ? "2. การรักษาความปลอดภัยของข้อมูล" : "2. Data Protection & Security"}</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "ข้อมูลของคุณจะได้รับการปกป้องด้วยมาตรการรักษาความปลอดภัยตามมาตรฐานสากล เราไม่มีการส่งต่อ ขาย หรือแบ่งปันข้อมูลส่วนบุคคลของคุณให้กับบุคคลภายนอกโดยเด็ดขาด"
                : "Your personal and workspace data is safeguarded with strict industry security standards. We strictly do not sell, rent, or trade your personal information with third parties."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span>{language === "th" ? "3. สิทธิของผู้ใช้งาน" : "3. User Rights"}</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "ผู้ใช้งานมีสิทธิ์ในการเข้าถึง แก้ไข หรือลบข้อมูลส่วนบุคคลและข้อมูลบอร์ดงานของตนเองได้ตลอดเวลาผ่านทางระบบตั้งค่าบัญชี"
                : "Users retain full ownership and rights to access, update, or delete their personal account information and board data anytime via workspace settings."}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
