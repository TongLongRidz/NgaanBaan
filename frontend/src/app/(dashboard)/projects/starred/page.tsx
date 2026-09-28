"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/hooks/useLanguage";
import { TopNavbar } from "@/components/ui/TopNavbar";
import { Plus, Users, Grid, Star } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  members_count: number;
  updated_at: string;
}

export default function StarredProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStarred = async () => {
      try {
        const token = localStorage.getItem("user_session_id");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${apiUrl}/api/projects/starred`, {
          headers,
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setProjects(data);
        }
      } catch (err) {
        console.error("Failed to fetch starred projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStarred();
  }, []);

  return (
    <>
      <TopNavbar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center">
              <Star className="h-4 w-4 fill-amber-500/20" />
            </div>
            <div>
              <h2 className="font-bold text-xl leading-none text-[var(--foreground)]">
                {t("nav.starred") || "Starred Projects"}
              </h2>
            </div>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md transition-all">
            <Plus className="h-4 w-4" />
            <span>{t("boards.create_board") || "Create Project"}</span>
          </button>
        </div>

        {loading ? (
          <div className="text-xs text-[var(--muted-foreground)] p-4">Loading starred projects...</div>
        ) : projects.length === 0 ? (
          <div className="text-xs text-[var(--muted-foreground)] p-4">No starred projects yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0">
                      <Grid className="h-4 w-4" />
                    </div>
                    <span className="text-[10px] font-medium text-[var(--muted-foreground)] px-2.5 py-1 rounded-full bg-[var(--input-bg)] border border-[var(--card-border)]">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[var(--foreground)] group-hover:text-amber-400 transition-colors mb-2">
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
                  <span className="text-amber-400 font-semibold text-[11px] group-hover:translate-x-1 transition-transform">
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
