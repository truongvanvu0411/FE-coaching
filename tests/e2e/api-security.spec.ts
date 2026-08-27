import { test, expect, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@fecoach.local";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "ChangeMe123!";
const pendingQuestionId = process.env.E2E_PENDING_QUESTION_ID ?? "FE-A-DRAFT-1785392019962";

async function login(page: Page) {
  await page.goto("/vi/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.getByRole("button", { name: /đăng nhập|login/i }).click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 60_000 }).toBe("/vi");
}

test("protected mutation APIs reject unauthenticated requests", async ({ request }) => {
  const cases = [
    ["/api/practice/answer", { questionId: "invalid", chosenAnswer: "A" }],
    ["/api/bookmarks", { questionId: "invalid" }],
    ["/api/flags", { questionId: "invalid", reason: "UAT" }],
    ["/api/tutor", { questionId: "invalid", action: "explain" }],
    ["/api/tutor/generate-similar", { questionId: "invalid" }],
  ] as const;

  for (const [url, data] of cases) {
    const response = await request.post(url, { data });
    expect(response.status(), url).toBe(401);
  }
});

test("registration validates input and rejects duplicate accounts", async ({ request }) => {
  const invalid = await request.post("/api/auth/register", {
    data: { name: "", email: "not-an-email", password: "short" },
  });
  expect(invalid.status()).toBe(400);

  const duplicate = await request.post("/api/auth/register", {
    data: { name: "Existing admin", email: "admin@fecoach.local", password: "ChangeMe123!" },
  });
  expect(duplicate.status()).toBe(409);
});

test("learner APIs reject pending questions", async ({ page }) => {
  await login(page);
  const cases = [
    ["/api/practice/answer", { questionId: pendingQuestionId, chosenAnswer: "A" }],
    ["/api/bookmarks", { questionId: pendingQuestionId }],
    ["/api/flags", { questionId: pendingQuestionId, reason: "UAT" }],
    ["/api/tutor", { questionId: pendingQuestionId, action: "explain" }],
    ["/api/tutor/generate-similar", { questionId: pendingQuestionId }],
  ] as const;

  for (const [url, data] of cases) {
    const response = await page.request.post(url, { data });
    expect(response.status(), url).toBe(404);
  }
});
