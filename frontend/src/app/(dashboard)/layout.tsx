"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      const token = localStorage.getItem("user_session_id");

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        const res = await fetch(`${apiUrl}/api/auth/me`, {
          headers,
          credentials: "include",
        });

        if (!res.ok) {
          localStorage.removeItem("user_session_id");
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
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[var(--card-border)] border-t-[var(--foreground)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
      <SideNavbar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
