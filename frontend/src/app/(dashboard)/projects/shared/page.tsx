"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { Plus, Users, Grid } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  members_count: number;
  updated_at: string;
}

const SHARED_PROJECTS: Project[] = [
  {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
    title: "UI/UX Redesign Project",
    description: "Design system migration, glassmorphism components, and dark mode theme implementation.",
    members_count: 2,
    updated_at: "Updated 2 hours ago"
  }
];

export default function SharedProjectsPage() {
  const { t } = useLanguage();
  const [projects] = useState<Project[]>(SHARED_PROJECTS);

  return (
    <>
      <TopNavbar />

      <main className="flex-1 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <h2 className="font-bold text-xl leading-none text-[var(--foreground)]">
                  {t("nav.shared_with_me") || "Shared with me"}
                </h2>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                      <Grid className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
                      {project.updated_at}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-indigo-400 transition-colors mb-2">
                    {project.title}
                  </h3>

                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)] text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.members_count} members</span>
                  </div>
                  <span className="text-indigo-400 font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
    </>
  );
}
