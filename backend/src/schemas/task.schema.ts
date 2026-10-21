import { z } from "zod";

export const TaskStatusEnum = z.enum(["pending", "completed"]);
export const TaskPriorityEnum = z.enum(["low", "medium", "high"]);

export const dueDateSchema = z
  .union([
    z.string().datetime(),
    z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}(T.*)?$/,
        "Invalid date format (expected YYYY-MM-DD or ISO 8601)"
      ),
  ])
  .nullable()
  .optional()
  .transform((val) => (val == null ? null : new Date(val)))
  .refine((val) => val == null || !Number.isNaN(val.getTime()), {
    message: "Invalid date value",
  });

export const createTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(255, "Title must be 255 characters or fewer"),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be 2000 characters or fewer")
      .nullable()
      .optional()
      .transform((val) => (val === "" || val === undefined ? null : val)),
    priority: TaskPriorityEnum.optional().default("medium"),
    dueDate: dueDateSchema,
  })
  .strict();

export const updateTaskSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Title cannot be empty")
      .max(255, "Title must be 255 characters or fewer")
      .optional(),
    description: z
      .string()
      .trim()
      .max(2000, "Description must be 2000 characters or fewer")
      .nullable()
      .optional()
      .transform((val) => (val === "" ? null : val)),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    dueDate: dueDateSchema,
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided for update"
  );

export const taskIdParamSchema = z
  .object({
    id: z.string().uuid("Invalid task ID format (UUID expected)"),
  })
  .strict();

export const taskQuerySchema = z
  .object({
    status: TaskStatusEnum.optional(),
    sort: z.enum(["createdAt", "dueDate", "priority"]).optional().default("createdAt"),
    order: z.enum(["asc", "desc"]).optional().default("desc"),
    search: z.string().max(100, "Search term must be 100 characters or fewer").optional(),
  })
  .strict();

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskQueryInput = z.infer<typeof taskQuerySchema>;
