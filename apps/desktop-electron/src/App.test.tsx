import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import pkg from "../package.json" with { type: "json" };
import { App } from "./App.tsx";

describe("@repo/desktop-electron", () => {
  test("renders the shared DocumentToolkit on the electron surface", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("PDF info");
    expect(html).toContain("electron");
  });

  test("electron-builder config and main entry are valid", () => {
    expect(pkg.build.appId).toBe("sh.suaveplan.turbo.electron");
    expect(existsSync(new URL(`../${pkg.main}`, import.meta.url))).toBe(true);
  });
});
