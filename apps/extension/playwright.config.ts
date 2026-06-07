import { defineConfig } from "@playwright/test";

// E2E for the browser extension: loads the built MV3 extension into a
// persistent Chromium context (see e2e/fixtures.ts). Runs serially because
// each test drives its own extension-backed browser context.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  reporter: process.env.CI ? "list" : "line",
});
