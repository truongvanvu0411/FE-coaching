import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("public pages", () => {
  test("login is usable and has no critical accessibility violations", async ({ page }) => {
    await page.goto("/vi/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page).toHaveTitle(/FE Coach/i);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();

    const results = await new AxeBuilder({ page }).analyze();
    const critical = results.violations.filter((violation) => violation.impact === "critical");
    expect(critical, JSON.stringify(critical, null, 2)).toEqual([]);
  });

  test("register is responsive without horizontal overflow", async ({ page }) => {
    await page.goto("/vi/register", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
  });
});

test.describe("route guards", () => {
  for (const route of ["/vi", "/vi/practice", "/vi/mock-exam", "/vi/bookmarks", "/vi/progress"]) {
    test(`${route} redirects unauthenticated users`, async ({ page }) => {
      await page.goto(route, { waitUntil: "domcontentloaded", timeout: 60_000 });
      await expect.poll(() => new URL(page.url()).pathname, { timeout: 60_000 }).toMatch(/\/vi\/login/);
    });
  }
});
