import { createApp } from "./app.ts";

const app = createApp();
const port = Number(process.env.PORT ?? 3000);

console.log(`🚀 api listening on http://localhost:${port}  (docs: /ui, openapi: /doc)`);

export default {
  port,
  fetch: app.fetch,
};
