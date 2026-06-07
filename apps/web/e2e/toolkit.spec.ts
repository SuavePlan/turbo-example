import { expect, test } from "@playwright/test";

test("renders the multilingual document toolkit", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Turbo Polyglot Showcase" })).toBeVisible();
  await expect(page.getByText("PDF info")).toBeVisible();
  await expect(page.getByText("Image resize")).toBeVisible();
  await expect(page.getByTestId("surface-label")).toContainText("web");
});

test("language switcher translates the UI to zh-CN", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("locale-select").selectOption("zh-CN");
  await expect(page.getByText("PDF 信息")).toBeVisible();
  await expect(page.getByText("图片缩放")).toBeVisible();
});

test("PDF upload shows parsed results from the API", async ({ page }) => {
  await page.route("**/api/pdf/info", async (route) => {
    await route.fulfill({
      json: { pages: 7, title: "E2E Report", sizeBytes: 1234, words: 999 },
    });
  });
  await page.goto("/");
  await page.getByLabel("pdf").setInputFiles({
    name: "sample.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("%PDF-1.4 e2e"),
  });
  const result = page.getByTestId("pdf-result");
  await expect(result).toContainText("7");
  await expect(result).toContainText("E2E Report");
});
