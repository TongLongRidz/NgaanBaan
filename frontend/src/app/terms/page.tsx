"use client";

import React from "react";
import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { Footer } from "@/components/ui/Footer";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { FileText, CheckCircle2, AlertCircle, HelpCircle, ArrowLeft } from "lucide-react";

export default function TermsOfServicePage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <FileText className="h-3.5 w-3.5" />
            <span>Terms & Conditions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            {t("common.terms_of_service")}
          </h1>
          <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {language === "th" ? "อัปเดตล่าสุด: กันยายน 2026" : "Last updated: September 2026"}
          </p>
        </div>

        <div className={`p-8 rounded-3xl border space-y-8 ${isDark ? "bg-[#131625] border-slate-800" : "bg-white border-slate-200 shadow-sm"}`}>
          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span>{language === "th" ? "1. ข้อตกลงการใช้งานบริการ" : "1. Terms of Service Usage"}</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "การเข้าถึงและใช้งานระบบ NgaanBaanBoard ถือว่าคุณยอมรับข้อตกลงและเงื่อนไขการใช้งานเหล่านี้ บริการนี้จัดทำขึ้นเพื่อการบริหารจัดการงานและโครงการอย่างมีประสิทธิภาพ"
                : "By accessing and using NgaanBaanBoard, you agree to comply with and be bound by these Terms of Service. Our platform is created to facilitate effective task management and team collaboration."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span>{language === "th" ? "2. บัญชีผู้ใช้และการรับผิดชอบ" : "2. User Accounts & Responsibilities"}</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "ผู้ใช้งานมีหน้าที่ดูแลความปลอดภัยของบัญชีและรหัสผ่านตนเอง รวมถึงรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีดังกล่าว"
                : "Users are responsible for maintaining the confidentiality of their account credentials and are fully accountable for all activities conducted under their account."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              <span>{language === "th" ? "3. การปรับปรุงและเปลี่ยนแปลงบริการ" : "3. Service Modifications"}</span>
            </h2>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {language === "th"
                ? "เราขอสงวนสิทธิ์ในการปรับปรุง พัฒนา หรือแก้ไขฟังก์ชันการทำงานของบริการเพื่อเพิ่มประสิทธิภาพการใช้งานอย่างต่อเนื่อง"
                : "We reserve the right to modify, upgrade, or enhance system functionality continuously to provide optimized task management performance for our users."}
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
