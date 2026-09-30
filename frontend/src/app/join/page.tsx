"use client";

import {
	AlertCircle,
	ArrowRight,
	CheckCircle,
	Loader2,
	Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

function JoinPageContent() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const token = searchParams.get("token");

	const [loading, setLoading] = useState(true);
	const [joining, setJoining] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [inviteInfo, setInviteInfo] = useState<{
		project_id: string;
		project_name: string;
		role: string;
	} | null>(null);
	const [joinedSuccess, setJoinedSuccess] = useState(false);

	useEffect(() => {
		if (!token) {
			setError("No invitation token provided.");
			setLoading(false);
			return;
		}

		// Validate invite token publicly
		fetch(`http://localhost:8080/api/public/invitations/${token}`)
			.then(async (res) => {
				if (!res.ok) {
					const data = await res.json();
					throw new Error(data.error || "Invalid or expired invitation link.");
				}
				return res.json();
			})
			.then((data) => {
				setInviteInfo(data);
				setLoading(false);
			})
			.catch((err) => {
				setError(err.message);
				setLoading(false);
			});
	}, [token]);

	const handleJoin = async () => {
		if (!token) return;
		setJoining(true);
		setError(null);

		try {
			const res = await fetch(
				`http://localhost:8080/api/invitations/${token}/accept`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					credentials: "include",
				},
			);

			if (res.status === 401) {
				// Redirect to login if unauthenticated
				router.push(
					`/login?redirect=${encodeURIComponent(`/join?token=${token}`)}`,
				);
				return;
			}

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Failed to join project.");
			}

			const data = await res.json();
			setJoinedSuccess(true);
			setTimeout(() => {
				router.push(`/projects/${data.project_id}`);
			}, 1500);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setJoining(false);
		}
	};

	return (
		<div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
			<div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-8 shadow-2xl space-y-6 animate-scale-up text-center">
				<div className="h-16 w-16 mx-auto rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
					<Users className="h-8 w-8" />
				</div>

				{loading ? null : error ? (
					<div className="space-y-4">
						<div className="flex items-center justify-center gap-2 text-rose-400 font-semibold text-sm">
							<AlertCircle className="h-5 w-5" />
							<span>Invitation Error</span>
						</div>
						<p className="text-xs text-[var(--muted-foreground)]">{error}</p>
						<Link
							href="/dashboard"
							className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--card-border)] transition-all"
						>
							Go to Dashboard
						</Link>
					</div>
				) : joinedSuccess ? (
					<div className="space-y-4 py-2">
						<CheckCircle className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
						<h2 className="text-lg font-bold text-[var(--foreground)]">
							Welcome to the Team!
						</h2>
						<p className="text-xs text-[var(--muted-foreground)]">
							You have successfully joined{" "}
							<span className="font-semibold text-indigo-400">
								{inviteInfo?.project_name}
							</span>{" "}
							as {inviteInfo?.role}.
						</p>
						<p className="text-[11px] text-indigo-400">
							Redirecting to project...
						</p>
					</div>
				) : (
					<div className="space-y-6">
						<div className="space-y-2">
							<h2 className="text-xl font-bold text-[var(--foreground)]">
								Project Invitation
							</h2>
							<p className="text-xs text-[var(--muted-foreground)]">
								You have been invited to join{" "}
								<span className="font-semibold text-[var(--foreground)]">
									{inviteInfo?.project_name}
								</span>{" "}
								as an{" "}
								<span className="font-semibold text-indigo-400 capitalize">
									{inviteInfo?.role}
								</span>
								.
							</p>
						</div>

						<div className="p-4 rounded-xl bg-[var(--input-bg)] border border-[var(--card-border)] text-left space-y-1">
							<span className="text-[10px] font-bold tracking-wider text-[var(--muted-foreground)] uppercase">
								Role Permission
							</span>
							<p className="text-xs font-semibold text-[var(--foreground)] capitalize">
								{inviteInfo?.role} Mode
							</p>
							<p className="text-[11px] text-[var(--muted-foreground)]">
								{inviteInfo?.role === "editor"
									? "Can view, create, and edit tasks and columns."
									: "Can view project contents in read-only mode."}
							</p>
						</div>

						<button
							onClick={handleJoin}
							disabled={joining}
							className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
						>
							{joining ? (
								<span>Joining Project...</span>
							) : (
								<>
									<span>Accept Invitation & Join</span>
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default function JoinPage() {
	return (
		<Suspense fallback={<div className="min-h-screen bg-[var(--background)]" />}>
			<JoinPageContent />
		</Suspense>
	);
}
