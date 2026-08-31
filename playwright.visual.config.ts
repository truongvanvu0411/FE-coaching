import { defineConfig, devices } from "@playwright/test";

// Separate from playwright.config.ts on purpose.
//
// The functional suite runs against `next dev`, which injects the dev indicator
// badge (see devIndicators in next.config.ts) into every frame — it would land in
// every screenshot. Visual baselines therefore run against a production build.
//
// The functional suite also answers practice questions, which changes the
// attempt-derived numbers on / and /progress. Keeping the two suites in separate
// configs means a visual run never has to share a database state with them.
const port = Number(process.env.VISUAL_PORT || 3100);
const baseURL = process.env.VISUAL_BASE_URL || `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/visual",
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: [["list"]],
  // One file per locale/theme/screen, grouped by project.
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      // A token refactor that changes nothing should change nothing. Allow only
      // the handful of pixels antialiasing moves between runs on the same box.
      maxDiffPixels: 40,
      animations: "disabled",
      caret: "hide",
      scale: "css",
    },
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { browserName: "chromium", ...devices["Pixel 5"] } },
  ],
  webServer: {
    // Requires a production build: npm run build
    command: `npx next start --port ${port} --hostname 127.0.0.1`,
    url: `${baseURL}/vi/login`,
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
