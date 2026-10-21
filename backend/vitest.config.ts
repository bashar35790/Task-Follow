import { config as loadEnv } from "dotenv";
import { defineConfig } from "vitest/config";

loadEnv();
loadEnv({ path: ".env.test", override: true });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: ["./tests/globalSetup.ts"],
    setupFiles: ["./tests/setup.ts"],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 60000,
    env: {
      DATABASE_URL: process.env.DATABASE_URL ?? "",
    },
  },
});
