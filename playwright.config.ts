import { defineConfig, devices } from "@playwright/test";

const port = "3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "retain-on-failure",
    video: "off",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        ...(process.platform === "win32" ? { channel: "msedge" } : {}),
      },
    },
  ],
  webServer: {
    command: `corepack pnpm start --port ${port}`,
    env: {
      SANITY_WEBHOOK_SECRET: "playwright-webhook-secret",
    },
    url: `http://127.0.0.1:${port}/th`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
