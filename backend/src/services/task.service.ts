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
      where.status = query.status;
    }

    const searchTerm = query?.search?.trim();
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: "insensitive" } },
        { description: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    const sortField = query?.sort ?? "createdAt";
    const sortOrder = query?.order ?? "desc";

    if (sortField === "priority") {
      const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return tasks.sort((a, b) => {
        const rankDiff = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
        return sortOrder === "asc" ? rankDiff : -rankDiff;
      });
    }

    return prisma.task.findMany({
      where,
      orderBy: { [sortField]: sortOrder },
    });
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
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate,
      },
    });
  }

  async updateTask(id: string, data: UpdateTaskInput): Promise<Task> {
    await this.getTaskById(id);

    return prisma.task.update({
      where: { id },
      data,
    });
  }

  async toggleTaskStatus(id: string): Promise<Task> {
    const existing = await this.getTaskById(id);
    const newStatus =
      existing.status === TaskStatus.completed
        ? TaskStatus.pending
        : TaskStatus.completed;

    return prisma.task.update({
      where: { id },
      data: { status: newStatus },
    });
  }

  async deleteTask(id: string): Promise<Task> {
    await this.getTaskById(id);

    return prisma.task.delete({
      where: { id },
    });
  }
}

export const taskService = new TaskService();
