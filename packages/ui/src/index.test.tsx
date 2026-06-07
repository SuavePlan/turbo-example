import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, DocumentToolkit } from "./index.ts";

describe("@repo/ui", () => {
  test("Button renders its label and variant classes", () => {
    const html = renderToStaticMarkup(<Button variant="outline">Click</Button>);
    expect(html).toContain("Click");
    expect(html).toContain("border");
  });

  test("DocumentToolkit renders both upload surfaces", () => {
    const html = renderToStaticMarkup(<DocumentToolkit surface="test" />);
    expect(html).toContain("PDF info");
    expect(html).toContain("Image resize");
    expect(html).toContain("test");
  });
});
