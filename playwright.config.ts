// Chưa được chạy khi phát triển (không có mạng/trình duyệt). Cài: npm i -D @playwright/test && npx playwright install chromium
import { defineConfig } from "@playwright/test";
export default defineConfig({ testDir: "./e2e", timeout: 60_000, use: { baseURL: "http://localhost:3000" }, webServer: { command: "npm run local", url: "http://localhost:3000/api/health", reuseExistingServer: true, timeout: 300_000 } });
