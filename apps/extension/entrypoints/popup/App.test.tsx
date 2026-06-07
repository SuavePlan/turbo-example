import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.tsx";

describe("@repo/extension", () => {
  test("renders the shared DocumentToolkit on the extension surface", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("PDF info");
    expect(html).toContain("extension");
  });
});
