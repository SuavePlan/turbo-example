import { describe, expect, test } from "bun:test";
import { clamp, formatBytes, slugify } from "./index.ts";

describe("clamp", () => {
  test("bounds values", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(99, 0, 10)).toBe(10);
  });
});

describe("formatBytes", () => {
  test("formats common sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(1048576)).toBe("1.0 MB");
  });
});

describe("slugify", () => {
  test("produces url-safe slugs", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  Café au lait  ")).toBe("cafe-au-lait");
  });
});
