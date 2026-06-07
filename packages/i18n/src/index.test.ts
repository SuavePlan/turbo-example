import { describe, expect, test } from "bun:test";
import { createTranslator, locales, messages, resolveLocale } from "./index.ts";

describe("@repo/i18n", () => {
  test("translates a key per locale", () => {
    expect(createTranslator("en-GB")("pdf.title")).toBe("PDF info");
    expect(createTranslator("zh-CN")("pdf.title")).toBe("PDF 信息");
  });

  test("interpolates params", () => {
    expect(createTranslator("en-GB")("renderedOn", { surface: "web" })).toBe("Rendered on web");
  });

  test("resolveLocale maps language tags", () => {
    expect(resolveLocale("zh-Hans-CN")).toBe("zh-CN");
    expect(resolveLocale("en-US")).toBe("en-GB");
    expect(resolveLocale(undefined)).toBe("en-GB");
  });

  test("every locale defines every key", () => {
    const keys = Object.keys(messages["en-GB"]);
    for (const locale of locales) {
      expect(Object.keys(messages[locale]).sort()).toEqual(keys.sort());
    }
  });
});
