import path from "node:path";
import { fileURLToPath } from "node:url";
import { type BrowserContext, test as base, chromium } from "@playwright/test";

const dir = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.resolve(dir, "..", ".output", "chrome-mv3");

/**
 * Loads the built Chrome MV3 extension into a persistent Chromium context and
 * exposes the runtime extension id (read from its background service worker),
 * following WXT's recommended Playwright setup.
 */
export const test = base.extend<{ context: BrowserContext; extensionId: string }>({
  // biome-ignore lint/correctness/noEmptyPattern: Playwright requires an object pattern to detect fixture dependencies
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext("", {
      channel: "chromium",
      headless: true,
      args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`],
    });
    await use(context);
    await context.close();
  },
  extensionId: async ({ context }, use) => {
    let [worker] = context.serviceWorkers();
    if (!worker) worker = await context.waitForEvent("serviceworker");
    await use(worker.url().split("/")[2] as string);
  },
});

export const expect = test.expect;
