"use client";

import React from "react";
import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface ErrorAlertProps {
  message: string;
  details?: unknown;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  message,
  details,
  onRetry,
  onDismiss,
}) => {
  return (
    <div
      className="w-full bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start justify-between gap-3 text-rose-900 shadow-sm animate-fade-in"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-semibold">An error occurred</h3>
          <p className="text-sm text-rose-700 mt-0.5">{message}</p>
          {Array.isArray(details) && details.length > 0 && (
            <ul className="mt-2 text-xs text-rose-600 list-disc list-inside space-y-0.5">
              {details.map((item, idx) => (
                <li key={idx}>
                  {typeof item === "object" && item !== null && "message" in item
                    ? String((item as { message: unknown }).message)
                    : JSON.stringify(item)}
                </li>
              ))}
            </ul>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Request</span>
            </button>
          )}
        </div>
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md text-rose-400 hover:text-rose-700 hover:bg-rose-100/50 transition-colors focus:outline-none"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
