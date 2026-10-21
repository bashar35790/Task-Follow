"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Loader2, Pencil, Trash2, CalendarDays } from "lucide-react";
import { Task } from "../types/task";
import { formatDate, isOverdue } from "../lib/format";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

interface TaskCardProps {
  task: Task;
  onToggle: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onEdit, onDelete }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const completed = task.status === "completed";
  const overdue = isOverdue(task.dueDate, task.status);

  const handleToggle = async () => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      await onToggle(task);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <article
      className={`group animate-fade-in rounded-xl border bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${
        overdue ? "card-overdue border-rose-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button
          type="button"
          onClick={handleToggle}
          disabled={isToggling}
          aria-label={completed ? `Mark "${task.title}" as pending` : `Mark "${task.title}" as completed`}
          aria-pressed={completed}
          className="mt-0.5 shrink-0 rounded-full text-slate-300 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
        >
          {isToggling ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          ) : completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`text-sm sm:text-base font-semibold break-words ${
                completed ? "task-title-completed" : "text-slate-900"
              }`}
            >
              {task.title}
            </h3>

            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>
          </div>

          {task.description && (
            <div className="mt-1.5">
              <p
                className={`text-sm text-slate-600 whitespace-pre-wrap break-words ${
                  showDescription ? "" : "line-clamp-2"
                }`}
              >
                {task.description}
              </p>
              {task.description.length > 120 && (
                <button
                  type="button"
                  onClick={() => setShowDescription((prev) => !prev)}
                  className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:underline"
                >
                  {showDescription ? "Show less" : "Show more"}
                </button>
              )}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Created {formatDate(task.createdAt)}
            </span>
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  overdue ? "text-rose-600" : "text-slate-500"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" />
                Due {formatDate(task.dueDate)}
                {overdue && (
                  <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-semibold uppercase tracking-wide text-[10px]">
                    Overdue
                  </span>
                )}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 sm:hidden">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit "${task.title}"`}
            title="Edit task"
            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete "${task.title}"`}
            title="Delete task"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};
