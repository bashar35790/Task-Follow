import { Prisma, Task, TaskPriority, TaskStatus } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "../schemas/task.schema.js";

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export class TaskService {
  async getAllTasks(query?: TaskQueryInput): Promise<Task[]> {
    const where: Prisma.TaskWhereInput = {};

    if (query?.status) {
      where.status = query.status as TaskStatus;
    }

    if (query?.search && query.search.trim()) {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const sortField = query?.sort || "createdAt";
    const sortOrder = query?.order || "desc";

    // If sorting by priority, apply deterministic in-memory rank
    if (sortField === "priority") {
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return tasks.sort((a, b) => {
        const rankA = PRIORITY_RANK[a.priority];
        const rankB = PRIORITY_RANK[b.priority];
        if (sortOrder === "asc") {
          return rankA - rankB; // low -> medium -> high
        }
        return rankB - rankA; // high -> medium -> low
      });
    }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: {
        [sortField]: sortOrder,
      },
    });

    return tasks;
  }

  async getTaskById(id: string): Promise<Task> {
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      throw AppError.notFound(`Task with ID '${id}' not found`);
    }

    return task;
  }

  async createTask(data: CreateTaskInput): Promise<Task> {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: TaskStatus.pending,
        priority: (data.priority as TaskPriority) || TaskPriority.medium,
        dueDate: data.dueDate,
      },
    });

    return task;
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    await this.getTaskById(id);

    const updateData: Prisma.TaskUpdateInput = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status as TaskStatus;
    if (data.priority !== undefined) updateData.priority = data.priority as TaskPriority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return updatedTask;
  }

  async toggleTaskStatus(id: string): Promise<Task> {
    const existing = await this.getTaskById(id);
    const newStatus =
      existing.status === TaskStatus.completed
        ? TaskStatus.pending
        : TaskStatus.completed;

    const updated = await prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });

    return updated;
  }

  async deleteTask(id: string): Promise<Task> {
    await this.getTaskById(id);

    const deleted = await prisma.task.delete({
      where: { id },
    });

    return deleted;
  }
}

export const taskService = new TaskService();
