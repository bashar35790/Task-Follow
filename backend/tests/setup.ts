import { beforeEach, afterAll } from "vitest";
import { prisma } from "../src/config/prisma.js";

beforeEach(async () => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.includes("johndoe:randompassword") && !dbUrl.includes("localhost:5432")) {
      await prisma.task.deleteMany();
    }
  } catch {
    // Continue cleanly if DB is not reachable
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // Graceful disconnect
  }
});
