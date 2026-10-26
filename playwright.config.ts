import { defineConfig } from "@playwright/test";
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
export default defineConfig({
  testDir: "./e2e", timeout: 60_000,
  use: { baseURL, launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH } },
  webServer: { command: "npm run local", url: `${baseURL}/api/health`, reuseExistingServer: true, timeout: 300_000 },
});
