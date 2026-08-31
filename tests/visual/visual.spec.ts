import { test, expect, type Page } from "@playwright/test";

// Visual baseline for the UI rebuild (docs/ui-rebuild-todo.md, phase 0).
//
// Phases 0a and 0b of the rebuild must not change a single pixel: they declare
// design tokens and then point the existing hardcoded colours at them. These
// snapshots are what turns that from a claim into a test.

const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@fecoach.local";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "ChangeMe123!";

const LOCALES = ["vi", "ja"] as const;
const THEMES = ["light", "dark"] as const;

// Screens whose rendering depends only on the question bank, never on the
// signed-in user's history. Stable across runs without any masking.
const STABLE_SCREENS = [
  { slug: "practice", path: "/practice" },
  { slug: "mock-exam", path: "/mock-exam" },
  { slug: "bookmarks", path: "/bookmarks" },
] as const;

// These read attempt counts, accuracy and streak, so they only hold still while
// nothing answers a question. That is true for two consecutive runs of this
// file, which is exactly the comparison phases 0a/0b need — but a run of the
// functional suite in between invalidates them. Re-capture if that happens.
const HISTORY_SCREENS = [
  { slug: "home", path: "/" },
  { slug: "progress", path: "/progress" },
] as const;

/**
 * next-themes owns the `dark` class and reapplies it from localStorage on
 * hydration, so setting the class directly loses a race. Seed its storage key
 * before any script runs instead. Clicking the toggle is worse still: it
 * animates, and the screenshot races the transition.
 */
async function pinTheme(page: Page, theme: (typeof THEMES)[number]) {
  await page.addInitScript((value) => {
    window.localStorage.setItem("theme", value);
  }, theme);
}

async function login(page: Page) {
  await page.goto("/vi/login", { waitUntil: "domcontentloaded", timeout: 60_000 });
  await page.getByLabel(/email/i).fill(adminEmail);
  await page.locator('input[type="password"]').fill(adminPassword);
  await page.getByRole("button", { name: /đăng nhập|login/i }).click();
  await expect.poll(() => new URL(page.url()).pathname, { timeout: 60_000 }).toBe("/vi");
}

async function settle(page: Page) {
  // Fonts decide layout. Screenshotting before they resolve produces a diff on
  // the next run for no reason at all.
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

test.describe("visual baseline", () => {
  test("login page", async ({ page }) => {
    for (const theme of THEMES) {
      for (const locale of LOCALES) {
        await pinTheme(page, theme);
        await page.goto(`/${locale}/login`, { waitUntil: "domcontentloaded", timeout: 60_000 });
        await settle(page);
        await expect(page).toHaveScreenshot(`${locale}-${theme}-login.png`, { fullPage: true });
      }
    }
  });

  test("authenticated screens", async ({ page }) => {
    for (const theme of THEMES) {
      await pinTheme(page, theme);
      await login(page);

      for (const locale of LOCALES) {
        for (const screen of [...STABLE_SCREENS, ...HISTORY_SCREENS]) {
          await page.goto(`/${locale}${screen.path}`, { waitUntil: "domcontentloaded", timeout: 60_000 });
          await settle(page);
          await expect(page).toHaveScreenshot(`${locale}-${theme}-${screen.slug}.png`, { fullPage: true });
        }
      }
    }
  });

  /**
   * The two session screens draw their questions at random — pickRandomQuestions
   * picks a random offset and then shuffles, and no URL parameter constrains it.
   * There is no (topic, difficulty) combination in the database with a single
   * question either; the smallest is 32. So a full-page snapshot here would diff
   * on every run for reasons that have nothing to do with CSS.
   *
   * The header bar is content-independent — mode label, "n / total", and the
   * progress track — and it carries the largest block of hardcoded colour in the
   * file (session-runner.tsx:150). It gets an element snapshot via
   * data-testid="session-chrome" rather than a class selector, so restyling
   * cannot break the test that is meant to police restyling.
   *
   * Not covered here, and needing a manual look during phase 0b: the timer chip
   * (line 157, mock-exam only) and the end-of-session score card (lines
   * 113-117), whose score varies with the answers given.
   */
  test("practice session chrome", async ({ page }) => {
    for (const theme of THEMES) {
      await pinTheme(page, theme);
      await login(page);

      await page.goto("/vi/practice/session?count=10&hideObsolete=true", {
        waitUntil: "domcontentloaded",
        timeout: 60_000,
      });
      await settle(page);

      const chrome = page.getByTestId("session-chrome");
      await expect(chrome).toBeVisible({ timeout: 60_000 });
      await expect(chrome).toHaveScreenshot(`session-${theme}-chrome.png`);
    }
  });
});
