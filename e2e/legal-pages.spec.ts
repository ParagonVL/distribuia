import { test, expect } from "@playwright/test";

test.describe("Legal Pages", () => {
  test("privacy policy page loads with CIF", async ({ page }) => {
    await page.goto("/privacidad");
    await expect(page).toHaveTitle(/privacidad|privacy/i);
    await expect(page.locator("body")).toContainText("B26660944");
    await expect(page.locator("body")).toContainText("Paragonum S.L.U.");
  });

  test("terms of service page loads with CIF", async ({ page }) => {
    await page.goto("/terminos");
    await expect(page.locator("body")).toContainText("B26660944");
    await expect(page.locator("body")).toContainText("Paragonum S.L.U.");
  });

  test("aviso legal page loads with required information", async ({ page }) => {
    await page.goto("/aviso-legal");
    await expect(page.locator("body")).toContainText("B26660944");
    await expect(page.locator("body")).toContainText("Paragonum S.L.U.");
    await expect(page.locator("body")).toContainText("Valencia");
    await expect(page.locator("body")).toContainText("46007");
  });

  test("footer links navigate to correct pages", async ({ page }) => {
    await page.goto("/");

    // Click privacidad link in footer
    await page.locator("footer").getByRole("link", { name: /privacidad/i }).click();
    await expect(page).toHaveURL(/\/privacidad/);

    // Go back and click terminos
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: /términos|terminos/i }).click();
    await expect(page).toHaveURL(/\/terminos/);

    // Go back and click aviso legal
    await page.goto("/");
    await page.locator("footer").getByRole("link", { name: /aviso legal/i }).click();
    await expect(page).toHaveURL(/\/aviso-legal/);
  });
});
