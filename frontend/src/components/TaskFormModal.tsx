"use client";

import React, { useEffect, useId, useState } from "react";
import { AlertCircle, Calendar, Flag, Loader2 } from "lucide-react";
import { CreateTaskInput, Task, TaskPriority, UpdateTaskInput } from "../types/task";
import { formatDateForInput } from "../lib/format";
import { Modal } from "./Modal";

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  task?: Task | null;
  onSubmit: (payload: CreateTaskInput | UpdateTaskInput) => Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
};

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  task,
  onSubmit,
}) => {
  const isEditMode = Boolean(task);
  const fieldId = useId();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [titleError, setTitleError] = useState<string | null>(null);
  const [titleTouched, setTitleTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setForm(
      task
        ? {
            title: task.title,
            description: task.description ?? "",
            priority: task.priority,
            dueDate: formatDateForInput(task.dueDate),
          }
        : EMPTY_FORM
    );
    setTitleError(null);
    setTitleTouched(false);
    setSubmitError(null);
    setIsSubmitting(false);
  }, [isOpen, task]);

  const validateTitle = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed.length === 0) return "Title is required";
    if (trimmed.length > 255) return "Title must be 255 characters or fewer";
    return null;
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({ ...prev, title: value }));
    if (titleTouched) {
      setTitleError(validateTitle(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const error = validateTitle(form.title);
    setTitleTouched(true);
    setTitleError(error);
    if (error) return;

    const payload: CreateTaskInput = {
      title: form.title.trim(),
      description: form.description.trim() === "" ? null : form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate === "" ? null : form.dueDate,
    };

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleInputId = `${fieldId}-title`;
  const descriptionId = `${fieldId}-description`;
  const priorityId = `${fieldId}-priority`;
  const dueDateId = `${fieldId}-dueDate`;
  const titleErrorId = `${fieldId}-title-error`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Task" : "Create New Task"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {submitError && (
          <div
            className="flex items-start gap-2.5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm animate-fade-in"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        <div>
          <label
            htmlFor={titleInputId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Title <span className="text-rose-500">*</span>
          </label>
          <input
            id={titleInputId}
            data-autofocus
            type="text"
            value={form.title}
            maxLength={255}
            placeholder="e.g. Submit assessment project"
            onChange={(e) => handleTitleChange(e.target.value)}
            onBlur={() => {
              setTitleTouched(true);
              setTitleError(validateTitle(form.title));
            }}
            aria-invalid={Boolean(titleError)}
            aria-describedby={titleError ? titleErrorId : undefined}
            className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
              titleError
                ? "border-rose-300 bg-rose-50/50 focus:ring-rose-400"
                : "border-slate-300 bg-white focus:ring-blue-500 focus:border-blue-500"
            }`}
          />
          {titleError && (
            <p id={titleErrorId} className="mt-1.5 text-xs font-medium text-rose-600">
              {titleError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor={descriptionId}
            className="block text-sm font-medium text-slate-700 mb-1.5"
          >
            Description
          </label>
          <textarea
            id={descriptionId}
            value={form.description}
            rows={3}
            maxLength={2000}
            placeholder="Add extra context or notes (optional)"
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor={priorityId}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
            >
              <Flag className="h-3.5 w-3.5 text-slate-400" />
              Priority
            </label>
            <select
              id={priorityId}
              value={form.priority}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
              }
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PRIORITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor={dueDateId}
              className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Due Date
            </label>
            <input
              id={dueDateId}
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-interactive inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>
              {isSubmitting
                ? isEditMode
                  ? "Saving..."
                  : "Creating..."
                : isEditMode
                  ? "Save Changes"
                  : "Create Task"}
            </span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
