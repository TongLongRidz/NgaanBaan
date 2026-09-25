"use client";

import React from "react";
import { Task } from "@/types/project";
import { X } from "lucide-react";

interface TaskDetailModalProps {
  task: Task;
  onClose: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
}

export function TaskDetailModal({ task, onClose, onToggleSubtask }: TaskDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6 animate-scale-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--input-bg)]"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">{task.title}</h2>
          {task.description && (
            <p className="text-xs text-[var(--muted-foreground)] mt-2 leading-relaxed">{task.description}</p>
          )}
        </div>

        {/* Subtasks */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">Subtasks</h4>
            <div className="space-y-1.5">
              {task.subtasks.map((st) => (
                <label
                  key={st.id}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--input-bg)] border border-[var(--card-border)] text-xs cursor-pointer hover:bg-[var(--card-bg)]"
                >
                  <input
                    type="checkbox"
                    checked={st.is_completed}
                    onChange={() => onToggleSubtask(task.id, st.id)}
                    className="rounded border-[var(--card-border)] text-indigo-600 focus:ring-indigo-500"
                  />
                  <span
                    className={
                      st.is_completed ? "line-through text-[var(--muted-foreground)]" : "text-[var(--foreground)]"
                    }
                  >
                    {st.title}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
