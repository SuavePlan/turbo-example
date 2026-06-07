import type { PdfInfoResponse, ResizeResponse } from "@repo/api-contract";
import { createClient } from "@repo/client";
import { FileText, ImageIcon, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./card.tsx";

export interface DocumentToolkitProps {
  /** Base URL of the Hono API. Defaults to localhost:3000. */
  apiBaseUrl?: string;
  /** Optional label so each host (web/desktop/extension) can identify itself. */
  surface?: string;
}

async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * DocumentToolkit — the shared workflow at the heart of the showcase.
 *
 * Upload a PDF (parsed by the Python `pypdf` service via the API) or an image
 * (resized by the Python `Pillow` service via the API). The very same component
 * is rendered by the web app, both desktop apps, and the browser extension, so
 * every surface exercises the same cross-language pipeline.
 */
export function DocumentToolkit({ apiBaseUrl, surface = "web" }: DocumentToolkitProps) {
  const client = useMemo(() => createClient({ baseUrl: apiBaseUrl }), [apiBaseUrl]);
  const [busy, setBusy] = useState<"pdf" | "image" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdf, setPdf] = useState<PdfInfoResponse | null>(null);
  const [image, setImage] = useState<ResizeResponse | null>(null);

  async function onPdf(file: File | undefined) {
    if (!file) return;
    setBusy("pdf");
    setError(null);
    try {
      setPdf(await client.pdfInfo(await readBytes(file)));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  async function onImage(file: File | undefined) {
    if (!file) return;
    setBusy("image");
    setError(null);
    try {
      setImage(await client.resizeImage(await readBytes(file), 256, 256, "png"));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" /> PDF info
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label htmlFor="dt-pdf" className="text-sm text-muted-foreground">
            Upload a PDF — parsed by the Python service.
          </label>
          <input
            id="dt-pdf"
            type="file"
            accept="application/pdf"
            aria-label="pdf"
            onChange={(e) => onPdf(e.target.files?.[0])}
          />
          {busy === "pdf" && <Loader2 className="size-4 animate-spin" />}
          {pdf && (
            <pre className="rounded-md bg-muted p-3 text-sm" data-testid="pdf-result">
              {`pages: ${pdf.pages}\ntitle: ${pdf.title ?? "—"}\nwords: ${pdf.words}`}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" /> Image resize
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label htmlFor="dt-image" className="text-sm text-muted-foreground">
            Upload an image — resized to 256×256 by the Python service.
          </label>
          <input
            id="dt-image"
            type="file"
            accept="image/*"
            aria-label="image"
            onChange={(e) => onImage(e.target.files?.[0])}
          />
          {busy === "image" && <Loader2 className="size-4 animate-spin" />}
          {image && (
            <img
              src={`data:image/${image.format};base64,${image.data}`}
              alt="resized result"
              className="rounded-md border"
              width={128}
              height={128}
            />
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">Error: {error}</p>}
      <p className="text-center text-xs text-muted-foreground">
        Rendered on <strong>{surface}</strong> · powered by @repo/ui + @repo/client
      </p>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => client.health().catch(() => {})}>
          Ping API
        </Button>
      </div>
    </div>
  );
}
