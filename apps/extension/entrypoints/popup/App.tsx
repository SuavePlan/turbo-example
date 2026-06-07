import { DocumentToolkit } from "@repo/ui";

const API_BASE_URL = "http://localhost:3000";

export function App() {
  return (
    <main className="bg-background p-4">
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="extension" />
    </main>
  );
}
