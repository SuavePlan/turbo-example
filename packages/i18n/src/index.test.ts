import { describe, expect, test } from "bun:test";
import {
  createTranslator,
  locales,
  messages,
  resolveAcceptLanguage,
  resolveLocale,
} from "./index.ts";

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

  test("resolveAcceptLanguage honours q-weights", () => {
    expect(resolveAcceptLanguage("zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh-CN");
    expect(resolveAcceptLanguage("en-US,en;q=0.9,zh;q=0.2")).toBe("en-GB");
    expect(resolveAcceptLanguage("fr-FR,zh;q=0.7,en;q=0.6")).toBe("zh-CN");
    expect(resolveAcceptLanguage(null)).toBe("en-GB");
  });

  test("every locale defines every key", () => {
    const keys = Object.keys(messages["en-GB"]);
    for (const locale of locales) {
      expect(Object.keys(messages[locale]).sort()).toEqual(keys.sort());
    }
  });
});
