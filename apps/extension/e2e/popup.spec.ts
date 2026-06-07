import { expect, test } from "./fixtures";

test("popup renders the shared toolkit", async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await expect(page.getByRole("heading", { name: "Turbo Polyglot Showcase" })).toBeVisible();
  await expect(page.getByText("PDF info")).toBeVisible();
  await expect(page.getByTestId("surface-label")).toContainText("extension");
});

test("popup switches language to zh-CN", async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.getByTestId("locale-select").selectOption("zh-CN");
  await expect(page.getByText("PDF 信息")).toBeVisible();
});

test("popup shows PDF results from a stubbed API", async ({ context, extensionId }) => {
  const page = await context.newPage();
  await page.route("**/pdf/info", async (route) => {
    await route.fulfill({
      json: { pages: 4, title: "Ext E2E", sizeBytes: 10, words: 42 },
    });
  });
  await page.goto(`chrome-extension://${extensionId}/popup.html`);
  await page.getByLabel("pdf").setInputFiles({
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4"),
  });
  const result = page.getByTestId("pdf-result");
  await expect(result).toContainText("4");
  await expect(result).toContainText("Ext E2E");
});
