import { describe, expect, test } from "bun:test";
import { capabilityReport, checkRequirement, hostOS } from "./index.ts";

describe("@repo/platform", () => {
  test("any requirement is always satisfiable", () => {
    expect(checkRequirement("any").ok).toBe(true);
  });

  test("host matches its own OS requirement", () => {
    const os = hostOS();
    expect(checkRequirement(os).ok).toBe(true);
  });

  test("capability report covers every requirement and includes the host", () => {
    const report = capabilityReport();
    expect(report.host).toContain(hostOS());
    expect(report.capabilities.any).toBe(true);
  });
});
