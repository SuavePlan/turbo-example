import { swaggerUI } from "@hono/swagger-ui";
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import {
  ErrorResponse,
  HealthResponse,
  PdfInfoResponse,
  ResizeRequest,
  ResizeResponse,
} from "@repo/api-contract";
import { APP_NAME } from "@repo/core";

export interface AppOptions {
  /** Base URL of the Python FastAPI sidecar. */
  pythonApiUrl?: string;
  /** Injectable fetch so tests can stub the upstream Python service. */
  fetch?: typeof fetch;
}

const PdfInfoRequest = z.object({
  /** Base64-encoded PDF bytes. */
  data: z.string().min(1),
});

/**
 * The Hono API. It owns the OpenAPI contract (from @repo/api-contract) and
 * proxies the heavy lifting to the Python FastAPI sidecar, so the TypeScript
 * and Python halves of the monorepo cooperate on one workflow.
 */
export function createApp(opts: AppOptions = {}) {
  const pythonApiUrl = (
    opts.pythonApiUrl ??
    process.env.PYTHON_API_URL ??
    "http://localhost:8000"
  ).replace(/\/$/, "");
  const upstream = opts.fetch ?? fetch;
  const app = new OpenAPIHono();

  type Forwarded<T> = { ok: true; data: T } | { ok: false; error: string };

  async function callPython<T>(path: string, body: unknown): Promise<Forwarded<T>> {
    try {
      const res = await upstream(`${pythonApiUrl}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        return { ok: false, error: `python-api responded ${res.status}` };
      }
      return { ok: true, data: (await res.json()) as T };
    } catch {
      return { ok: false, error: `python-api unreachable at ${pythonApiUrl}` };
    }
  }

  app.openapi(
    createRoute({
      method: "get",
      path: "/health",
      summary: "Liveness probe",
      responses: {
        200: {
          description: "API is healthy",
          content: { "application/json": { schema: HealthResponse } },
        },
      },
    }),
    (c) => c.json({ status: "ok", service: "api", version: "0.0.0" } as const, 200),
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/pdf/info",
      summary: "Parse a PDF (delegated to the Python service)",
      request: {
        body: { content: { "application/json": { schema: PdfInfoRequest } } },
      },
      responses: {
        200: {
          description: "PDF statistics",
          content: { "application/json": { schema: PdfInfoResponse } },
        },
        502: {
          description: "Upstream Python service error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    }),
    async (c) => {
      const result = await callPython<z.infer<typeof PdfInfoResponse>>(
        "/pdf/info",
        c.req.valid("json"),
      );
      if (!result.ok) return c.json({ error: result.error }, 502);
      return c.json(result.data, 200);
    },
  );

  app.openapi(
    createRoute({
      method: "post",
      path: "/image/resize",
      summary: "Resize an image (delegated to the Python service)",
      request: {
        body: { content: { "application/json": { schema: ResizeRequest } } },
      },
      responses: {
        200: {
          description: "Resized image",
          content: { "application/json": { schema: ResizeResponse } },
        },
        502: {
          description: "Upstream Python service error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    }),
    async (c) => {
      const result = await callPython<z.infer<typeof ResizeResponse>>(
        "/image/resize",
        c.req.valid("json"),
      );
      if (!result.ok) return c.json({ error: result.error }, 502);
      return c.json(result.data, 200);
    },
  );

  app.doc("/doc", {
    openapi: "3.0.0",
    info: { title: `${APP_NAME} API`, version: "0.0.0" },
  });
  app.get("/ui", swaggerUI({ url: "/doc" }));

  return app;
}

export type App = ReturnType<typeof createApp>;
