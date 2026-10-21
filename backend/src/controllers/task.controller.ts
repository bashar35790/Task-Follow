import type { NextFunction, Request, Response } from "express";
import { taskService } from "../services/task.service.js";
import { sendSuccess } from "../utils/api-response.js";
import type {
  CreateTaskInput,
  TaskQueryInput,
  UpdateTaskInput,
} from "../schemas/task.schema.js";

export async function getTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as TaskQueryInput;
    const tasks = await taskService.getAllTasks(query);
    sendSuccess(res, tasks);
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.getTaskById(req.params.id);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
}

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateTaskInput;
    const task = await taskService.createTask(input);
    sendSuccess(res, task, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as UpdateTaskInput;
    const task = await taskService.updateTask(req.params.id, input);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
}

export async function toggleTaskStatus(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.toggleTaskStatus(req.params.id);
    sendSuccess(res, task);
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    await taskService.deleteTask(id);
    sendSuccess(res, { message: "Task deleted successfully", id });
  } catch (error) {
    next(error);
  }
}
