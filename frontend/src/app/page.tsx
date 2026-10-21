"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, taskApi } from "../services/task-api";
import {
  CreateTaskInput,
  SortOrder,
  Task,
  TaskFilter,
  TaskPriority,
  TaskSort,
  UpdateTaskInput,
} from "../types/task";
import { Header } from "../components/Header";
import { FilterBar } from "../components/FilterBar";
import { TaskList } from "../components/TaskList";
import { TaskFormModal } from "../components/TaskFormModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { ErrorAlert } from "../components/ErrorAlert";
import { Toast, ToastType } from "../components/Toast";

const PRIORITY_RANK: Record<TaskPriority, number> = { low: 1, medium: 2, high: 3 };

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

interface ErrorState {
  message: string;
  details?: unknown;
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ErrorState | null>(null);

  const [filter, setFilter] = useState<TaskFilter>("all");
  const [sort, setSort] = useState<TaskSort>("createdAt");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const handleToastClose = useCallback(() => setToast(null), []);

  const describeError = useCallback((err: unknown): ErrorState => {
    if (err instanceof ApiError) {
      return { message: err.message, details: err.details };
    }
    return {
      message: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }, []);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await taskApi.getAll();
      setTasks(data);
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsLoading(false);
    }
  }, [describeError]);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  const counts = useMemo(
    () => ({
      all: tasks.length,
      pending: tasks.filter((task) => task.status === "pending").length,
      completed: tasks.filter((task) => task.status === "completed").length,
    }),
    [tasks]
  );

  const visibleTasks = useMemo(() => {
    let list = tasks;

    if (filter !== "all") {
      list = list.filter((task) => task.status === filter);
    }

    const query = search.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description ?? "").toLowerCase().includes(query)
      );
    }

    const sorted = [...list].sort((a, b) => {
      if (sort === "priority") {
        const cmp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        if (cmp !== 0) return order === "asc" ? cmp : -cmp;
      } else if (sort === "dueDate") {
        const aTime = a.dueDate ? new Date(a.dueDate).getTime() : null;
        const bTime = b.dueDate ? new Date(b.dueDate).getTime() : null;
        if (aTime === null && bTime !== null) return 1;
        if (aTime !== null && bTime === null) return -1;
        if (aTime !== null && bTime !== null && aTime !== bTime) {
          return order === "asc" ? aTime - bTime : bTime - aTime;
        }
      }

      const createdCmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return order === "asc" ? createdCmp : -createdCmp;
    });

    return sorted;
  }, [tasks, filter, search, sort, order]);

  const isFiltered = filter !== "all" || search.trim() !== "";

  const handleOpenCreate = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const handleSubmit = async (payload: CreateTaskInput | UpdateTaskInput) => {
    if (editingTask) {
      const updated = await taskApi.update(editingTask.id, payload);
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)));
      showToast("Task updated successfully");
    } else {
      const created = await taskApi.create(payload as CreateTaskInput);
      setTasks((prev) => [created, ...prev]);
      showToast("Task created successfully");
    }
  };

  const handleToggle = async (task: Task) => {
    const previous = tasks;
    const optimisticStatus = task.status === "completed" ? "pending" : "completed";
    setTasks((prev) =>
      prev.map((item) =>
        item.id === task.id ? { ...item, status: optimisticStatus } : item
      )
    );

    try {
      const updated = await taskApi.toggleStatus(task.id);
      setTasks((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setTasks(previous);
      const described = describeError(err);
      showToast(described.message, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    const target = deletingTask;
    try {
      await taskApi.delete(target.id);
      setTasks((prev) => prev.filter((task) => task.id !== target.id));
      showToast("Task deleted successfully");
    } catch (err) {
      const described = describeError(err);
      setError(described);
      showToast(described.message, "error");
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        totalCount={counts.all}
        completedCount={counts.completed}
        onAddTask={handleOpenCreate}
      />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <FilterBar
          filter={filter}
          onFilterChange={setFilter}
          counts={counts}
          sort={sort}
          order={order}
          onSortChange={(nextSort, nextOrder) => {
            setSort(nextSort);
            setOrder(nextOrder);
          }}
          search={search}
          onSearchChange={setSearch}
        />

        {error && (
          <div className="mt-4">
            <ErrorAlert
              message={error.message}
              details={error.details}
              onRetry={() => void fetchTasks()}
              onDismiss={() => setError(null)}
            />
          </div>
        )}

        <section className="mt-5">
          <TaskList
            tasks={visibleTasks}
            isLoading={isLoading}
            isFiltered={isFiltered}
            onToggle={handleToggle}
            onEdit={handleOpenEdit}
            onDelete={setDeletingTask}
            onAddTask={handleOpenCreate}
          />
        </section>
      </main>

      <TaskFormModal
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        task={editingTask}
        onSubmit={handleSubmit}
      />

      <ConfirmModal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
        taskTitle={deletingTask?.title ?? ""}
      />

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
}
