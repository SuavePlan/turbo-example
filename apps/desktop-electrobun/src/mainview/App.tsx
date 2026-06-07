import { APP_NAME } from "@repo/core";
import { DocumentToolkit } from "@repo/ui";

const API_BASE_URL = "http://localhost:3000";

export function App() {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">Electrobun desktop client (bun-native)</p>
      </div>
      <DocumentToolkit apiBaseUrl={API_BASE_URL} surface="electrobun" />
    </main>
  );
}
