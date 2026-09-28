"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Lock,
  MailCheck,
  ArrowRight
} from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface VerificationCardProps {
  email: string;
  devOtpCode?: string;
  verificationToken?: string;
  otpCode: string;
  setOtpCode: (val: string) => void;
  resendTimer: number;
  loading: boolean;
  onVerifyOtp: (e: React.FormEvent) => void;
  onResendOtp: () => void;
}

export function EmailVerificationCard({
  email,
  devOtpCode,
  verificationToken,
  otpCode,
  setOtpCode,
  resendTimer,
  loading,
  onVerifyOtp,
  onResendOtp,
}: VerificationCardProps) {
  const { language, t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  const verifyLink = typeof window !== "undefined" && verificationToken
    ? `${window.location.origin}/login?token=${verificationToken}`
    : `http://localhost:3000/login?token=${verificationToken || ""}`;

  const handleCopyLink = () => {
    if (navigator.clipboard && verifyLink) {
      navigator.clipboard.writeText(verifyLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyOtp = () => {
    if (navigator.clipboard && devOtpCode) {
      navigator.clipboard.writeText(devOtpCode);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto transition-all duration-300">
      {/* Impeccable Card Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl relative overflow-hidden">
        
        {/* Subtle Decorative Gradient Orb */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3 border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
            <MailCheck className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t("auth.verify_email_title")}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed px-2">
            {language === "th"
              ? "ระบบได้ส่งรหัสยืนยัน OTP 6 หลัก และลิงก์ไปยังอีเมล"
              : "We sent a 6-digit verification code & link to"}
          </p>
          <div className="inline-block mt-1 font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 rounded-full text-xs border border-indigo-100 dark:border-indigo-800/40">
            {email || "your email"}
          </div>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={onVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-center mb-2">
              {language === "th" ? "กรอกรหัส OTP 6 หลัก" : "Enter 6-digit OTP Code"}
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="• • • • • •"
                className="w-full text-center text-2xl font-mono tracking-[0.6em] py-3 px-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold"
                autoFocus
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || otpCode.length < 6}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center space-x-2 text-sm"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t("auth.verify_otp_btn")}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Resend OTP Section */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onResendOtp}
            disabled={resendTimer > 0 || loading}
            className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 disabled:opacity-60 disabled:hover:text-slate-500 transition-colors inline-flex items-center space-x-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resendTimer > 0 ? "" : "animate-bounce"}`} />
            <span>
              {resendTimer > 0
                ? t("auth.resend_otp_btn").replace("{seconds}", resendTimer.toString())
                : t("auth.resend_otp_ready")}
            </span>
          </button>
        </div>

        {/* Dev Helper Banner (Local Dev Mode Display) */}
        {devOtpCode && (
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
            <div className="bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/50 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center justify-between font-bold mb-2">
                <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {language === "th" ? "Dev Quick Action" : "Dev Quick Action"}
                </span>
                <button
                  onClick={handleCopyOtp}
                  className="hover:underline flex items-center gap-1 text-amber-700 dark:text-amber-300"
                >
                  {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedOtp ? "Copied" : "Fill OTP"}
                </button>
              </div>

              <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-2.5 flex items-center justify-between border border-amber-200/50 dark:border-amber-900/40 mb-2">
                <span className="text-slate-500 dark:text-slate-400">OTP:</span>
                <span className="font-mono font-bold text-base tracking-widest text-slate-900 dark:text-white">
                  {devOtpCode}
                </span>
                <button
                  onClick={() => setOtpCode(devOtpCode)}
                  className="px-2 py-1 bg-amber-500 text-white font-semibold rounded-md text-[10px] hover:bg-amber-600 transition-colors shadow-sm"
                >
                  Auto Fill
                </button>
              </div>

              {verificationToken && (
                <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/30">
                  <button
                    onClick={handleCopyLink}
                    className="flex-1 py-1.5 px-2.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center justify-center gap-1 text-[11px] font-medium hover:bg-amber-50 transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied Link" : "Copy Magic Link"}</span>
                  </button>

                  <a
                    href={verifyLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center justify-center gap-1 text-[11px] font-semibold transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Link</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
