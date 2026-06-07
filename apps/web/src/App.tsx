import { DocumentToolkit } from "@repo/ui";

// In dev, Vite proxies /api -> the Hono gateway; in prod the static server does.
const API_BASE_URL = "/api";

export function App() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="web" />
    </main>
  );
}
