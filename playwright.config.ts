import { defineConfig, devices } from "@playwright/test";

const externalURL = process.env.MBW_EDITOR_TEST_URL;
const baseURL = externalURL ?? "http://127.0.0.1:3100";

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
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  ],
  webServer: externalURL ? undefined : {
    command: "node src/tests/run-static.mjs",
    env: {
      MBW_NEXT_DIST_DIR: ".next/cache/ui-e2e",
      MBW_STATIC_PORT: "3100",
      NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ""} --require ./src/tests/offline-next.cjs`,
    },
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 600_000,
  },
});
