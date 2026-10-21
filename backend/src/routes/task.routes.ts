import { Router } from "express";
import { taskController } from "../controllers/task.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  createTaskSchema,
  taskIdParamSchema,
  taskQuerySchema,
  updateTaskSchema,
} from "../schemas/task.schema.js";

const router = Router();

router.get(
  "/",
  validate(taskQuerySchema, "query"),
  taskController.getTasks.bind(taskController)
);

router.post(
  "/",
  validate(createTaskSchema, "body"),
  taskController.createTask.bind(taskController)
);

router.get(
  "/:id",
  validate(taskIdParamSchema, "params"),
  taskController.getTaskById.bind(taskController)
);

router.put(
  "/:id",
  validate(taskIdParamSchema, "params"),
  validate(updateTaskSchema, "body"),
  taskController.updateTask.bind(taskController)
);

router.patch(
  "/:id/toggle",
  validate(taskIdParamSchema, "params"),
  taskController.toggleTaskStatus.bind(taskController)
);

router.delete(
  "/:id",
  validate(taskIdParamSchema, "params"),
  taskController.deleteTask.bind(taskController)
);

export default router;
