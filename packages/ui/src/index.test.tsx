import { describe, expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { Button, DocumentToolkit } from "./index.ts";

describe("@repo/ui", () => {
  test("Button renders its label and variant classes", () => {
    const html = renderToStaticMarkup(<Button variant="outline">Click</Button>);
    expect(html).toContain("Click");
    expect(html).toContain("border");
  });

  test("DocumentToolkit renders both upload surfaces (en-GB default)", () => {
    const html = renderToStaticMarkup(<DocumentToolkit surface="test" />);
    expect(html).toContain("PDF info");
    expect(html).toContain("Image resize");
    expect(html).toContain("Rendered on test");
  });

  test("DocumentToolkit honours an initial locale (zh-CN)", () => {
    const html = renderToStaticMarkup(<DocumentToolkit surface="test" defaultLocale="zh-CN" />);
    expect(html).toContain("PDF 信息");
    expect(html).toContain("图片缩放");
  });

  test("DocumentToolkit exposes a language switcher", () => {
    const html = renderToStaticMarkup(<DocumentToolkit surface="test" />);
    expect(html).toContain('data-testid="locale-select"');
    expect(html).toContain("简体中文");
  });
});
