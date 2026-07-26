import { defineConfig, devices } from "@playwright/test";

const port = "3000";

export default defineConfig({
  testDir: "./tests",
  timeout: 180_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
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
      CONTENT_SOURCE: "fixture",
      PREVIEW_TICKET_SECRET: "playwright-preview-ticket-secret-32-bytes",
      RATE_LIMIT_SECRET: "playwright-rate-limit-secret-32-bytes",
      REACTION_COOKIE_SECRET: "playwright-reaction-cookie-secret-32-bytes",
      REACTION_STORE: "memory",
      SANITY_WEBHOOK_SECRET: "playwright-webhook-secret",
    },
    url: `http://127.0.0.1:${port}/th`,
    // A reused local server may have production/default environment values and
    // silently invalidate reaction, preview, and rate-limit coverage. Tests own
    // their server so every run exercises the declared deterministic fixture.
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
