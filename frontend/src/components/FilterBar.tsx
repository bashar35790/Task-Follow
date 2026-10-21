"use client";

import React from "react";
import { ArrowDownWideNarrow, Search, X } from "lucide-react";
import { SortOrder, TaskFilter, TaskSort } from "../types/task";

interface FilterCounts {
  all: number;
  pending: number;
  completed: number;
}

interface FilterBarProps {
  filter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  counts: FilterCounts;
  sort: TaskSort;
  order: SortOrder;
  onSortChange: (sort: TaskSort, order: SortOrder) => void;
  search: string;
  onSearchChange: (value: string) => void;
}

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
];

const SORT_OPTIONS: { value: string; label: string; sort: TaskSort; order: SortOrder }[] = [
  { value: "createdAt:desc", label: "Newest first", sort: "createdAt", order: "desc" },
  { value: "createdAt:asc", label: "Oldest first", sort: "createdAt", order: "asc" },
  { value: "priority:desc", label: "Priority: High to Low", sort: "priority", order: "desc" },
  { value: "priority:asc", label: "Priority: Low to High", sort: "priority", order: "asc" },
  { value: "dueDate:asc", label: "Due date: Soonest", sort: "dueDate", order: "asc" },
  { value: "dueDate:desc", label: "Due date: Latest", sort: "dueDate", order: "desc" },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filter,
  onFilterChange,
  counts,
  sort,
  order,
  onSortChange,
  search,
  onSearchChange,
}) => {
  const selectedSort = `${sort}:${order}`;

  return (
    <div className="w-full flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div
        className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto"
        role="tablist"
        aria-label="Filter tasks by status"
      >
        {FILTERS.map((item) => {
          const active = filter === item.value;
          return (
            <button
              key={item.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onFilterChange(item.value)}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                active
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
                  active ? "bg-blue-50 text-blue-700" : "bg-slate-200 text-slate-600"
                }`}
              >
                {counts[item.value]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks..."
            aria-label="Search tasks"
            className="w-full sm:w-52 pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="relative">
          <ArrowDownWideNarrow className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select
            value={selectedSort}
            onChange={(e) => {
              const option = SORT_OPTIONS.find((item) => item.value === e.target.value);
              if (option) onSortChange(option.sort, option.order);
            }}
            aria-label="Sort tasks"
            className="w-full sm:w-56 pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
