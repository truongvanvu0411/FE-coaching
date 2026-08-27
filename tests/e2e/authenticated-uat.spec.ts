import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@fecoach.local";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "ChangeMe123!";

async function login(page: Page) {
  await page.goto("/vi/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.getByRole("button", { name: /đăng nhập|login/i }).click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 60_000 }).toBe("/vi");
}

test.describe("authenticated learner UAT", () => {
  test("practice session answers, persists navigation and exposes learner actions", async ({ page }) => {
    await login(page);
    await page.goto("/vi/practice", { waitUntil: "domcontentloaded", timeout: 60_000 });
    const startPractice = page.locator('a[href*="/practice/session"]').first();
    await expect(startPractice).toBeVisible();

    await startPractice.click();
    await expect(page.locator("button.min-h-14").first()).toBeVisible({ timeout: 60_000 });
    const accessibility = await new AxeBuilder({ page }).analyze();
    const seriousViolations = accessibility.violations.filter((violation) => violation.impact === "critical" || violation.impact === "serious");
    expect(seriousViolations, JSON.stringify(seriousViolations, null, 2)).toEqual([]);

    await page.route("**/api/tutor", async (route) => {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ content: "UAT tutor response" }) });
    });

    const answer = page.locator("button.min-h-14").first();
    await answer.click();
    await expect(answer).toBeDisabled();
    if ((page.viewportSize()?.width ?? 0) >= 768) {
      const explain = page.getByRole("button", { name: /giải thích giúp|explain/i });
      await expect(explain).toBeVisible();
      await explain.click();
      await expect(page.getByText("UAT tutor response")).toBeVisible();
    }
    await expect(page.getByRole("button", { name: /lưu lại|bookmark/i })).toBeVisible();

    const bookmark = page.getByRole("button", { name: /lưu lại|bookmark/i });
    await bookmark.click();
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await bookmark.click();
    await expect(bookmark).toHaveAttribute("aria-pressed", "false");

    await page.getByRole("button", { name: /báo lỗi câu hỏi|flag/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("dialog").getByRole("textbox").fill("UAT test flag");
    const flagResponse = page.waitForResponse((response) => response.url().includes("/api/flags") && response.request().method() === "POST");
    await page.getByRole("dialog").getByRole("button", { name: /gửi|submit/i }).click();
    expect((await flagResponse).status()).toBe(201);
    await expect(page.getByRole("dialog")).toBeHidden({ timeout: 15_000 });
  });

  test("mock exam route loads with timer and answer flow", async ({ page }) => {
    await login(page);
    await page.goto("/vi/mock-exam", { waitUntil: "domcontentloaded", timeout: 60_000 });
    const startMockExam = page.locator('a[href*="/mock-exam/session"]').first();
    await expect(startMockExam).toBeVisible();
    await startMockExam.click();
    await expect(page.locator("button.min-h-14").first()).toBeVisible({ timeout: 60_000 });

    await page.locator("button.min-h-14").first().click();
    await expect(page.locator("button.min-h-14").first()).toBeDisabled();
    await expect(page.getByText(/thời gian còn lại|time remaining/i)).toBeVisible();
  });

  test("admin dashboard is reachable only after authentication", async ({ page }) => {
    await login(page);
    await page.goto("/vi/admin", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await expect(page).toHaveURL(/\/vi\/admin$/);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });
});
