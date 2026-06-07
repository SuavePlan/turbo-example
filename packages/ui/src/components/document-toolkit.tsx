import type { PdfInfoResponse, ResizeResponse } from "@repo/api-contract";
import { createClient } from "@repo/client";
import { createTranslator, defaultLocale, type Locale, localeNames, locales } from "@repo/i18n";
import { FileText, ImageIcon, Languages, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "./button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./card.tsx";

export interface DocumentToolkitProps {
  /** Base URL of the Hono API. Defaults to localhost:3000. */
  apiBaseUrl?: string;
  /** Optional label so each host (web/desktop/extension) can identify itself. */
  surface?: string;
  /** Initial language; the in-component switcher can change it. */
  defaultLocale?: Locale;
}

async function readBytes(file: File): Promise<Uint8Array> {
  return new Uint8Array(await file.arrayBuffer());
}

/**
 * DocumentToolkit — the shared, multilingual workflow at the heart of the
 * showcase. Upload a PDF (parsed by the Python `pypdf` service via the API) or
 * an image (resized by the Python `Pillow` service). The same component renders
 * on the web app, both desktop apps, and the browser extension, and every
 * string comes from the shared @repo/i18n catalog (en-GB / zh-CN).
 */
export function DocumentToolkit({
  apiBaseUrl,
  surface = "web",
  defaultLocale: initialLocale = defaultLocale,
}: DocumentToolkitProps) {
  const client = useMemo(() => createClient({ baseUrl: apiBaseUrl }), [apiBaseUrl]);
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const t = useMemo(() => createTranslator(locale), [locale]);
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
      <header className="grid gap-2 text-center">
        <h1 className="text-2xl font-bold">{t("appName")}</h1>
        <p className="text-sm text-muted-foreground">{t("tagline")}</p>
        <div className="flex items-center justify-center gap-2">
          <Languages className="size-4" aria-hidden />
          <label htmlFor="dt-locale" className="sr-only">
            {t("language")}
          </label>
          <select
            id="dt-locale"
            data-testid="locale-select"
            className="rounded-md border bg-background px-2 py-1 text-sm"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {localeNames[l]}
              </option>
            ))}
          </select>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-5" /> {t("pdf.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label htmlFor="dt-pdf" className="text-sm text-muted-foreground">
            {t("pdf.upload")}
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
              {`${t("pdf.pages")}: ${pdf.pages}\n${t("pdf.docTitle")}: ${pdf.title ?? "—"}\n${t("pdf.words")}: ${pdf.words}`}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="size-5" /> {t("image.title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          <label htmlFor="dt-image" className="text-sm text-muted-foreground">
            {t("image.upload")}
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
              data-testid="image-result"
            />
          )}
        </CardContent>
      </Card>

      {error && (
        <p className="text-sm text-destructive">
          {t("error")}: {error}
        </p>
      )}
      <p className="text-center text-xs text-muted-foreground" data-testid="surface-label">
        {t("renderedOn", { surface })}
      </p>
      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => client.health().catch(() => {})}>
          {t("pingApi")}
        </Button>
      </div>
    </div>
  );
}
