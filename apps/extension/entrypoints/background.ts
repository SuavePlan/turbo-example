import { defineBackground } from "wxt/sandbox";

// A minimal background service worker. It gives the extension a stable
// lifecycle (and a service-worker id that the Playwright e2e suite reads to
// open the popup). The same source compiles to an MV3 service worker for
// Chrome/Edge and an MV2 background script for Firefox.
export default defineBackground(() => {
  console.debug("Turbo Showcase extension background ready");
});
