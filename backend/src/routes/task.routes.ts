import { Router } from "express";
import {
  createTask,
  deleteTask,
  getTaskById,
  getTasks,
  toggleTaskStatus,
  updateTask,
} from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "../schemas/task.schema.js";

const router = Router();

router.get("/", validate(taskQuerySchema, "query"), getTasks);

router.post("/", validate(createTaskSchema, "body"), createTask);

router.get("/:id", validate(taskIdParamSchema, "params"), getTaskById);

router.put(
  "/:id",
  validate(taskIdParamSchema, "params"),
  validate(updateTaskSchema, "body"),
  updateTask
);

router.patch(
  "/:id/toggle",
  validate(taskIdParamSchema, "params"),
  toggleTaskStatus
);

router.delete("/:id", validate(taskIdParamSchema, "params"), deleteTask);

export default router;
