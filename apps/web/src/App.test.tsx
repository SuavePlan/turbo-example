import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { App } from "./App.tsx";

describe("@repo/web", () => {
  test("renders the shared DocumentToolkit on the web surface", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("PDF info");
    expect(html).toContain("Image resize");
    expect(html).toContain("Web client");
  });
});
