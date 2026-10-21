import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md text-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mx-auto h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
          <SearchX className="h-6 w-6 text-blue-500" />
        </div>
        <h1 className="mt-4 text-xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="btn-interactive mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-600/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
