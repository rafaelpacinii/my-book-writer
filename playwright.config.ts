import { defineConfig, devices } from "@playwright/test";

const externalURL = process.env.MBW_EDITOR_TEST_URL;
const baseURL = externalURL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./src/tests/e2e",
  testMatch: "**/*.spec.ts",
  outputDir: "./src/tests/test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "src/tests/playwright-report" }]],
  use: {
    baseURL,
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: externalURL ? undefined : {
    command: "npm run dev -- --webpack --hostname 127.0.0.1 --port 3000",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
