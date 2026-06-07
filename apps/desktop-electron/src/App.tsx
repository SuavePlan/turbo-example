import { DocumentToolkit } from "@repo/ui";

// Electron can call the API cross-origin directly.
const API_BASE_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:3000";

export function App() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="electron" />
    </main>
  );
}
