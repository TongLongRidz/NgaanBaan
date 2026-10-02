"use client";

import {
	ArrowLeft,
	ArrowRight,
	Check,
	Eye,
	EyeOff,
	Globe,
	LayoutDashboard,
	Lock,
	Mail,
	Moon,
	Sun,
	User,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { Suspense, useEffect, useState } from "react";
import { EmailVerificationCard } from "@/components/ui/email/VerificationCard";
import { showAlert } from "@/components/ui/notification/sweetalert/sweetalert";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

function getInitialAuthMode(): "login" | "register" | "verify" | "forgot" {
	if (typeof window !== "undefined") {
		const sessionMode = sessionStorage.getItem("auth_mode");
		const urlParams = new URLSearchParams(window.location.search);
		const target = urlParams.get("mode") || sessionMode;
		if (target === "register") {
			return "register";
		}
	}
	return "login";
}

function UnifiedAuthForm() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const { theme, toggleTheme } = useTheme();
	const { language, toggleLanguage, t } = useLanguage();
	const [mounted, setMounted] = useState(false);
	const isDark = theme === "dark";

	useEffect(() => {
		setMounted(true);
	}, []);

	// Form states
	const [mode, setMode] = useState<"login" | "register" | "verify" | "forgot">(
		getInitialAuthMode,
	);

	useEffect(() => {
		if (typeof window !== "undefined") {
			const sessionMode = sessionStorage.getItem("auth_mode");
			const urlParams = new URLSearchParams(window.location.search);
			const targetMode = urlParams.get("mode") || sessionMode;

			if (targetMode === "register") {
				setMode("register");
			} else if (targetMode === "login") {
				setMode("login");
			}

			if (sessionMode) {
				sessionStorage.removeItem("auth_mode");
			}
			if (urlParams.has("mode")) {
				window.history.replaceState(null, "", window.location.pathname);
			}
		}
	}, []);
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

	// Auto verify if token query param exists or redirect to /home if already logged in
	useEffect(() => {
		const checkLoggedIn = async () => {
			try {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				
				// Try fetching user session
				let res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
				
				// If 401, attempt refreshing session token
				if (!res.ok) {
					const refreshRes = await fetch(`${apiUrl}/api/auth/refresh`, {
						method: "POST",
						credentials: "include",
					});
					if (refreshRes.ok) {
						res = await fetch(`${apiUrl}/api/auth/me`, { credentials: "include" });
					}
				}

				if (res.ok) {
					const userData = await res.json();
					// Get user object if response has user wrapper or is direct user object
					const userObj = userData.user || userData;
					if (userObj && userObj.is_email_verified) {
						router.replace("/home");
						return;
					}
				}
			} catch (_) {}
		};

		const tokenParam = searchParams.get("token");
		if (tokenParam) {
			handleVerifyByTokenParam(tokenParam);
		} else {
			checkLoggedIn();
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
			router.push("/home");
		} catch (err: any) {
			setErrorMsg(err.message || "Verification failed");
		} finally {
			setLoading(false);
		}
	};

	// Password strength calculator
	const getPasswordStrength = (pass: string) => {
		if (!pass)
			return {
				score: 0,
				percent: 0,
				label: "",
				color: "bg-slate-300",
				isValid: false,
			};
		let score = 0;
		if (pass.length >= 8) score += 25;
		if (/[A-Z]/.test(pass) || /[a-z]/.test(pass)) score += 25;
		if (/[0-9]/.test(pass)) score += 25;
		if (/[^A-Za-z0-9]/.test(pass)) score += 25;

		let label = "";
		let color = "bg-rose-500";
		if (score <= 25) {
			label = t("auth.strength_very_weak");
			color = "bg-rose-500";
		} else if (score <= 50) {
			label = t("auth.strength_medium");
			color = "bg-amber-500";
		} else if (score <= 75) {
			label = t("auth.strength_good");
			color = "bg-emerald-400";
		} else {
			label = t("auth.strength_strong");
			color = "bg-emerald-500";
		}

		const isValid = pass.length >= 8;
		return { score, percent: score, label, color, isValid };
	};

	// Real-time Validation helper
	const validateField = (name: string, value: string) => {
		let err = "";
		if (name === "loginEmail" || name === "forgotEmail") {
			const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
			if (!value.trim()) {
				err = t("auth.email_required");
			} else if (!emailRegex.test(value.trim()) || value.includes("..")) {
				err = t("auth.email_missing_at");
			}
		} else if (name === "regEmail") {
			const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
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
		} else if (name === "lastname") {
			if (!value.trim()) {
				err = t("auth.lastname_required");
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

	const handleChange = (
		name: string,
		value: string,
		setter: (val: string) => void,
	) => {
		setter(value);
		if (touched[name]) {
			validateField(name, value);
		}
	};

	const [errorKey, setErrorKey] = useState<{
		key: string;
		params?: Record<string, string>;
	} | null>(null);
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
					setErrorKey({
						key: "auth.account_locked",
						params: { seconds: "30" },
					});
				} else if (data.count > 0) {
					const remaining = (5 - data.count).toString();
					setErrorKey({
						key: "auth.invalid_credentials_remaining",
						params: { count: remaining },
					});
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

			router.push("/home");
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
		const lnameErr = validateField("lastname", lastname);
		const emailErr = validateField("regEmail", regEmail);
		const passErr = validateField("regPassword", regPassword);
		setTouched({
			firstname: true,
			lastname: true,
			regEmail: true,
			regPassword: true,
		});

		if (fnameErr || lnameErr || emailErr || passErr) return;

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

			const headers: Record<string, string> = {
				"Content-Type": "application/json",
			};
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

			router.push("/home");
		} catch (err: any) {
			setErrorKey({ key: "auth.invalid_credentials" });
		} finally {
			setLoading(false);
		}
	};

	const handleBypassVerification = async () => {
		setLoading(true);
		try {
			// If we have devOtpCode, use it directly to verify
			let codeToUse = devOtpCode;
			if (!codeToUse) {
				// Otherwise fetch a fresh OTP from resend endpoint
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				const headers: Record<string, string> = {};
				if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
				const res = await fetch(`${apiUrl}/api/auth/resend-otp`, {
					method: "POST",
					headers,
					credentials: "include",
				});
				const data = await res.json();
				codeToUse = data.otp_code;
			}

			if (codeToUse) {
				const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				const headers: Record<string, string> = { "Content-Type": "application/json" };
				if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;
				const res = await fetch(`${apiUrl}/api/auth/verify-otp`, {
					method: "POST",
					headers,
					credentials: "include",
					body: JSON.stringify({ otp_code: codeToUse }),
				});
				if (res.ok) {
					await showAlert({
						title: "Dev Bypass: ยืนยันอีเมลเรียบร้อยแล้ว!",
						icon: "success",
						timer: 1200,
						showConfirmButton: false,
					});
					router.push("/home");
					return;
				}
			}

			// Fallback: If verification request failed or no code, navigate to home directly if session exists
			router.push("/home");
		} catch (err: any) {
			router.push("/home");
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

		const emailErr = validateField("forgotEmail", forgotEmail);
		setTouched((prev) => ({ ...prev, forgotEmail: true }));
		if (emailErr) return;

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
				text:
					data.message ||
					"หากอีเมลนี้อยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณเรียบร้อยแล้ว (สามารถส่งซ้ำได้ในอีก 60 วินาที)",
				icon: "success",
				showConfirmButton: false,
				timer: 3500,
				timerProgressBar: true,
			});
		} catch (err: any) {
			setErrorKey({ key: "auth.invalid_credentials" });
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
			{/* Absolute Top Left Back Button */}
			<div className="absolute top-6 left-6">
				<Link
					href="/"
					className="h-9 inline-flex items-center gap-2 px-3.5 rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
				>
					<ArrowLeft className="h-4 w-4" />
					<span>{t("common.back_home")}</span>
				</Link>
			</div>

			{/* Absolute Top Control Bar */}
			<div className="absolute top-6 right-6 flex items-center gap-3">
				{mounted && (
					<>
						<button
							onClick={toggleLanguage}
							className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl border text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
							title="Switch Language"
						>
							<Globe className="h-4 w-4 text-slate-400" />
							<span>{language.toUpperCase()}</span>
						</button>

						<button
							onClick={(e) => toggleTheme(e)}
							className="w-9 h-9 inline-flex items-center justify-center rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--card-border)] hover:bg-[var(--input-bg)] shadow-xs"
							title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
						>
							{isDark ? (
								<Sun className="h-4 w-4 text-amber-400" />
							) : (
								<Moon className="h-4 w-4 text-slate-700 dark:text-amber-400" />
							)}
						</button>
					</>
				)}
			</div>

			<div className="w-full max-w-md">
				{/* Brand Header (Hidden when mode === 'verify' to prevent duplicate containers) */}
				{mode !== "verify" && (
					<div className="text-center mb-6">
						<Link
							href="/"
							className="inline-flex items-center justify-center gap-3 mb-3 group"
						>
							<div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-700 flex items-center justify-center shadow-xl transition-transform group-hover:scale-105">
								<LayoutDashboard className="h-6 w-6 text-slate-800 dark:text-slate-100" />
							</div>
						</Link>
						<h1
							key={mode}
							className="text-2xl font-extrabold tracking-tight animate-title-slide text-slate-900 dark:text-slate-50"
						>
							{mode === "login"
								? t("auth.welcome_back")
								: mode === "forgot"
									? "ลืมรหัสผ่านใช่ไหม?"
									: t("auth.create_account")}
						</h1>
						<p
							key={`${mode}-sub`}
							className="text-xs mt-1.5 animate-title-slide text-slate-500 dark:text-slate-400"
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
					<div className="relative p-1 rounded-2xl border flex mb-6 bg-slate-200/60 border-slate-200 dark:bg-slate-900/80 dark:border-slate-800">
						{/* Animated Sliding Background Indicator */}
						<div
							className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl transition-all duration-300 ease-out shadow-xs bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700"
							style={{
								transform:
									mode === "login" ? "translateX(0%)" : "translateX(100%)",
							}}
						/>
						<button
							type="button"
							onClick={() => switchMode("login")}
							className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
								mode === "login"
									? "text-slate-900 dark:text-white"
									: "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
							}`}
						>
							{t("common.sign_in")}
						</button>
						<button
							type="button"
							onClick={() => switchMode("register")}
							className={`relative z-10 flex-1 py-2.5 rounded-xl text-xs font-bold transition-colors ${
								mode === "register"
									? "text-slate-900 dark:text-white"
									: "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
							}`}
						>
							{t("common.sign_up")}
						</button>
					</div>
				)}

				{/* Auth Card */}
				<div className="p-8 rounded-2xl border shadow-xl transition-all bg-white border-slate-200/80 shadow-slate-200/50 dark:bg-[#131625] dark:border-slate-800/90 dark:shadow-slate-950/20">
					{mode !== "verify" && (
						<>
							{/* Google OAuth Login Button */}
							<button
								type="button"
								className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border font-semibold text-xs transition-all mb-6 bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700 dark:bg-slate-900/90 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-200"
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
								<div className="w-full border-t border-slate-200 dark:border-slate-800" />
								<span className="absolute px-3 text-[10px] uppercase font-semibold tracking-wider transition-colors duration-300 bg-white text-slate-400 dark:bg-[#131625] dark:text-slate-500">
									{t("auth.or_with_email")}
								</span>
							</div>
						</>
					)}

					{/* Form Switcher */}
					{mode === "login" || mode === "register" ? (
						<form
							onSubmit={
								mode === "register" ? handleRegisterSubmit : handleLoginSubmit
							}
							className="space-y-5"
							noValidate
						>
							{/* Firstname & Lastname Accordion Container */}
							<div
								className={`grid transition-all duration-300 ease-in-out ${
									mode === "register"
										? "grid-rows-[1fr] opacity-100"
										: "grid-rows-[0fr] opacity-0 pointer-events-none"
								}`}
							>
								<div className="overflow-hidden">
									<div className="grid grid-cols-2 gap-3 pb-1">
										<div>
											<label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
												{t("auth.firstname")}
											</label>
											<div className="relative">
												<User
													className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.firstname ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}
												/>
												<input
													type="text"
													value={firstname}
													onBlur={() => handleBlur("firstname", firstname)}
													onChange={(e) =>
														handleChange(
															"firstname",
															e.target.value,
															setFirstname,
														)
													}
													placeholder={t("auth.firstname_placeholder")}
													className={`w-full rounded-xl text-xs pl-9 pr-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
														fieldErrors.firstname
															? "bg-slate-50 border border-rose-500 ring-1 ring-inset ring-rose-500 text-slate-900 dark:bg-slate-900/80 dark:text-slate-200"
															: "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:focus:border-slate-600 dark:text-slate-200"
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
											<label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
												{t("auth.lastname")}
											</label>
											<div className="relative">
												<input
													type="text"
													value={lastname}
													onChange={(e) =>
														handleChange(
															"lastname",
															e.target.value,
															setLastname,
														)
													}
													onBlur={(e) => handleBlur("lastname", e.target.value)}
													placeholder={t("auth.lastname_placeholder")}
													className={`w-full rounded-xl text-xs px-3 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
														fieldErrors.lastname
															? "bg-slate-50 border border-rose-500 ring-1 ring-inset ring-rose-500 text-slate-900 dark:bg-slate-900/80 dark:text-slate-200"
															: "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:focus:border-slate-600 dark:text-slate-200"
													}`}
												/>
												{fieldErrors.lastname && (
													<p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
														{fieldErrors.lastname}
													</p>
												)}
											</div>
										</div>
									</div>
								</div>
							</div>

							<div>
								<label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
									{t("auth.email_address")}
								</label>
								<div className="relative">
									<Mail
										className={`h-4 w-4 absolute left-3 top-3 ${(mode === "register" ? fieldErrors.regEmail : fieldErrors.loginEmail) ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}
									/>
									<input
										type="text"
										value={mode === "register" ? regEmail : loginEmail}
										onBlur={() =>
											handleBlur(
												mode === "register" ? "regEmail" : "loginEmail",
												mode === "register" ? regEmail : loginEmail,
											)
										}
										onChange={(e) => {
											if (mode === "register") {
												handleChange("regEmail", e.target.value, setRegEmail);
												setLoginEmail(e.target.value);
											} else {
												handleChange(
													"loginEmail",
													e.target.value,
													setLoginEmail,
												);
												setRegEmail(e.target.value);
											}
										}}
										placeholder={t("auth.email_placeholder")}
										className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
											(
												mode === "register"
													? fieldErrors.regEmail
													: fieldErrors.loginEmail
											)
												? "bg-slate-50 border border-rose-500 ring-1 ring-inset ring-rose-500 text-slate-900 dark:bg-slate-900/80 dark:text-slate-200"
												: "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:focus:border-slate-600 dark:text-slate-200"
										}`}
									/>
									{(mode === "register"
										? fieldErrors.regEmail
										: fieldErrors.loginEmail) && (
										<p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
											{mode === "register"
												? fieldErrors.regEmail
												: fieldErrors.loginEmail}
										</p>
									)}
								</div>
							</div>

							<div>
								<div className="relative mb-1.5 h-4 flex items-center justify-between">
									<label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
										{t("auth.password")}
									</label>
									{mode === "register" && regPassword && (
										<span className="absolute right-0 top-0 text-[10px] font-semibold text-slate-400 pointer-events-none whitespace-nowrap">
											{getPasswordStrength(regPassword).percent}%{" "}
											{getPasswordStrength(regPassword).label &&
												`(${getPasswordStrength(regPassword).label})`}
										</span>
									)}
								</div>
								<div className="relative">
									<Lock
										className={`h-4 w-4 absolute left-3 top-3 ${(mode === "register" ? fieldErrors.regPassword : fieldErrors.loginPassword) ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}
									/>
									<input
										type={
											(
												mode === "register"
													? showRegPassword
													: showLoginPassword
											)
												? "text"
												: "password"
										}
										value={mode === "register" ? regPassword : loginPassword}
										onBlur={() =>
											handleBlur(
												mode === "register" ? "regPassword" : "loginPassword",
												mode === "register" ? regPassword : loginPassword,
											)
										}
										onChange={(e) => {
											if (mode === "register") {
												handleChange(
													"regPassword",
													e.target.value,
													setRegPassword,
												);
												setLoginPassword(e.target.value);
											} else {
												handleChange(
													"loginPassword",
													e.target.value,
													setLoginPassword,
												);
												setRegPassword(e.target.value);
											}
										}}
										placeholder={t("auth.password_placeholder")}
										className={`w-full rounded-xl text-xs pl-9 ${
											mode === "register" &&
											getPasswordStrength(regPassword).isValid
												? "pr-16"
												: "pr-10"
										} py-2.5 outline-none focus:outline-none focus:ring-0 focus:ring-offset-0 transition-colors ${
											(
												mode === "register"
													? fieldErrors.regPassword
													: fieldErrors.loginPassword
											)
												? "bg-slate-50 border border-rose-500 ring-1 ring-inset ring-rose-500 text-slate-900 dark:bg-slate-900/80 dark:text-slate-200"
												: mode === "register" &&
														getPasswordStrength(regPassword).isValid
													? "bg-slate-50 border-2 border-emerald-500 text-slate-900 dark:bg-slate-900/80 dark:text-slate-200"
													: "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:focus:border-slate-600 dark:text-slate-200"
										}`}
									/>
									<div className="absolute right-3 top-3 flex items-center gap-1.5">
										{mode === "register" &&
											getPasswordStrength(regPassword).isValid && (
												<div className="flex items-center justify-center h-4 w-4 rounded-full bg-emerald-500 text-white">
													<Check className="h-3 w-3 stroke-[3]" />
												</div>
											)}
										<button
											type="button"
											tabIndex={-1}
											onClick={() => {
												if (mode === "register")
													setShowRegPassword(!showRegPassword);
												else setShowLoginPassword(!showLoginPassword);
											}}
											className="transition-colors text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
										>
											{(
												mode === "register"
													? showRegPassword
													: showLoginPassword
											) ? (
												<EyeOff className="h-4 w-4" />
											) : (
												<Eye className="h-4 w-4" />
											)}
										</button>
									</div>
									{(mode === "register"
										? fieldErrors.regPassword
										: fieldErrors.loginPassword) && (
										<p className="absolute left-0 -bottom-4 text-[10px] font-medium text-rose-500 whitespace-nowrap">
											{mode === "register"
												? fieldErrors.regPassword
												: fieldErrors.loginPassword}
										</p>
									)}
								</div>
								{mode === "login" && (
									<div className="flex justify-end mt-1.5">
										<button
											type="button"
											onClick={() => switchMode("forgot")}
											className="text-[11px] font-medium text-blue-400 hover:underline cursor-pointer"
										>
											{t("auth.forgot_password")}
										</button>
									</div>
								)}
								{mode === "register" && (
									<div className="h-2.5 mt-5 flex items-center">
										{regPassword && (
											<div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden transition-all">
												<div
													className={`h-full ${getPasswordStrength(regPassword).color} transition-all duration-300`}
													style={{
														width: `${getPasswordStrength(regPassword).percent}%`,
													}}
												/>
											</div>
										)}
									</div>
								)}
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
								disabled={(mode === "login" && lockoutTimer > 0) || loading}
								className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border shadow-md transition-all mt-4 ${
									mode === "login" && lockoutTimer > 0
										? "bg-slate-700 text-slate-400 border-slate-600 cursor-not-allowed"
										: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:border-slate-700"
								}`}
							>
								<span>
									{mode === "login"
										? lockoutTimer > 0
											? t("auth.account_locked_btn").replace(
													"{seconds}",
													lockoutTimer.toString(),
												)
											: t("common.sign_in")
										: t("auth.create_account_btn") || "สร้างบัญชีใหม่"}
								</span>
								<ArrowRight className="h-4 w-4" />
							</button>
						</form>
					) : mode === "forgot" ? (
						<form
							onSubmit={handleForgotPasswordSubmit}
							className="space-y-5"
							noValidate
						>
							<div>
								<label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
									{t("auth.email_address")}
								</label>
								<div className="relative">
									<Mail
										className={`h-4 w-4 absolute left-3 top-3 ${fieldErrors.forgotEmail ? "text-rose-500" : "text-slate-400 dark:text-slate-500"}`}
									/>
									<input
										type="text"
										value={forgotEmail}
										onChange={(e) =>
											handleChange(
												"forgotEmail",
												e.target.value,
												setForgotEmail,
											)
										}
										onBlur={() => handleBlur("forgotEmail", forgotEmail)}
										placeholder={t("auth.email_placeholder")}
										className={`w-full rounded-xl text-xs pl-9 pr-4 py-2.5 outline-none transition-colors ${
											fieldErrors.forgotEmail
												? "border-rose-500/80 bg-rose-500/5 focus:border-rose-500 text-rose-500"
												: "bg-slate-50 border border-slate-200 focus:border-slate-400 text-slate-900 dark:bg-slate-900/80 dark:border-slate-800 dark:focus:border-slate-600 dark:text-slate-200"
										}`}
									/>
								</div>
								{fieldErrors.forgotEmail && (
									<p className="text-[11px] text-rose-500 mt-1 font-medium flex items-center gap-1">
										{fieldErrors.forgotEmail}
									</p>
								)}
							</div>

							<button
								type="submit"
								disabled={loading || !forgotEmail.trim() || forgotCooldown > 0}
								className={`w-full flex items-center justify-center gap-2 text-xs font-bold py-2.5 rounded-xl border shadow-md transition-all mt-4 ${
									forgotCooldown > 0
										? "bg-slate-700 text-slate-300 border-slate-600 cursor-not-allowed"
										: "bg-slate-900 hover:bg-slate-800 text-white border-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700/80 dark:border-slate-700"
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
							onBypass={handleBypassVerification}
						/>
					) : null}

					{/* Toggle Helper Footer Link */}
					<p className="text-center text-xs mt-6 text-slate-500 dark:text-slate-400">
						{mode === "verify" || mode === "forgot" ? (
							<button
								type="button"
								onClick={() => switchMode("login")}
								className="font-semibold text-blue-400 hover:underline cursor-pointer"
							>
								← {t("auth.back_to_signin")}
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
		<Suspense fallback={null}>
			<UnifiedAuthForm />
		</Suspense>
	);
}
