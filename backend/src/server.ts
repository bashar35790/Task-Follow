import app from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/prisma.js";
import { logger } from "./utils/logger.js";

async function startServer() {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`);
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);

    const forceExitTimer = setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
    forceExitTimer.unref();

    server.close(async () => {
      clearTimeout(forceExitTimer);
      await disconnectDatabase();
      logger.info("Server closed and database disconnected.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
}

startServer().catch((error) => {
  logger.error("Failed to start server", error);
  process.exit(1);
});
