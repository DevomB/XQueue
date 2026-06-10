import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("Download desktop")).toBeVisible();
});

test("disclaimer page loads", async ({ page }) => {
  await page.goto("/disclaimer");
  await expect(page.getByRole("heading")).toBeVisible();
});

test("no signup links on home", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href="/signup"]')).toHaveCount(0);
  await expect(page.locator('a[href="/login"]')).toHaveCount(0);
});
