import { z } from "zod";

/**
 * @repo/api-contract — the single source of truth for the HTTP boundary.
 *
 * These Zod schemas are consumed by the Hono API (where they become the
 * OpenAPI document) and by every client (web, extension, desktop) so request
 * and response types stay in lockstep across languages and runtimes.
 */

export const HealthResponse = z.object({
  status: z.literal("ok"),
  service: z.string(),
  version: z.string(),
});
export type HealthResponse = z.infer<typeof HealthResponse>;

export const PdfInfoResponse = z.object({
  pages: z.number().int().nonnegative(),
  title: z.string().nullable(),
  sizeBytes: z.number().int().nonnegative(),
  words: z.number().int().nonnegative(),
});
export type PdfInfoResponse = z.infer<typeof PdfInfoResponse>;

export const ImageFormat = z.enum(["png", "jpeg", "webp"]);
export type ImageFormat = z.infer<typeof ImageFormat>;

export const ResizeRequest = z.object({
  /** Base64-encoded source image bytes. */
  data: z.string().min(1),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  format: ImageFormat.default("png"),
});
export type ResizeRequest = z.infer<typeof ResizeRequest>;

export const ResizeResponse = z.object({
  /** Base64-encoded resized image bytes. */
  data: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  format: ImageFormat,
  sizeBytes: z.number().int().nonnegative(),
});
export type ResizeResponse = z.infer<typeof ResizeResponse>;

export const ErrorResponse = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponse>;
