import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
import { sendError } from "../utils/api-response.js";
import { logger } from "../utils/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.code, err.details);
    return;
  }

  if (err instanceof ZodError) {
    const formattedDetails = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    sendError(res, 400, "Validation failed", "VALIDATION_ERROR", formattedDetails);
    return;
  }

  if (err instanceof SyntaxError && "status" in err && err.status === 400) {
    sendError(res, 400, "Malformed JSON payload", "BAD_REQUEST");
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      sendError(res, 404, "Requested resource not found", "NOT_FOUND");
      return;
    }
    if (err.code === "P2002") {
      sendError(res, 409, "Resource already exists", "CONFLICT");
      return;
    }
  }

  logger.error(err.message, err.stack);
  const isDev = env.NODE_ENV === "development";
  sendError(
    res,
    500,
    isDev ? err.message : "An unexpected server error occurred",
    "INTERNAL_SERVER_ERROR"
  );
}
