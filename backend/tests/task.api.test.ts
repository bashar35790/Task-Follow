import { describe, it, expect } from "vitest";
import request from "supertest";
import { randomUUID } from "node:crypto";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const api = request(app);

const missingId = "123e4567-e89b-12d3-a456-426614174999";

describe("Task-Flow REST API Integration Tests", () => {
  describe("GET /health", () => {
    it("returns 200 with service and database health status", async () => {
      const res = await api.get("/health");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe("healthy");
      expect(res.body.data.database).toBe("connected");
    });
  });

  describe("GET /api/tasks", () => {
    it("returns 200 and an empty array when no tasks exist", async () => {
      const res = await api.get("/api/tasks");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(0);
    });

    it("returns 200 and a list of created tasks", async () => {
      await prisma.task.create({
        data: { title: "Test Task", description: "Test Description" },
      });

      const res = await api.get("/api/tasks");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe("Test Task");
    });

    it("filters tasks by status correctly", async () => {
      await prisma.task.createMany({
        data: [
          { title: "Pending Task", status: "pending", priority: "low" },
          { title: "Completed Task", status: "completed", priority: "high" },
        ],
      });

      const res = await api.get("/api/tasks?status=completed");

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].status).toBe("completed");
    });

    it("sorts tasks by priority from high to low", async () => {
      await prisma.task.createMany({
        data: [
          { title: "Low", priority: "low" },
          { title: "High", priority: "high" },
          { title: "Medium", priority: "medium" },
        ],
      });

      const res = await api.get("/api/tasks?sort=priority&order=desc");

      expect(res.status).toBe(200);
      expect(res.body.data.map((task: { priority: string }) => task.priority)).toEqual([
        "high",
        "medium",
        "low",
      ]);
    });

    it("returns 400 for invalid query parameters", async () => {
      const res = await api.get("/api/tasks?status=archived");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/tasks", () => {
    it("creates a task and returns 201 with default status pending", async () => {
      const res = await api.post("/api/tasks").send({
        title: "New Assessment Task",
        description: "Demonstrating REST endpoint",
        priority: "high",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("New Assessment Task");
      expect(res.body.data.status).toBe("pending");
      expect(res.body.data.priority).toBe("high");

      const persisted = await prisma.task.findUnique({ where: { id: res.body.data.id } });
      expect(persisted).not.toBeNull();
    });

    it("returns 400 when title is missing or whitespace only", async () => {
      const res = await api.post("/api/tasks").send({ title: "   " });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("returns 400 when title exceeds 255 characters", async () => {
      const res = await api.post("/api/tasks").send({ title: "a".repeat(256) });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("GET /api/tasks/:id", () => {
    it("returns 200 for an existing task ID", async () => {
      const task = await prisma.task.create({ data: { title: "Find Me" } });

      const res = await api.get(`/api/tasks/${task.id}`);

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Find Me");
    });

    it("returns 404 for a non-existent UUID", async () => {
      const res = await api.get(`/api/tasks/${missingId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("returns 400 for an invalid UUID format", async () => {
      const res = await api.get("/api/tasks/not-a-valid-uuid");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("PUT /api/tasks/:id", () => {
    it("updates task fields and returns 200", async () => {
      const task = await prisma.task.create({
        data: { title: "Original Title", description: "Original Description" },
      });

      const res = await api.put(`/api/tasks/${task.id}`).send({
        title: "Updated Title",
        description: "Updated Description",
        priority: "high",
      });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated Title");
      expect(res.body.data.priority).toBe("high");

      const persisted = await prisma.task.findUnique({ where: { id: task.id } });
      expect(persisted?.title).toBe("Updated Title");
    });

    it("returns 400 when updating with an empty title", async () => {
      const task = await prisma.task.create({ data: { title: "Valid" } });

      const res = await api.put(`/api/tasks/${task.id}`).send({ title: "   " });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 when updating a non-existent task ID", async () => {
      const res = await api.put(`/api/tasks/${missingId}`).send({ title: "Should Fail" });

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/tasks/:id/toggle", () => {
    it("toggles status from pending to completed and back", async () => {
      const task = await prisma.task.create({ data: { title: "Toggle Me" } });

      const first = await api.patch(`/api/tasks/${task.id}/toggle`);
      expect(first.status).toBe(200);
      expect(first.body.data.status).toBe("completed");

      const second = await api.patch(`/api/tasks/${task.id}/toggle`);
      expect(second.status).toBe(200);
      expect(second.body.data.status).toBe("pending");
    });

    it("returns 404 for a non-existent ID", async () => {
      const res = await api.patch(`/api/tasks/${missingId}/toggle`);

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE /api/tasks/:id", () => {
    it("deletes an existing task and returns 200", async () => {
      const task = await prisma.task.create({ data: { title: "Delete Me" } });

      const res = await api.delete(`/api/tasks/${task.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const getRes = await api.get(`/api/tasks/${task.id}`);
      expect(getRes.status).toBe(404);
    });

    it("returns 404 when deleting a non-existent task", async () => {
      const res = await api.delete(`/api/tasks/${randomUUID()}`);

      expect(res.status).toBe(404);
    });
  });

  describe("Error handling & edge cases", () => {
    it("returns 400 for malformed JSON request body", async () => {
      const res = await api
        .post("/api/tasks")
        .set("Content-Type", "application/json")
        .send("{ malformed: json ");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("returns 404 JSON response for unknown routes", async () => {
      const res = await api.get("/api/unknown-endpoint");

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("ROUTE_NOT_FOUND");
    });
  });
});
