import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI
    ? {
        command: "pnpm start",
        url: "http://localhost:3000",
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          DATABASE_URL:
            process.env.DATABASE_URL ??
            "postgresql://postwave:postwave@localhost:5432/postwave",
          REDIS_URL: process.env.REDIS_URL ?? "redis://localhost:6379",
          AUTH_SECRET:
            process.env.AUTH_SECRET ?? "ci-test-secret-minimum-32-chars-long",
          TOKEN_ENCRYPTION_KEY:
            process.env.TOKEN_ENCRYPTION_KEY ??
            "dGVzdC1rZXktMzJieXRzLWJhc2U2NC1wYWQ=",
        },
      }
    : undefined,
});
