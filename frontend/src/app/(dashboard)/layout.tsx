"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { SideNavbar } from "@/components/ui/SideNavbar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const [authorized, setAuthorized] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			try {
				const apiUrl =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
				const res = await fetch(`${apiUrl}/api/auth/me`, {
					credentials: "include",
				});

				if (!res.ok) {
					router.replace("/login");
					return;
				}

				const userData = await res.json();
				if (!userData.is_email_verified) {
					router.replace("/login");
					return;
				}

				setAuthorized(true);
			} catch (err) {
				console.error("Auth check failed:", err);
				router.replace("/login");
			}
		};

		checkAuth();
	}, [router]);

	if (!authorized) {
		return <div className="min-h-screen bg-[var(--background)]" />;
	}

	return (
		<div className="min-h-screen flex font-sans transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
			<SideNavbar />
			<div className="flex-1 flex flex-col min-w-0">{children}</div>
		</div>
	);
}
