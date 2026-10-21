"use client";

import React from "react";
import { ClipboardList, Plus, SearchX } from "lucide-react";
import { Task } from "../types/task";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  isFiltered?: boolean;
  onToggle: (task: Task) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onAddTask: () => void;
}

const SkeletonCard: React.FC = () => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm animate-pulse">
    <div className="flex items-start gap-3.5">
      <div className="h-5 w-5 rounded-full bg-slate-200 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-3">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-3 w-1/3 rounded bg-slate-100" />
      </div>
      <div className="h-3 w-8 rounded bg-slate-200 shrink-0" />
    </div>
  </div>
);

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  isFiltered = false,
  onToggle,
  onEdit,
  onDelete,
  onAddTask,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading tasks...</span>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="animate-fade-in rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-14 text-center">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          {isFiltered ? (
            <SearchX className="h-6 w-6 text-blue-500" />
          ) : (
            <ClipboardList className="h-6 w-6 text-blue-500" />
          )}
        </div>
        <h2 className="mt-4 text-base font-semibold text-slate-900">
          {isFiltered ? "No matching tasks" : "No tasks yet"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {isFiltered
            ? "Try changing your filters or search term to find what you are looking for."
            : "Get started by creating your first task to stay organised."}
        </p>
        {!isFiltered && (
          <button
            type="button"
            onClick={onAddTask}
            className="btn-interactive mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Your First Task</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
