import { DocumentToolkit } from "@repo/ui";

const API_BASE_URL = "http://localhost:3000";

export function App() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="electrobun" />
    </main>
  );
}
