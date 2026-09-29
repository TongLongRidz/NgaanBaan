"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { EmptyProjectState } from "@/components/ui/EmptyProjectState";
import { Users, Grid, FolderKanban } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  members_count: number;
  updated_at: string;
}

export default function MyProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await fetch(`${apiUrl}/api/projects`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch my projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <>
      <TopNavbar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8 flex flex-col min-h-[calc(100vh-64px)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 flex items-center justify-center shadow-xs">
              <FolderKanban className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-bold text-xl leading-none text-[var(--foreground)]">
                {t("nav.my_projects") || "My Projects"}
              </h2>
            </div>
          </div>
        </div>

        {/* Grid of projects */}
        {!loading && projects.length === 0 && (
          <EmptyProjectState
            title={t("empty.no_projects_found")}
            description={t("empty.create_to_get_started")}
            onProjectCreated={() => {
              window.location.reload();
            }}
          />
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0">
                      <Grid className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-blue-500 transition-colors mb-2">
                    {project.title}
                  </h3>

                  <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
                    {project.description || "No description"}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[var(--card-border)] text-xs text-[var(--muted-foreground)]">
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.members_count} members</span>
                  </div>
                  <span className="text-blue-500 font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
