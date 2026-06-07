import { describe, expect, test } from "bun:test";
import { PdfInfoResponse, ResizeRequest } from "./index.ts";

describe("api-contract", () => {
  test("ResizeRequest applies the default format", () => {
    const parsed = ResizeRequest.parse({ data: "abc", width: 100, height: 50 });
    expect(parsed.format).toBe("png");
  });

  test("PdfInfoResponse rejects negative page counts", () => {
    const result = PdfInfoResponse.safeParse({
      pages: -1,
      title: null,
      sizeBytes: 10,
      words: 0,
    });
    expect(result.success).toBe(false);
  });
});
