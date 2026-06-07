import { APP_NAME } from "@repo/core";
import { DocumentToolkit } from "@repo/ui";

// In dev, Vite proxies /api -> the Hono gateway; in prod the static server does.
const API_BASE_URL = "/api";

export function App() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Web client · shared DocumentToolkit talking to the Hono + Python API
        </p>
      </div>
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="web" />
    </main>
  );
}
