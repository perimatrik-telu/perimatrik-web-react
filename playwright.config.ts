import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against a locally running stack:
 *   - backend:  `make run` in perimatrik-api (http://127.0.0.1:8000)
 *   - frontend: `npm run dev` here, with VITE_IS_PRODUCTION=false (http://localhost:5173)
 * Dashboard tests need E2E_EMAIL and E2E_PASSWORD for an existing local account.
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:5173",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "npm run dev -- --port 5173 --strictPort",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
