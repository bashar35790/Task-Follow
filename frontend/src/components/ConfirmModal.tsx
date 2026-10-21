"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Modal } from "./Modal";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  taskTitle: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  taskTitle,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) setIsDeleting(false);
  }, [isOpen]);

  const handleConfirm = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Task" maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-5 w-5 text-rose-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete this task? This action cannot be undone.
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900 break-words px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
            {taskTitle}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2.5 mt-6">
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="btn-interactive inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-rose-600 rounded-lg hover:bg-rose-700 shadow-sm shadow-rose-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span>{isDeleting ? "Deleting..." : "Confirm Delete"}</span>
        </button>
      </div>
    </Modal>
  );
};
