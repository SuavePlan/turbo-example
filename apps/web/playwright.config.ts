import { defineConfig, devices } from "@playwright/test";

// E2E for the web app: build, serve the production bundle with `vite preview`,
// and drive it with Chromium. API calls are stubbed via route interception so
// the UI flow is tested deterministically without a live backend.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: process.env.CI ? "list" : "line",
  use: {
    baseURL: "http://localhost:4317",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], channel: "chromium" } }],
  webServer: {
    command: "bunx vite preview --strictPort --port 4317",
    url: "http://localhost:4317",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
