"use client";

import React from "react";
import { SideNavbar } from "@/components/ui/SideNavbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex font-sans transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
      <SideNavbar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}
