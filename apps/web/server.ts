import { Hono } from "hono";
import { serveStatic } from "hono/bun";

/**
 * Production static server for the built web app (Bun + Hono).
 * Serves ./dist and forwards /api/* to the Hono API gateway so the browser
 * talks to one origin.
 */
const app = new Hono();
const API_URL = (process.env.API_URL ?? "http://localhost:3000").replace(/\/$/, "");

app.all("/api/*", (c) => {
  const url = new URL(c.req.url);
  const target = `${API_URL}${url.pathname.replace(/^\/api/, "")}${url.search}`;
  return fetch(target, {
    method: c.req.method,
    headers: c.req.raw.headers,
    body: c.req.method === "GET" || c.req.method === "HEAD" ? undefined : c.req.raw.body,
  });
});

app.use("/*", serveStatic({ root: "./dist" }));
// SPA fallback for client-side routes.
app.get("*", serveStatic({ path: "./dist/index.html" }));

const port = Number(process.env.PORT ?? 4173);
console.log(`🌐 web served on http://localhost:${port}`);

export default { port, fetch: app.fetch };
