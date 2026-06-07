import { describe, expect, test } from "bun:test";
import { createToolkit } from "./toolkit.ts";

function stubFetch(payload: unknown): typeof fetch {
  return (async () =>
    new Response(JSON.stringify(payload), {
      headers: { "content-type": "application/json" },
    })) as unknown as typeof fetch;
}

describe("@repo/mobile toolkit", () => {
  test("describePdf summarizes the shared contract response", async () => {
    const toolkit = createToolkit(
      "http://api",
      stubFetch({ pages: 5, title: "Report", sizeBytes: 2048, words: 320 }),
    );
    const summary = await toolkit.describePdf(new Uint8Array([1, 2, 3]));
    expect(summary).toBe('5 page(s), 320 word(s) — "Report"');
  });
});
