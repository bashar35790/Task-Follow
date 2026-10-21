import { CreateTaskInput, Task, TaskQueryParams, UpdateTaskInput } from "../types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, message: string, code = "API_ERROR", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(options.headers);
  if (options.body != null) {
    headers.set("Content-Type", "application/json");
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let json: ApiResponse<T> | null = null;
    try {
      json = await res.json();
    } catch {
      // Body may be empty or non-JSON
    }

    if (!res.ok) {
      const errorMessage = json?.error?.message || `Request failed with status ${res.status}`;
      const errorCode = json?.error?.code || `HTTP_${res.status}`;
      const errorDetails = json?.error?.details;
      throw new ApiError(res.status, errorMessage, errorCode, errorDetails);
    }

    if (!json || json.data === undefined) {
      return {} as T;
    }

    return json.data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network failure or abort
    throw new ApiError(
      0,
      error instanceof Error ? error.message : "Failed to connect to the backend server. Please check your network connection.",
      "NETWORK_ERROR"
    );
  }
}

export const taskApi = {
  async getAll(params?: TaskQueryParams): Promise<Task[]> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.sort) searchParams.append("sort", params.sort);
    if (params?.order) searchParams.append("order", params.order);
    if (params?.search && params.search.trim()) searchParams.append("search", params.search.trim());

    const queryString = searchParams.toString();
    const endpoint = `/api/tasks${queryString ? `?${queryString}` : ""}`;
    return request<Task[]>(endpoint, { method: "GET" });
  },

  async create(payload: CreateTaskInput): Promise<Task> {
    return request<Task>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: string, payload: UpdateTaskInput): Promise<Task> {
    return request<Task>(`/api/tasks/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async toggleStatus(id: string): Promise<Task> {
    return request<Task>(`/api/tasks/${id}/toggle`, {
      method: "PATCH",
    });
  },

  async delete(id: string): Promise<void> {
    await request<unknown>(`/api/tasks/${id}`, {
      method: "DELETE",
    });
  },
};
