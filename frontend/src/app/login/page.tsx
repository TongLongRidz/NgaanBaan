"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { showAlert } from "@/components/ui/notification/sweetalert/sweetalert";
import {
  LayoutDashboard,
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Sun,
  Moon,
  Globe,
  Check,
  Eye,
  EyeOff,
  ShieldCheck,
  Copy,
  ExternalLink,
  RefreshCw,
  KeyRound
} from "lucide-react";
import { EmailVerificationCard } from "@/components/ui/email/VerificationCard";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";

function UnifiedAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "register" ? "register" : "login";

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const isDark = mounted ? theme === "dark" : false;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Form states
  const [mode, setMode] = useState<"login" | "register" | "verify" | "forgot">(initialMode);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  // Email verification states
  const [otpCode, setOtpCode] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [devOtpCode, setDevOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [forgotCooldown, setForgotCooldown] = useState(0);
  const [hasSentForgotOnce, setHasSentForgotOnce] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [accessToken, setAccessToken] = useState("");


  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const [loading, setLoading] = useState(false);

  // Auto verify if token query param exists
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      handleVerifyByTokenParam(tokenParam);
    }
  }, [searchParams]);

  const handleVerifyByTokenParam = async (token: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/auth/verify-link?token=${token}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }
      await showAlert({
        title: t("auth.verification_success"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      router.push("/projects/recent");
    } catch (err: any) {
      setErrorMsg(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get("mode") === "register") {
      setMode("register");
    }
  }, [searchParams]);

  // Password strength calculator
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, percent: 0, label: "", color: "bg-slate-300", isValid: false };
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
    return { score, percent: score, label, color, isValid };
  };

  // Real-time Validation helper
  const validateField = (name: string, value: string) => {
    let err = "";
    if (name === "loginEmail") {
      if (!value.trim()) {
        err = t("auth.email_required");
      }
    } else if (name === "regEmail") {
      const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
      if (!value.trim()) {
        err = t("auth.email_required");
      } else if (!emailRegex.test(value.trim()) || value.includes("..")) {
        err = t("auth.email_missing_at");
      }
    } else if (name === "loginPassword") {
      if (!value) {
        err = t("auth.password_required");
      }
    } else if (name === "regPassword") {
      if (!value) {
        err = t("auth.password_required");
      } else if (value.length < 8) {
        err = t("auth.password_min_length");
      }
    } else if (name === "firstname") {
      if (!value.trim()) {
        err = t("auth.firstname_required");
      }
    }

    setFieldErrors((prev) => ({ ...prev, [name]: err }));
    return err;
  };

  const switchMode = (newMode: "login" | "register" | "forgot") => {
    setMode(newMode);
    setFieldErrors({});
    setTouched({});
    setErrorMsg("");
    setSuccessMsg("");
    setErrorKey(null);
    setSuccessKey(null);
    setLoginEmail("");
    setLoginPassword("");
    setFirstname("");
    setLastname("");
    setRegEmail("");
    setRegPassword("");
    setForgotEmail("");
  };

  const handleBlur = (name: string, value: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    // Only validate on blur if user typed something (e.g. check email @ format)
    // Empty field errors will only show upon Form Submit
    if (value.trim()) {
      validateField(name, value);
    }
  };

  const handleChange = (name: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const [errorKey, setErrorKey] = useState<{ key: string; params?: Record<string, string> } | null>(null);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  useEffect(() => {
    if (lockoutTimer <= 0) return;
    const interval = setInterval(() => {
      setLockoutTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorKey(null);
          return 0;
        }
        const next = prev - 1;
        setErrorKey((current) => {
          if (current?.key === "auth.account_locked") {
            return { ...current, params: { seconds: next.toString() } };
          }
          return current;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (forgotCooldown <= 0) return;
    const interval = setInterval(() => {
      setForgotCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [forgotCooldown]);


  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutTimer > 0) return;
    setErrorKey(null);

    const emailErr = validateField("loginEmail", loginEmail);
    const passErr = validateField("loginPassword", loginPassword);
    setTouched({ loginEmail: true, loginPassword: true });

    if (emailErr || passErr) return;

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 429 || data.locked_until) {
          const sec = (data.locked_until || 30).toString();
          setLockoutTimer(parseInt(sec, 10));
          setErrorKey({ key: "auth.account_locked", params: { seconds: sec } });
          return;
        }
        if (data.count >= 5) {
          setLockoutTimer(30);
          setErrorKey({ key: "auth.account_locked", params: { seconds: "30" } });
        } else if (data.count > 0) {
          const remaining = (5 - data.count).toString();
          setErrorKey({ key: "auth.invalid_credentials_remaining", params: { count: remaining } });
        } else {
          setErrorKey({ key: "auth.invalid_credentials" });
        }
        return;
      }



      if (data.user && !data.user.is_email_verified) {
        setAccessToken(data.access_token || "");
        setDevOtpCode(data.otp_code || "");
        setVerificationToken(data.verification_token || "");
        setMode("verify");
        return;
      }

      await showAlert({
        title: t("auth.login_success"),
        text: t("auth.login_success_desc"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/projects/recent");
    } catch (err: any) {
      setErrorKey({ key: "auth.invalid_credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);

    const fnameErr = validateField("firstname", firstname);
    const emailErr = validateField("regEmail", regEmail);
    const passErr = validateField("regPassword", regPassword);
    setTouched({ firstname: true, regEmail: true, regPassword: true });

    if (fnameErr || emailErr || passErr) return;

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          firstname,
          lastname,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.error && data.error.includes("Email already exists")) {
          setErrorKey({ key: "auth.email_exists" });
        } else {
          setErrorKey({ key: "auth.invalid_credentials" });
        }
        return;
      }



      setAccessToken(data.access_token || "");
      setDevOtpCode(data.otp_code || "");
      setVerificationToken(data.verification_token || "");
      setLoginEmail(regEmail);

      await showAlert({
        title: t("auth.register_success"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setMode("verify");
    } catch (err: any) {
      setErrorKey({ key: "auth.invalid_credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) return;
    setLoading(true);
    setErrorKey(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`${apiUrl}/api/auth/verify-otp`, {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({ otp_code: otpCode }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed");
      }

      await showAlert({
        title: t("auth.verification_success"),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/projects/recent");
    } catch (err: any) {
      setErrorKey({ key: "auth.invalid_credentials" });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      const headers: Record<string, string> = {};
      if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
      const res = await fetch(`${apiUrl}/api/auth/resend-otp`, {
        method: "POST",
        headers,
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        setDevOtpCode(data.otp_code || "");
        setVerificationToken(data.verification_token || "");
        setResendTimer(60);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotCooldown > 0) return;
    if (!forgotEmail.trim()) {
      validateField("loginEmail", forgotEmail);
      return;
    }

    setLoading(true);
    setErrorKey(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        await showAlert({
          title: "คำขอถูกระงับชั่วคราว",
          text: data.error || "ขอรีเซ็ตรหัสผ่านเกินโควต้า",
          icon: "warning",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      setHasSentForgotOnce(true);
      setForgotCooldown(60); // 60s cooldown

      await showAlert({
        title: "ส่งลิงก์เรียบร้อยแล้ว",
        text: data.message || "หากอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว (สามารถส่งซ้ำได้ในอีก 60 วินาที)",
        icon: "success",
        confirmButtonText: "ตกลง",
      });
    } catch (err: any) {
      setErrorKey({ key: "auth.invalid_credentials" });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 ${isDark ? "bg-[#0d0f17] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
    >
      {/* Absolute Top Left Back Button */}
      <div className="absolute top-6 left-6">
        <Link
          href="/"
          className={`h-9 inline-flex items-center gap-2 px-3.5 rounded-xl border text-xs font-semibold transition-all ${isDark
              ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
              : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
            }`}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("common.back_home") !== "common.back_home" ? t("common.back_home") : (language === "th" ? "กลับสู่หน้าหลัก" : "Back to Home")}</span>
        </Link>
      </div>

      {/* Absolute Top Control Bar */}
      <div className="absolute top-6 right-6 flex items-center gap-3">
        {mounted && (
          <>
            <button
              onClick={toggleLanguage}
              className={`h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl border text-xs font-semibold transition-all ${isDark
                  ? "bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                }`}
              title="Switch Language"
            >
              <Globe className="h-4 w-4" />
              <span>{language.toUpperCase()}</span>
            </button>

            <AnimatedThemeToggler
              theme={theme}
              onThemeChange={() => toggleTheme()}
              variant="circle"
              duration={500}
              className={`w-9 h-9 inline-flex items-center justify-center rounded-xl border transition-all ${isDark
                  ? "bg-slate-900 text-amber-400 border-slate-800 hover:bg-slate-800"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 shadow-sm"
                }`}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
            />
          </>
        )}
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header (Hidden when mode === 'verify' to prevent duplicate containers) */}
        {mode !== "verify" && (
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center justify-center gap-3 mb-3 group">
              <div className="h-12 w-12 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105">
                <LayoutDashboard className="h-6 w-6 text-slate-100" />
              </div>
            </Link>
            <h1
              key={mode}
              className={`text-2xl font-extrabold tracking-tight animate-title-slide ${isDark ? "text-slate-50" : "text-slate-900"}`}
            >
              {mode === "login"
                ? t("auth.welcome_back")
                : mode === "forgot"
                  ? "ลืมรหัสผ่านใช่ไหม?"
                  : t("auth.create_account")}
            </h1>
            <p
              key={`${mode}-sub`}
              className={`text-xs mt-1.5 animate-title-slide ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              {mode === "login"
                ? t("auth.login_subtitle")
                : mode === "forgot"
                  ? "ระบุอีเมลของคุณเพื่อรับลิงก์รีเซ็ตรหัสผ่าน"
                  : t("auth.register_subtitle")}
            </p>
          </div>
        )}

        {/* Tab Switcher with Sliding Pill Animation (Only shown when not verifying or forgot) */}
        {mode !== "verify" && mode !== "forgot" && (
          <div className={`relative p-1 rounded-2xl border flex mb-6 transition-colors duration-300 ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-200/60 border-slate-200"}`}>
            {/* Animated Sliding Background Indicator */}
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out shadow-sm ${
                isDark ? "bg-slate-800 border border-slate-700" : "bg-slate-900 border border-slate-900"
              }`}
              style={{
                transform: mode === "login" ? "translateX(0%)" : "translateX(100%)"
              }}
            />
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                mode === "login"
                  ? "text-white"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("common.sign_in")}
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                mode === "register"
                  ? "text-white"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("common.sign_up")}
            </button>
          </div>
        )}

        {/* Auth Card */}
        <div
          className={`p-8 rounded-2xl border shadow-xl transition-all duration-300 ${
            isDark
              ? "bg-[#131625] border-slate-800/90 shadow-slate-950/20"
              : "bg-white border-slate-200/80 shadow-slate-200/50"
          }`}
        >

          {mode !== "verify" && (
            <>
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
                  className={`absolute px-3 text-[10px] uppercase font-semibold tracking-wider transition-colors duration-300 ${isDark ? "bg-[#131625] text-slate-500" : "bg-white text-slate-400"
                    }`}
                >
                  {t("auth.or_with_email")}
                </span>
              </div>
            </>
          )}

          {/* Form Switcher */}
          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {t("auth.email_address")}
                </label>
                <div className="relative">
                  <Mail className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.loginEmail ? "text-rose-500" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    value={loginEmail}
                    onBlur={() => handleBlur("loginEmail", loginEmail)}
                    onChange={(e) => handleChange("loginEmail", e.target.value, setLoginEmail)}
                    placeholder={t("auth.email_placeholder")}
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
                      fieldErrors.loginEmail
                        ? isDark
                          ? "bg-slate-900/80 border-2 border-rose-500 text-slate-200"
                          : "bg-slate-50 border-2 border-rose-500 text-slate-900"
                        : isDark
                          ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                          : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                    }`}
                  />
                  {fieldErrors.loginEmail && (
                    <p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
                      {fieldErrors.loginEmail}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {t("auth.password")}
                </label>
                <div className="relative">
                  <Lock className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.loginPassword ? "text-rose-500" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type={showLoginPassword ? "text" : "password"}
                    value={loginPassword}
                    onBlur={() => handleBlur("loginPassword", loginPassword)}
                    onChange={(e) => handleChange("loginPassword", e.target.value, setLoginPassword)}
                    placeholder={t("auth.password_placeholder")}
                    className={`w-full rounded-xl text-xs pl-9 pr-10 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
                      fieldErrors.loginPassword
                        ? isDark
                          ? "bg-slate-900/80 border-2 border-rose-500 text-slate-200"
                          : "bg-slate-50 border-2 border-rose-500 text-slate-900"
                        : isDark
                          ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                          : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                    }`}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className={`absolute right-3 top-3 transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                  >
                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {fieldErrors.loginPassword && (
                    <p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
                      {fieldErrors.loginPassword}
                    </p>
                  )}
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => switchMode("forgot")}
                    className="text-[11px] font-medium text-blue-400 hover:underline cursor-pointer"
                  >
                    {t("auth.forgot_password")}
                  </button>
                </div>
              </div>

              {errorKey && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold whitespace-pre-line leading-relaxed">
                  {(() => {
                    let text = t(errorKey.key);
                    if (errorKey.params) {
                      Object.entries(errorKey.params).forEach(([k, v]) => {
                        text = text.replace(`{${k}}`, v);
                      });
                    }
                    return text;
                  })()}
                </div>
              )}

              <button
                type="submit"
                disabled={lockoutTimer > 0 || loading}
                className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border shadow-md transition-all mt-4 ${
                  lockoutTimer > 0
                    ? "bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
                    : isDark
                      ? "bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700"
                      : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                }`}
              >
                <span>{lockoutTimer > 0 ? t("auth.account_locked_btn").replace("{seconds}", lockoutTimer.toString()) : t("common.sign_in")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          ) : mode === "forgot" ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-5" noValidate>
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  {t("auth.email_address")}
                </label>
                <div className="relative">
                  <Mail className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.loginEmail ? "text-rose-500" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder={t("auth.email_placeholder")}
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 outline-none transition-colors ${
                      isDark
                        ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                        : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !forgotEmail.trim() || forgotCooldown > 0}
                className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border shadow-md transition-all mt-4 ${
                  forgotCooldown > 0
                    ? "bg-slate-700 text-slate-300 border-slate-600 cursor-not-allowed"
                    : isDark
                      ? "bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700"
                      : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                } disabled:opacity-50 cursor-pointer`}
              >
                <span>
                  {loading
                    ? "กำลังส่งลิงก์..."
                    : forgotCooldown > 0
                      ? `ส่งอีกครั้งใน (${forgotCooldown}s)`
                      : hasSentForgotOnce
                        ? "ส่งลิงก์รีเซ็ตรหัสผ่านอีกครั้ง"
                        : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>

            </form>
          ) : mode === "verify" ? (
            <EmailVerificationCard
              email={loginEmail || regEmail}
              devOtpCode={devOtpCode}
              verificationToken={verificationToken}
              otpCode={otpCode}
              setOtpCode={setOtpCode}
              resendTimer={resendTimer}
              loading={loading}
              onVerifyOtp={handleVerifyOTP}
              onResendOtp={handleResendOTP}
              onBackToLogin={() => switchMode("login")}
            />
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-2 gap-3 animate-smart-appear overflow-hidden">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {t("auth.firstname")}
                  </label>
                  <div className="relative">
                    <User className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.firstname ? "text-rose-500" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={firstname}
                      onBlur={() => handleBlur("firstname", firstname)}
                      onChange={(e) => handleChange("firstname", e.target.value, setFirstname)}
                      placeholder={t("auth.firstname_placeholder")}
                      className={`w-full rounded-xl text-xs pl-9 pr-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
                        fieldErrors.firstname
                          ? isDark
                            ? "bg-slate-900/80 border-2 border-rose-500 text-slate-200"
                            : "bg-slate-50 border-2 border-rose-500 text-slate-900"
                          : isDark
                            ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                            : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                      }`}
                    />
                    {fieldErrors.firstname && (
                      <p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
                        {fieldErrors.firstname}
                      </p>
                    )}
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
                    placeholder={t("auth.lastname_placeholder")}
                    className={`w-full rounded-xl text-xs px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${isDark
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
                  <Mail className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.regEmail ? "text-rose-500" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    value={regEmail}
                    onBlur={() => handleBlur("regEmail", regEmail)}
                    onChange={(e) => handleChange("regEmail", e.target.value, setRegEmail)}
                    placeholder={t("auth.email_placeholder")}
                    className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
                      fieldErrors.regEmail
                        ? isDark
                          ? "bg-slate-900/80 border-2 border-rose-500 text-slate-200"
                          : "bg-slate-50 border-2 border-rose-500 text-slate-900"
                        : isDark
                          ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                          : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                    }`}
                  />
                  {fieldErrors.regEmail && (
                    <p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
                      {fieldErrors.regEmail}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <div className="relative mb-1.5 h-4 flex items-center justify-between">
                  <label className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {t("auth.password")}
                  </label>
                  {regPassword && (
                    <span className="absolute right-0 top-0 text-[10px] font-semibold text-slate-400 pointer-events-none whitespace-nowrap">
                      {getPasswordStrength(regPassword).percent}% {getPasswordStrength(regPassword).label && `(${getPasswordStrength(regPassword).label})`}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Lock className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.regPassword ? "text-rose-500" : isDark ? "text-slate-500" : "text-slate-400"}`} />
                  <input
                    type={showRegPassword ? "text" : "password"}
                    value={regPassword}
                    onBlur={() => handleBlur("regPassword", regPassword)}
                    onChange={(e) => handleChange("regPassword", e.target.value, setRegPassword)}
                    placeholder={t("auth.password_placeholder")}
                    className={`w-full rounded-xl text-xs pl-9 ${
                      getPasswordStrength(regPassword).isValid ? "pr-16" : "pr-10"
                    } py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
                      fieldErrors.regPassword
                        ? isDark
                          ? "bg-slate-900/80 border-2 border-rose-500 text-slate-200"
                          : "bg-slate-50 border-2 border-rose-500 text-slate-900"
                        : getPasswordStrength(regPassword).isValid
                          ? isDark
                            ? "bg-slate-900/80 border-2 border-emerald-500 text-slate-200"
                            : "bg-slate-50 border-2 border-emerald-500 text-slate-900"
                          : isDark
                            ? "bg-slate-900/80 border border-slate-800 focus:border-slate-600 text-slate-200"
                            : "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900"
                    }`}
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    {getPasswordStrength(regPassword).isValid && (
                      <div className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className={`transition-colors ${isDark ? "text-slate-500 hover:text-slate-300" : "text-slate-400 hover:text-slate-600"}`}
                    >
                      {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.regPassword && (
                    <p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
                      {fieldErrors.regPassword}
                    </p>
                  )}
                </div>
                <div className="h-2.5 mt-5 flex items-center">
                  {regPassword && (
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden transition-all">
                      <div
                        className={`h-full ${getPasswordStrength(regPassword).color} transition-all duration-300`}
                        style={{ width: `${getPasswordStrength(regPassword).percent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {errorKey && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold whitespace-pre-line leading-relaxed">
                  {(() => {
                    let text = t(errorKey.key);
                    if (errorKey.params) {
                      Object.entries(errorKey.params).forEach(([k, v]) => {
                        text = text.replace(`{${k}}`, v);
                      });
                    }
                    return text;
                  })()}
                </div>
              )}

              <button
                type="submit"
                className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border shadow-md transition-all mt-4 ${
                  isDark
                    ? "bg-slate-800 hover:bg-slate-700/80 text-white border-slate-700"
                    : "bg-slate-900 hover:bg-slate-800 text-white border-slate-900"
                }`}
              >
                <span>{t("auth.create_account")}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Toggle Helper Footer Link */}
          <p className={`text-center text-xs mt-6 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {mode === "verify" || mode === "forgot" ? (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold text-blue-400 hover:underline cursor-pointer"
              >
                ← {language === "th" ? "กลับไปหน้าเข้าสู่ระบบ" : "Back to Sign In"}
              </button>
            ) : mode === "login" ? (
              <>
                {t("auth.dont_have_account")}{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
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
                  onClick={() => switchMode("login")}
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
    <Suspense fallback={<div className="min-h-screen bg-[#0d0f17] flex items-center justify-center"><div className="w-10 h-10 border-4 border-slate-800 border-t-slate-200 rounded-full animate-spin"></div></div>}>
      <UnifiedAuthForm />
    </Suspense>
  );
}
