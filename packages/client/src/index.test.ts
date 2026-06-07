import { describe, expect, test } from "bun:test";
import { createClient } from "./index.ts";

function stubFetch(payload: unknown): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch;
}

describe("@repo/client", () => {
  test("pdfInfo parses a contract-valid response", async () => {
    const client = createClient({
      baseUrl: "http://test",
      fetch: stubFetch({ pages: 3, title: "Doc", sizeBytes: 1024, words: 120 }),
    });
    const info = await client.pdfInfo(new Uint8Array([1, 2, 3]));
    expect(info.pages).toBe(3);
    expect(info.title).toBe("Doc");
  });

  test("strips trailing slash from baseUrl", () => {
    const client = createClient({ baseUrl: "http://test/" });
    expect(client.baseUrl).toBe("http://test");
  });
});
