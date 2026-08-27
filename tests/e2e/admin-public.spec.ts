import { test, expect } from "@playwright/test";

test("admin routes remain protected when unauthenticated", async ({ page }) => {
  await page.goto("/vi/admin", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 60_000 }).toMatch(/\/vi\/login/);
});
