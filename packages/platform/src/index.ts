/**
 * @repo/platform — host capability detection used to gate platform-specific
 * builds (macOS desktop, iOS, Android, Windows-via-Wine) so that
 * `turbo run build` succeeds on any machine and clearly reports what it skipped.
 */

import { existsSync } from "node:fs";
import { platform } from "node:os";

export type HostOS = "macos" | "linux" | "windows";

/** A build requirement that a given target imposes on the host. */
export type Requirement =
  | "macos" // macOS desktop packaging + iOS (Apple toolchain, signing)
  | "windows" // native Windows desktop build (without Wine)
  | "linux"
  | "wine" // build Windows artifacts from Linux/macOS via Wine/Docker
  | "android-sdk" // Android builds
  | "xcode" // iOS builds
  | "any"; // OS-agnostic (server, web, python, php)

export function hostOS(): HostOS {
  switch (platform()) {
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}

export function hasAndroidSdk(): boolean {
  return Boolean(
    process.env.ANDROID_HOME ||
      process.env.ANDROID_SDK_ROOT ||
      (process.env.HOME && existsSync(`${process.env.HOME}/Library/Android/sdk`)),
  );
}

export function hasXcode(): boolean {
  return hostOS() === "macos" && existsSync("/Applications/Xcode.app");
}

export function hasWine(): boolean {
  // Wine itself, or Docker (which can run the electronuserland/builder:wine image).
  return Boolean(process.env.WINE || existsSync("/usr/bin/wine") || existsSync("/usr/bin/docker"));
}

export interface RequirementCheck {
  ok: boolean;
  reason: string;
}

/** Decide whether the current host satisfies a build requirement. */
export function checkRequirement(req: Requirement): RequirementCheck {
  const os = hostOS();
  const arch = process.arch;
  const host = `${os}/${arch}`;
  switch (req) {
    case "any":
      return { ok: true, reason: `runs anywhere (host ${host})` };
    case "macos":
      return os === "macos"
        ? { ok: true, reason: `host is macOS` }
        : { ok: false, reason: `requires macOS, host is ${host}` };
    case "xcode":
      return hasXcode()
        ? { ok: true, reason: `Xcode present` }
        : { ok: false, reason: `requires macOS + Xcode, host is ${host}` };
    case "windows":
      return os === "windows"
        ? { ok: true, reason: `host is Windows` }
        : { ok: false, reason: `requires Windows, host is ${host}` };
    case "linux":
      return os === "linux"
        ? { ok: true, reason: `host is Linux` }
        : { ok: false, reason: `requires Linux, host is ${host}` };
    case "wine":
      return hasWine()
        ? { ok: true, reason: `Wine/Docker available` }
        : { ok: false, reason: `requires Wine or Docker to cross-build Windows, host is ${host}` };
    case "android-sdk":
      return hasAndroidSdk()
        ? { ok: true, reason: `Android SDK detected` }
        : { ok: false, reason: `requires Android SDK (set ANDROID_HOME), host is ${host}` };
    default:
      return { ok: false, reason: `unknown requirement: ${req as string}` };
  }
}

export interface CapabilityReport {
  host: string;
  capabilities: Record<Requirement, boolean>;
}

export function capabilityReport(): CapabilityReport {
  const reqs: Requirement[] = [
    "any",
    "linux",
    "macos",
    "windows",
    "wine",
    "xcode",
    "android-sdk",
  ];
  const capabilities = Object.fromEntries(
    reqs.map((r) => [r, checkRequirement(r).ok]),
  ) as Record<Requirement, boolean>;
  return { host: `${hostOS()}/${process.arch}`, capabilities };
}
