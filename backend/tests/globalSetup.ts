import "dotenv/config";
import { execSync } from "node:child_process";
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
    await prisma.$disconnect();
    return;
  } finally {
    await prisma.$disconnect();
  }

  try {
    console.log("Applying migrations to the test schema...");
    execSync("npx prisma migrate deploy", {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: "inherit",
    });
  } catch (error) {
    console.warn("Unable to apply migrations to the test schema:", error);
  }
}
