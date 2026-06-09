import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /queue your posts/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /github/i }).first()).toBeVisible();
});

test("signup page loads", async ({ page }) => {
  await page.goto("/signup");
  await expect(page.getByRole("heading", { name: /create your account/i })).toBeVisible();
});

test("signup rejects short password on submit", async ({ page }) => {
  await page.goto("/signup");
  await page.getByLabel(/email/i).fill("test@example.com");
  await page.getByLabel(/password/i).fill("short");
  await page.getByRole("button", { name: /create account/i }).click();
  await expect(page.getByLabel(/password/i)).toBeVisible();
});

test("login redirects unauthenticated dashboard to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("login shows error for invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/^email$/i).fill("nobody@example.com");
  await page.getByLabel(/^password$/i).fill("wrongpassword1");
  await page.getByRole("button", { name: /log in/i }).click();
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
});

test("forgot password page loads", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page.getByRole("heading", { name: /reset password/i })).toBeVisible();
});
