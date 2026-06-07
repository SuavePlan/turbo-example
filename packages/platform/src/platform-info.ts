#!/usr/bin/env bun
/**
 * platform-info — print a one-screen report of what this host can build,
 * so contributors know up-front which targets will be skipped locally.
 */

import { capabilityReport } from "./index.ts";

const { host, capabilities } = capabilityReport();

const rows: Array<[string, boolean]> = [
  ["Servers / web / python / php (any OS)", capabilities.any],
  ["Linux desktop (Electron/Electrobun)", capabilities.linux],
  ["Windows desktop via Wine/Docker", capabilities.wine],
  ["macOS desktop (Electron/Electrobun)", capabilities.macos],
  ["iOS app (Expo, needs Xcode)", capabilities.xcode],
  ["Android app (Expo, needs SDK)", capabilities["android-sdk"]],
];

console.log(`\n  Host: ${host}\n`);
console.log("  Build capabilities on this machine:");
for (const [label, ok] of rows) {
  console.log(`    ${ok ? "✅" : "⏭️ "} ${label}`);
}
console.log(
  "\n  Targets marked ⏭️  are skipped locally and produced by the CI matrix\n  (.github/workflows/ci.yml) on a native runner instead.\n",
);
