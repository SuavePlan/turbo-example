import { APP_NAME } from "@repo/core";
import { DocumentToolkit } from "@repo/ui";

// Electron can call the API cross-origin directly.
const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";

export function App() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Electron desktop client</p>
      </div>
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="electron" />
    </main>
  );
}
