"use client";

import React from "react";
import { CheckCircle2, ListTodo, Plus } from "lucide-react";

interface HeaderProps {
  totalCount: number;
  completedCount: number;
  onAddTask: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalCount,
  completedCount,
  onAddTask,
}) => {
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="w-full border-b border-slate-200 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/90">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ListTodo className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Task-Flow
              </h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                Acme AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Personal Task Management Dashboard
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>
              {completedCount} of {totalCount} completed ({percentage}%)
            </span>
          </div>

          <button
            onClick={onAddTask}
            className="btn-interactive inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm shadow-blue-600/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Create a new task"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>
    </header>
  );
};
