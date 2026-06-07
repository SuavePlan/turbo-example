import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import config from "../../electrobun.config.ts";
import { App } from "./App.tsx";

describe("@repo/desktop-electrobun", () => {
  test("renders the shared DocumentToolkit on the electrobun surface", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("PDF info");
    expect(html).toContain("electrobun");
  });

  test("electrobun config registers the bun entry and main view", () => {
    expect(config.app.identifier).toBe("sh.suaveplan.turbo.electrobun");
    expect(config.build.bun.entrypoint).toBe("src/bun/index.ts");
    expect(config.views.main.entrypoint).toBe("src/index.html");
  });
});
