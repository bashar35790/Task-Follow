import "dotenv/config";
import { PrismaClient } from "@prisma/client";

export default async function globalSetup() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || dbUrl.includes("johndoe:randompassword")) {
    console.warn("\n⚠️ Notice: DATABASE_URL not configured for live tests.\n");
    return;
  }

  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    console.log("Connected to test database.");
    await prisma.$executeRawUnsafe('CREATE SCHEMA IF NOT EXISTS "test";');
  } catch (error) {
    console.warn("Unable to connect to test database during globalSetup:", error);
  } finally {
    await prisma.$disconnect();
  }
}
