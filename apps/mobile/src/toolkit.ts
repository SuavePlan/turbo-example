import { createClient } from "@repo/client";

/**
 * The mobile app can't use @repo/ui (DOM/Tailwind), but it shares the exact
 * same workflow logic through @repo/client + @repo/api-contract. This thin
 * wrapper is what the React Native screen calls, and what the unit test covers.
 */
export function createToolkit(baseUrl?: string, fetchImpl?: typeof fetch) {
  const client = createClient({ baseUrl, fetch: fetchImpl });
  return {
    baseUrl: client.baseUrl,
    async describePdf(bytes: Uint8Array): Promise<string> {
      const info = await client.pdfInfo(bytes);
      return `${info.pages} page(s), ${info.words} word(s)${info.title ? ` — "${info.title}"` : ""}`;
    },
    async resizeToThumbnail(bytes: Uint8Array): Promise<string> {
      const out = await client.resizeImage(bytes, 128, 128, "png");
      return `data:image/${out.format};base64,${out.data}`;
    },
  };
}
