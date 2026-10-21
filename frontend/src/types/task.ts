export type TaskStatus = "pending" | "completed";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export type TaskFilter = "all" | "pending" | "completed";
export type TaskSort = "createdAt" | "dueDate" | "priority";
export type SortOrder = "asc" | "desc";

export interface TaskQueryParams {
  status?: TaskStatus;
  sort?: TaskSort;
  order?: SortOrder;
  search?: string;
}
