import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import taskRoutes from "./routes/task.routes.js";
import { sendError, sendSuccess } from "./utils/api-response.js";
import { notFoundHandler } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());

if (env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

// Health check endpoint verifying service and database readiness
app.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    sendSuccess(
      res,
      {
        status: "healthy",
        database: "connected",
        timestamp: new Date().toISOString(),
      },
      200
    );
  } catch (error) {
    sendError(res, 503, "Database connection unavailable", "SERVICE_UNAVAILABLE");
  }
});

// Mount application routes
app.use("/api/tasks", taskRoutes);

// Catch-all 404 handler for unknown routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
