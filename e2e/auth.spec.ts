import { test, expect } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /iniciar sesión|login/i })).toBeVisible();
    await expect(page.getByLabel(/email|correo/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();
  });

  test("signup page renders with legal links", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByLabel(/email|correo/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña|password/i)).toBeVisible();

    // Legal links should point to Spanish routes
    const termsLink = page.getByRole("link", { name: /términos|condiciones/i });
    await expect(termsLink).toHaveAttribute("href", "/terminos");

    const privacyLink = page.getByRole("link", { name: /privacidad/i });
    await expect(privacyLink).toHaveAttribute("href", "/privacidad");
  });

  test("login shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email|correo/i).fill("nonexistent@example.com");
    await page.getByLabel(/contraseña|password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /iniciar|login|entrar/i }).click();

    // Should show an error message
    await expect(page.getByText(/error|inválid|incorrect/i)).toBeVisible({ timeout: 10000 });
  });

  test("signup validates password length", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText(/mínimo 8/i)).toBeVisible();
  });

  test("unauthenticated users are redirected from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
