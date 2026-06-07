/**
 * @repo/client — the one typed API client shared by every frontend
 * (web, desktop x2, mobile, extension). It speaks the @repo/api-contract
 * schemas, so the whole "Document Toolkit" workflow — upload a PDF or image,
 * the API hands it to the Python service, get structured results back — is
 * implemented exactly once and reused everywhere.
 */

import {
  type HealthResponse,
  HealthResponse as HealthSchema,
  type ImageFormat,
  type PdfInfoResponse,
  PdfInfoResponse as PdfInfoSchema,
  type ResizeResponse,
  ResizeResponse as ResizeSchema,
} from "@repo/api-contract";

export interface ClientOptions {
  /** Base URL of the Hono API, e.g. http://localhost:3000 */
  baseUrl?: string;
  /** Injectable fetch for tests / non-browser runtimes. */
  fetch?: typeof fetch;
}

export const DEFAULT_BASE_URL = "http://localhost:3000";

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  // btoa exists in browsers, Bun, and React Native (via polyfill).
  return btoa(binary);
}

export function createClient(options: ClientOptions = {}) {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const doFetch = options.fetch ?? fetch;

  async function getJson<T>(path: string, schema: { parse: (v: unknown) => T }): Promise<T> {
    const res = await doFetch(`${baseUrl}${path}`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return schema.parse(await res.json());
  }

  async function postJson<T>(
    path: string,
    body: unknown,
    schema: { parse: (v: unknown) => T },
  ): Promise<T> {
    const res = await doFetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return schema.parse(await res.json());
  }

  return {
    baseUrl,
    health(): Promise<HealthResponse> {
      return getJson("/health", HealthSchema);
    },
    /** Upload PDF bytes; the API + Python return page/title/word stats. */
    pdfInfo(pdf: Uint8Array): Promise<PdfInfoResponse> {
      return postJson("/pdf/info", { data: toBase64(pdf) }, PdfInfoSchema);
    },
    /** Upload image bytes + target size; get a resized image back. */
    resizeImage(
      image: Uint8Array,
      width: number,
      height: number,
      format: ImageFormat = "png",
    ): Promise<ResizeResponse> {
      return postJson(
        "/image/resize",
        { data: toBase64(image), width, height, format },
        ResizeSchema,
      );
    },
  };
}

export type ApiClient = ReturnType<typeof createClient>;
