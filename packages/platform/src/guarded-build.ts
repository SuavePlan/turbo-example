#!/usr/bin/env bun
/**
 * guarded-build — run a build command only when the host can satisfy a
 * requirement; otherwise print a friendly skip line and exit 0 so that
 * `turbo run build` stays green on incompatible machines.
 *
 * Usage:
 *   guarded-build --name desktop-electron:mac --requires macos -- electron-builder --mac
 */

import { spawnSync } from "node:child_process";
import { checkRequirement, type Requirement } from "./index.ts";

function parseArgs(argv: string[]): {
  name: string;
  requires: Requirement;
  command: string[];
} {
  let name = "build";
  let requires: Requirement = "any";
  const sep = argv.indexOf("--");
  const flags = sep === -1 ? argv : argv.slice(0, sep);
  const command = sep === -1 ? [] : argv.slice(sep + 1);
  for (let i = 0; i < flags.length; i++) {
    const flag = flags[i];
    if (flag === "--name") name = flags[++i] ?? name;
    else if (flag === "--requires") requires = (flags[++i] ?? "any") as Requirement;
  }
  return { name, requires, command };
}

const { name, requires, command } = parseArgs(process.argv.slice(2));
const check = checkRequirement(requires);

if (!check.ok) {
  console.log(`⏭️  skip ${name} — ${check.reason}`);
  process.exit(0);
}

if (command.length === 0) {
  console.log(`✅ ${name} — ${check.reason} (no command provided)`);
  process.exit(0);
}

console.log(`▶️  build ${name} — ${check.reason}`);
const [bin, ...rest] = command;
const result = spawnSync(bin as string, rest, { stdio: "inherit" });
process.exit(result.status ?? 1);
