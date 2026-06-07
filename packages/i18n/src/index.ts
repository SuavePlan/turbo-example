import { defaultLocale, type Locale, type MessageKey, messages } from "./messages.ts";

export {
  defaultLocale,
  type Locale,
  localeNames,
  locales,
  type MessageKey,
  messages,
} from "./messages.ts";

/** Normalise an arbitrary locale string (e.g. "en", "zh", "zh-Hans-CN"). */
export function resolveLocale(input: string | undefined | null): Locale {
  if (!input) return defaultLocale;
  const lower = input.toLowerCase();
  if (lower.startsWith("zh")) return "zh-CN";
  if (lower.startsWith("en")) return "en-GB";
  return defaultLocale;
}

/**
 * Resolve a locale from an HTTP `Accept-Language` header, honouring q-weights,
 * so the backend apps can answer in the caller's language.
 */
export function resolveAcceptLanguage(header: string | undefined | null): Locale {
  if (!header) return defaultLocale;
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      const weight = q ? Number.parseFloat(q.split("=")[1] ?? "1") : 1;
      return { tag: (tag ?? "").trim(), weight: Number.isNaN(weight) ? 1 : weight };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((a, b) => b.weight - a.weight);

  for (const { tag } of ranked) {
    const lower = tag.toLowerCase();
    if (lower.startsWith("zh")) return "zh-CN";
    if (lower.startsWith("en")) return "en-GB";
  }
  return defaultLocale;
}

export type Translator = (key: MessageKey, params?: Record<string, string | number>) => string;

/** Build a translator for a locale, falling back to the default locale. */
export function createTranslator(locale: Locale = defaultLocale): Translator {
  const table = messages[locale] ?? messages[defaultLocale];
  return (key, params) => {
    let value = table[key] ?? messages[defaultLocale][key] ?? key;
    if (params) {
      for (const [name, replacement] of Object.entries(params)) {
        value = value.replaceAll(`{${name}}`, String(replacement));
      }
    }
    return value;
  };
}
