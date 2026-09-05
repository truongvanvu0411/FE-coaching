import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.BASE_URL || "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  // Keep local runs deterministic; Next dev compiles route chunks on demand.
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { browserName: "chromium", ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1",
    // Registration is closed by default now (ALLOW_REGISTRATION unset), because
    // the deployed site is public and every account can spend DeepSeek credit.
    // The suite still needs to exercise the endpoint's validation, so it runs
    // with the flag on — production does not.
    env: { ALLOW_REGISTRATION: "true" },
    url: `${baseURL}/vi/login`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
