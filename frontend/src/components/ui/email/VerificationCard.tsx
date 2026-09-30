"use client";

import {
	ArrowRight,
	Check,
	Copy,
	ExternalLink,
	Lock,
	MailCheck,
	RefreshCw,
	Send,
	ShieldCheck,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useTheme } from "@/hooks/useTheme";

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
	onBackToLogin?: () => void;
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
	const { theme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [hasSentInitial, setHasSentInitial] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const isDark = theme === "dark";

	const verifyLink =
		typeof window !== "undefined" && verificationToken
			? `${window.location.origin}/login?token=${verificationToken}`
			: `http://localhost:3000/login?token=${verificationToken || ""}`;

	return (
		<div className="w-full">
			{/* Top Header */}
			<div className="text-center mb-6">
				<div
					className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 border shadow-inner ${
						isDark
							? "bg-slate-800 text-slate-200 border-slate-700"
							: "bg-slate-100 text-slate-800 border-slate-200"
					}`}
				>
					<MailCheck className="w-7 h-7 stroke-[2.2]" />
				</div>
				<h2
					className={`text-2xl font-extrabold tracking-tight ${isDark ? "text-slate-50" : "text-slate-900"}`}
				>
					{t("auth.verify_email_title")}
				</h2>
				<p
					className={`text-xs mt-1.5 leading-relaxed px-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
				>
					{t("auth.verify_subtitle")}
				</p>
				<div
					className={`inline-block mt-2 font-semibold px-3 py-1 rounded-full text-xs border ${
						isDark
							? "bg-slate-800/80 text-slate-300 border-slate-700"
							: "bg-slate-100 text-slate-700 border-slate-200"
					}`}
				>
					{email || "your email"}
				</div>
			</div>

			{/* OTP Input Form - 6 Individual Digit Boxes */}
			<form onSubmit={onVerifyOtp} className="space-y-5">
				<div>
					<label
						className={`block text-xs font-bold uppercase tracking-wider text-center mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}
					>
						{t("auth.otp_placeholder")}
					</label>

					<div className="flex items-center justify-center gap-2 sm:gap-2.5 my-2">
						{Array.from({ length: 6 }).map((_, index) => {
							const char = otpCode[index] || "";
							return (
								<input
									key={index}
									id={`otp-input-${index}`}
									type="text"
									inputMode="numeric"
									pattern="[0-9]*"
									maxLength={1}
									value={char}
									autoFocus={index === 0}
									onChange={(e) => {
										const val = e.target.value.replace(/\D/g, "");
										if (!val) {
											// Clear digit
											const newCode =
												otpCode.substring(0, index) +
												otpCode.substring(index + 1);
											setOtpCode(newCode);
											return;
										}
										// If paste multiple numbers
										if (val.length > 1) {
											const digits = val.slice(0, 6);
											setOtpCode(digits);
											const nextIdx = Math.min(digits.length, 5);
											document.getElementById(`otp-input-${nextIdx}`)?.focus();
											return;
										}
										// Set single digit
										const codeArr = otpCode.split("");
										while (codeArr.length < 6) codeArr.push("");
										codeArr[index] = val;
										const nextCode = codeArr.join("").slice(0, 6);
										setOtpCode(nextCode);

										// Move to next box
										if (index < 5 && val) {
											document
												.getElementById(`otp-input-${index + 1}`)
												?.focus();
										}
									}}
									onKeyDown={(e) => {
										if (e.key === "Backspace") {
											if (!otpCode[index] && index > 0) {
												document
													.getElementById(`otp-input-${index - 1}`)
													?.focus();
											}
										} else if (e.key === "ArrowLeft" && index > 0) {
											document
												.getElementById(`otp-input-${index - 1}`)
												?.focus();
										} else if (e.key === "ArrowRight" && index < 5) {
											document
												.getElementById(`otp-input-${index + 1}`)
												?.focus();
										}
									}}
									onPaste={(e) => {
										e.preventDefault();
										const pastedData = e.clipboardData
											.getData("text")
											.replace(/\D/g, "")
											.slice(0, 6);
										if (pastedData) {
											setOtpCode(pastedData);
											const focusIndex = Math.min(pastedData.length, 5);
											document
												.getElementById(`otp-input-${focusIndex}`)
												?.focus();
										}
									}}
									className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl font-mono font-bold rounded-2xl border-2 transition-all outline-none shadow-sm ${
										char
											? isDark
												? "bg-slate-900 border-slate-500 text-slate-100 ring-2 ring-slate-500/20"
												: "bg-slate-50 border-slate-900 text-slate-900 ring-2 ring-slate-900/10"
											: isDark
												? "bg-slate-900/80 border-slate-800 text-slate-100 focus:border-slate-500 focus:ring-4 focus:ring-slate-500/15"
												: "bg-slate-50 border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-4 focus:ring-slate-400/15"
									}`}
								/>
							);
						})}
					</div>
				</div>

				<button
					type="submit"
					disabled={loading || otpCode.length < 6}
					className={`w-full py-2.5 px-4 font-bold rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 text-xs cursor-pointer ${
						isDark
							? "bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700"
							: "bg-slate-900 hover:bg-slate-800 text-white border border-slate-900"
					}`}
				>
					{loading ? (
						<span>{t("auth.verify_otp_btn")}</span>
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
					onClick={() => {
						setHasSentInitial(true);
						onResendOtp();
					}}
					disabled={resendTimer > 0 || loading}
					className={`text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed transition-colors inline-flex items-center space-x-1.5 py-1.5 px-3.5 rounded-xl cursor-pointer ${
						isDark
							? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
							: "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
					}`}
				>
					{!hasSentInitial ? (
						<Send className="w-3.5 h-3.5" />
					) : (
						<RefreshCw
							className={`w-3.5 h-3.5 ${resendTimer > 0 ? "" : "animate-bounce"}`}
						/>
					)}
					<span>
						{resendTimer > 0
							? t("auth.resend_otp_btn").replace(
									"{seconds}",
									resendTimer.toString(),
								)
							: t("auth.resend_otp_ready")}
					</span>
				</button>
			</div>
		</div>
	);
}
