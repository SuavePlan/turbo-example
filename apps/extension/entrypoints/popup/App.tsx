import { APP_NAME } from "@repo/core";
import { DocumentToolkit } from "@repo/ui";

const API_BASE_URL = "http://localhost:3000";

export function App() {
  return (
    <main className="bg-background p-4">
      <div className="mb-4 text-center">
        <h1 className="text-lg font-bold">{APP_NAME}</h1>
        <p className="text-xs text-muted-foreground">
          Browser extension (Chrome · Edge · Firefox · Safari)
        </p>
      </div>
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="extension" />
    </main>
  );
}
