import { NextFunction, Request, Response } from "express";
import { taskService } from "../services/task.service.js";
import { sendSuccess } from "../utils/api-response.js";
import { CreateTaskInput, TaskQueryInput, UpdateTaskInput } from "../schemas/task.schema.js";

export class TaskController {
  async getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as TaskQueryInput;
      const tasks = await taskService.getAllTasks(query);
      sendSuccess(res, tasks, 200);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const task = await taskService.getTaskById(id);
      sendSuccess(res, task, 200);
    } catch (error) {
      next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as CreateTaskInput;
      const task = await taskService.createTask(input);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const input = req.body as UpdateTaskInput;
      const task = await taskService.updateTask(id, input);
      sendSuccess(res, task, 200);
    } catch (error) {
      next(error);
    }
  }

  async toggleTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      const task = await taskService.toggleTaskStatus(id);
      sendSuccess(res, task, 200);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as { id: string };
      await taskService.deleteTask(id);
      sendSuccess(res, { message: "Task deleted successfully", id }, 200);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
