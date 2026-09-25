"use client";

import React from "react";
import { Column, Task } from "@/types/project";
import { CheckSquare, MessageSquare, Clock, Plus, MoreHorizontal } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface ProjectKanbanViewProps {
  columns: Column[];
  onSelectTask: (task: Task) => void;
}

export function ProjectKanbanView({ columns, onSelectTask }: ProjectKanbanViewProps) {
  const { t } = useLanguage();

  return (
    <main className="flex-1 p-6 md:p-8 overflow-x-auto animate-fade-in">
      <div className="flex gap-6 items-start min-w-[1000px] h-full pb-6">
        {columns.map((column) => (
          <div
            key={column.id}
            className="w-80 shrink-0 rounded-2xl bg-[var(--card-bg)] border border-[var(--card-border)] p-4 flex flex-col max-h-[calc(100vh-190px)] shadow-xs hover:border-[var(--card-border)] transition-all"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-4 px-1 pb-3 border-b border-[var(--card-border)]">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-[var(--foreground)] tracking-tight">{column.name}</h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[var(--input-bg)] text-[var(--muted-foreground)] border border-[var(--card-border)] tabular-nums">
                  {column.tasks.length}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
                  title="Add task to column"
                >
                  <Plus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--input-bg)] transition-colors"
                  title="Column options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {column.tasks.map((task) => {
                const completedCount = task.subtasks?.filter((s) => s.is_completed).length || 0;
                const totalSub = task.subtasks?.length || 0;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] hover:border-indigo-500/50 shadow-xs hover:shadow-md cursor-pointer transition-all duration-200 space-y-3 group"
                  >
                    {/* Tags / Labels */}
                    {task.labels && task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {task.labels.map((label, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                    )}

                    <h4 className="font-semibold text-xs text-[var(--foreground)] group-hover:text-indigo-400 transition-colors leading-snug">
                      {task.title}
                    </h4>

                    {task.description && (
                      <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--card-border)] text-[11px] text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-3">
                        {totalSub > 0 && (
                          <div className="flex items-center gap-1 font-medium">
                            <CheckSquare className="h-3.5 w-3.5 text-indigo-400" />
                            <span className="tabular-nums">
                              {completedCount}/{totalSub}
                            </span>
                          </div>
                        )}
                        {task.comments && task.comments.length > 0 && (
                          <div className="flex items-center gap-1 font-medium">
                            <MessageSquare className="h-3.5 w-3.5 text-amber-400" />
                            <span className="tabular-nums">{task.comments.length}</span>
                          </div>
                        )}
                      </div>

                      {task.due_date && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--input-bg)] border border-[var(--card-border)]">
                          <Clock className="h-3 w-3 text-indigo-400" />
                          <span className="tabular-nums">{task.due_date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Quick Add Task Button per Column */}
              <button
                type="button"
                className="w-full py-2.5 border border-dashed border-[var(--card-border)] hover:border-indigo-500/40 rounded-xl text-xs font-semibold text-[var(--muted-foreground)] hover:text-indigo-400 hover:bg-[var(--card-bg)] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t("kanban.add_task") || "Add Task"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
