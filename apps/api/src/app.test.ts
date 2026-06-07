import { describe, expect, test } from "bun:test";
import { createApp } from "./app.ts";

describe("@repo/api", () => {
  test("GET /health reports the api service", async () => {
    const app = createApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok", service: "api", version: "0.0.0" });
  });

  test("GET /doc exposes the OpenAPI document", async () => {
    const app = createApp();
    const res = await app.request("/doc");
    expect(res.status).toBe(200);
    const doc = (await res.json()) as { paths: Record<string, unknown> };
    expect(doc.paths["/pdf/info"]).toBeDefined();
    expect(doc.paths["/image/resize"]).toBeDefined();
  });

  test("POST /pdf/info proxies to the python service", async () => {
    const stub: typeof fetch = (async (url: string | URL) => {
      expect(String(url)).toContain("/pdf/info");
      return Response.json({ pages: 2, title: null, sizeBytes: 10, words: 0 });
    }) as unknown as typeof fetch;

    const app = createApp({ pythonApiUrl: "http://python", fetch: stub });
    const res = await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: "aGVsbG8=" }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).pages).toBe(2);
  });

  test("POST /pdf/info rejects an invalid body (contract validation)", async () => {
    const app = createApp();
    const res = await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  test("returns 502 when the python service is unreachable", async () => {
    const stub: typeof fetch = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    const app = createApp({ pythonApiUrl: "http://python", fetch: stub });
    const res = await app.request("/image/resize", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: "abc", width: 10, height: 10, format: "png" }),
    });
    expect(res.status).toBe(502);
  });
});
