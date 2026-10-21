/**
 * Formats an ISO date string to a human-readable date using UTC timezone
 * to prevent hydration mismatches between SSR and browser clients.
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

/**
 * Formats a date value into YYYY-MM-DD for native HTML date inputs.
 */
export function formatDateForInput(isoString: string | null | undefined): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

/**
 * Determines whether a task is overdue by comparing calendar dates in UTC.
 * Completed tasks are never flagged as overdue.
 */
export function isOverdue(
  dueDate: string | null | undefined,
  status: "pending" | "completed"
): boolean {
  if (!dueDate || status === "completed") return false;
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return false;

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const dueUtc = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());

  return dueUtc < todayUtc;
}
