"use client";

import { ArrowLeft, Eye, FileText, Lock, Shield } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Footer } from "@/components/ui/Footer";
import { LandingNavbar } from "@/components/ui/LandingNavbar";
import { useLanguage } from "@/hooks/useLanguage";

export default function PrivacyPolicyPage() {
	const { language, t } = useLanguage();

	return (
		<div className="min-h-screen flex flex-col font-sans transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
			<LandingNavbar />

			<main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 space-y-10">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all bg-[var(--card-bg)] border-[var(--card-border)] text-[var(--foreground)] hover:bg-[var(--input-bg)] shadow-xs"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					<span>{t("common.back_home")}</span>
				</Link>

				<div className="space-y-3">
					<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
						<Shield className="h-3.5 w-3.5" />
						<span>Privacy & Security</span>
					</div>
					<h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
						{t("common.privacy_policy")}
					</h1>
					<p className="text-xs text-[var(--muted-foreground)]">
						{t("terms.last_updated")}
					</p>
				</div>

				<div className="p-8 rounded-3xl border space-y-8 bg-[var(--card-bg)] border-[var(--card-border)] shadow-xs">
					<section className="space-y-3">
						<h2 className="text-base font-bold flex items-center gap-2">
							<Eye className="h-4 w-4 text-indigo-500" />
							<span>{t("privacy.sec1_title")}</span>
						</h2>
						<p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
							{t("privacy.sec1_desc")}
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-base font-bold flex items-center gap-2">
							<Lock className="h-4 w-4 text-emerald-500" />
							<span>{t("privacy.sec2_title")}</span>
						</h2>
						<p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
							{t("privacy.sec2_desc")}
						</p>
					</section>

					<section className="space-y-3">
						<h2 className="text-base font-bold flex items-center gap-2">
							<FileText className="h-4 w-4 text-purple-500" />
							<span>{t("privacy.sec3_title")}</span>
						</h2>
						<p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
							{t("privacy.sec3_desc")}
						</p>
					</section>
				</div>
			</main>

			<Footer />
		</div>
	);
}
