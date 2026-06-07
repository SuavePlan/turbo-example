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

  test("localises the 502 error via Accept-Language", async () => {
    const stub: typeof fetch = (async () => {
      throw new Error("ECONNREFUSED");
    }) as unknown as typeof fetch;
    const app = createApp({ pythonApiUrl: "http://python", fetch: stub });

    const en = await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json", "accept-language": "en-GB" },
      body: JSON.stringify({ data: "abc" }),
    });
    expect((await en.json()).error).toContain("unreachable");

    const zh = await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json", "accept-language": "zh-CN" },
      body: JSON.stringify({ data: "abc" }),
    });
    expect((await zh.json()).error).toContain("无法连接");
  });

  test("forwards the python service's localised error detail", async () => {
    const stub: typeof fetch = (async () =>
      Response.json({ detail: "无法解析该 PDF。" }, { status: 422 })) as unknown as typeof fetch;
    const app = createApp({ pythonApiUrl: "http://python", fetch: stub });
    const res = await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json", "accept-language": "zh-CN" },
      body: JSON.stringify({ data: "abc" }),
    });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toBe("无法解析该 PDF。");
  });

  test("falls back to a localised status message when upstream gives no JSON detail", async () => {
    const stub: typeof fetch = (async () =>
      new Response("oops", { status: 500 })) as unknown as typeof fetch;
    const app = createApp({ pythonApiUrl: "http://python", fetch: stub });
    const res = await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json", "accept-language": "zh-CN" },
      body: JSON.stringify({ data: "abc" }),
    });
    expect(res.status).toBe(502);
    expect((await res.json()).error).toContain("500");
  });

  test("forwards Accept-Language to the python service", async () => {
    let forwarded = "";
    const stub: typeof fetch = (async (_url: string, init: RequestInit) => {
      forwarded = new Headers(init.headers).get("accept-language") ?? "";
      return Response.json({ pages: 1, title: null, sizeBytes: 1, words: 0 });
    }) as unknown as typeof fetch;
    const app = createApp({ pythonApiUrl: "http://python", fetch: stub });
    await app.request("/pdf/info", {
      method: "POST",
      headers: { "content-type": "application/json", "accept-language": "zh-CN" },
      body: JSON.stringify({ data: "abc" }),
    });
    expect(forwarded).toBe("zh-CN");
  });
});
