import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { Task, TaskPriority, TaskStatus } from "@prisma/client";

// In-memory mock database for isolated, fast, and offline-resilient integration testing
let inMemoryTasks: Task[] = [];

describe("Task-Flow REST API Integration Tests", () => {
  beforeEach(() => {
    inMemoryTasks = [];

    // Mock Prisma model methods to use in-memory store
    vi.spyOn(prisma.task, "findMany").mockImplementation(async (args) => {
      let filtered = [...inMemoryTasks];
      if (args?.where?.status) {
        filtered = filtered.filter((t) => t.status === args.where!.status);
      }
      if (args?.where?.OR) {
        const query = (args.where.OR[0] as { title?: { contains: string } })?.title?.contains?.toLowerCase();
        if (query) {
          filtered = filtered.filter(
            (t) =>
              t.title.toLowerCase().includes(query) ||
              (t.description && t.description.toLowerCase().includes(query))
          );
        }
      }
      return filtered;
    });

    vi.spyOn(prisma.task, "findUnique").mockImplementation(async ({ where }) => {
      const found = inMemoryTasks.find((t) => t.id === where.id);
      return found || null;
    });

    vi.spyOn(prisma.task, "create").mockImplementation(async ({ data }) => {
      const newTask: Task = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        title: data.title as string,
        description: (data.description as string) || null,
        status: (data.status as TaskStatus) || TaskStatus.pending,
        priority: (data.priority as TaskPriority) || TaskPriority.medium,
        dueDate: (data.dueDate as Date) || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      inMemoryTasks.push(newTask);
      return newTask;
    });

    vi.spyOn(prisma.task, "update").mockImplementation(async ({ where, data }) => {
      const index = inMemoryTasks.findIndex((t) => t.id === where.id);
      if (index === -1) {
        throw new Error("Record not found");
      }
      const existing = inMemoryTasks[index];
      const updated: Task = {
        ...existing,
        title: (data.title as string) !== undefined ? (data.title as string) : existing.title,
        description: (data.description as string) !== undefined ? (data.description as string) : existing.description,
        status: (data.status as TaskStatus) !== undefined ? (data.status as TaskStatus) : existing.status,
        priority: (data.priority as TaskPriority) !== undefined ? (data.priority as TaskPriority) : existing.priority,
        dueDate: (data.dueDate as Date) !== undefined ? (data.dueDate as Date) : existing.dueDate,
        updatedAt: new Date(),
      };
      inMemoryTasks[index] = updated;
      return updated;
    });

    vi.spyOn(prisma.task, "delete").mockImplementation(async ({ where }) => {
      const index = inMemoryTasks.findIndex((t) => t.id === where.id);
      if (index === -1) {
        throw new Error("Record not found");
      }
      const [deleted] = inMemoryTasks.splice(index, 1);
      return deleted;
    });

    vi.spyOn(prisma, "$queryRaw").mockImplementation(async () => {
      return [{ 1: 1 }];
    });
  });

  // 1. Health check
  describe("GET /health", () => {
    it("returns 200 with service and database health status", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("healthy");
      expect(res.body.data.database).toBe("connected");
    });
  });

  // 2. GET /api/tasks
  describe("GET /api/tasks", () => {
    it("returns 200 and an empty array when no tasks exist", async () => {
      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(0);
    });

    it("returns 200 and a list of created tasks", async () => {
      inMemoryTasks.push({
        id: "123e4567-e89b-12d3-a456-426614174001",
        title: "Test Task",
        description: "Test Description",
        status: TaskStatus.pending,
        priority: TaskPriority.medium,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).get("/api/tasks");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].title).toBe("Test Task");
    });

    it("filters tasks by status correctly", async () => {
      inMemoryTasks.push(
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          title: "Pending Task",
          description: null,
          status: TaskStatus.pending,
          priority: TaskPriority.low,
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          title: "Completed Task",
          description: null,
          status: TaskStatus.completed,
          priority: TaskPriority.high,
          dueDate: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      );

      const res = await request(app).get("/api/tasks?status=completed");
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].status).toBe("completed");
    });
  });

  // 3. POST /api/tasks
  describe("POST /api/tasks", () => {
    it("creates a task and returns 201 with default status pending", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "New Assessment Task",
        description: "Demonstrating REST endpoint",
        priority: "high",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("New Assessment Task");
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.priority).toBe("high");
    });

    it("returns 400 when title is missing or empty string", async () => {
      const res = await request(app).post("/api/tasks").send({
        title: "   ",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when title exceeds 255 characters", async () => {
      const longTitle = "a".repeat(256);
      const res = await request(app).post("/api/tasks").send({
        title: longTitle,
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // 4. GET /api/tasks/:id
  describe("GET /api/tasks/:id", () => {
    it("returns 200 for an existing task ID", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174003";
      inMemoryTasks.push({
        id: taskId,
        title: "Find Me",
        description: null,
        status: TaskStatus.pending,
        priority: TaskPriority.medium,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).get(`/api/tasks/${taskId}`);
      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Find Me");
    });

    it("returns 404 for a non-existent UUID", async () => {
      const res = await request(app).get("/api/tasks/123e4567-e89b-12d3-a456-426614174999");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for an invalid UUID format", async () => {
      const res = await request(app).get("/api/tasks/not-a-valid-uuid");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  // 5. PUT /api/tasks/:id
  describe("PUT /api/tasks/:id", () => {
    it("updates task fields and returns 200", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174004";
      inMemoryTasks.push({
        id: taskId,
        title: "Original Title",
        description: "Original Description",
        status: TaskStatus.pending,
        priority: TaskPriority.low,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).put(`/api/tasks/${taskId}`).send({
        title: "Updated Title",
        description: "Updated Description",
        priority: "high",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
      expect(res.body.data.priority).toBe("high");
    });

    it("returns 400 when updating with an empty title", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174004";
      const res = await request(app).put(`/api/tasks/${taskId}`).send({
        title: "   ",
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 when updating non-existent task ID", async () => {
      const res = await request(app).put("/api/tasks/123e4567-e89b-12d3-a456-426614174999").send({
        title: "Should Fail",
      });

      expect(res.status).toBe(404);
    });
  });

  // 6. PATCH /api/tasks/:id/toggle
  describe("PATCH /api/tasks/:id/toggle", () => {
    it("toggles status from pending to completed and back", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174005";
      inMemoryTasks.push({
        id: taskId,
        title: "Toggle Me",
        description: null,
        status: TaskStatus.pending,
        priority: TaskPriority.medium,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 1. Toggle to completed
      const res1 = await request(app).patch(`/api/tasks/${taskId}/toggle`);
      expect(res1.status).toBe(200);
      expect(res1.body.data.status).toBe("completed");

      // 2. Toggle back to pending
      const res2 = await request(app).patch(`/api/tasks/${taskId}/toggle`);
      expect(res2.status).toBe(200);
      expect(res2.body.data.status).toBe("pending");
    });

    it("returns 404 for non-existent ID", async () => {
      const res = await request(app).patch("/api/tasks/123e4567-e89b-12d3-a456-426614174999/toggle");
      expect(res.status).toBe(404);
    });
  });

  // 7. DELETE /api/tasks/:id
  describe("DELETE /api/tasks/:id", () => {
    it("deletes an existing task and returns 200", async () => {
      const taskId = "123e4567-e89b-12d3-a456-426614174006";
      inMemoryTasks.push({
        id: taskId,
        title: "Delete Me",
        description: null,
        status: TaskStatus.pending,
        priority: TaskPriority.low,
        dueDate: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await request(app).delete(`/api/tasks/${taskId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify task no longer exists
      const getRes = await request(app).get(`/api/tasks/${taskId}`);
      expect(getRes.status).toBe(404);
    });

    it("returns 404 when deleting a non-existent task", async () => {
      const res = await request(app).delete("/api/tasks/123e4567-e89b-12d3-a456-426614174999");
      expect(res.status).toBe(404);
    });
  });

  // 8. General edge cases
  describe("Error handling & edge cases", () => {
    it("returns 400 for malformed JSON request body", async () => {
      const res = await request(app)
        .post("/api/tasks")
        .set("Content-Type", "application/json")
        .send("{ malformed: json ");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 JSON response for unknown routes", async () => {
      const res = await request(app).get("/api/unknown-endpoint");
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
    });
  });
});
