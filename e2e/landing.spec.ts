import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Distribuia");
  });

  test("has working navigation links", async ({ page }) => {
    await page.goto("/");

    // Footer links should exist
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /privacidad/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /términos|terminos/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /aviso legal/i })).toBeVisible();
  });

  test("shows company name in footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toContainText("Paragonum S.L.U.");
  });

  test("has CTA buttons", async ({ page }) => {
    await page.goto("/");
    const ctaLinks = page.getByRole("link", { name: /empieza|prueba|registr/i });
    await expect(ctaLinks.first()).toBeVisible();
  });
});
