"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto h-14 w-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center">
          <AlertOctagon className="h-6 w-6 text-rose-600" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-500">
          An unexpected error occurred while rendering the dashboard. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="btn-interactive mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try again</span>
        </button>
      </div>
    </div>
  );
}
