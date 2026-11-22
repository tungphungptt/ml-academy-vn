import { defineConfig } from "@playwright/test";
import path from "node:path";
import { randomBytes } from "node:crypto";
const baseURL = process.env.E2E_BASE_URL || "http://127.0.0.1:3100";
const target = new URL(baseURL);
if (!["127.0.0.1", "localhost"].includes(target.hostname) || target.protocol !== "http:" || !target.port || target.port === "3000") throw new Error("E2E requires a separate loopback port (default 3100); never use the personal/live server.");
process.env.DATABASE_URL ??= `file:${path.resolve('.local', `ml-curriculum-e2e-${Date.now()}`, 'app.db').replaceAll('\\', '/')}`;
if (!/^file:.*[/\\]ml-curriculum-e2e-[^/\\]+[/\\][^/\\]+\.db$/.test(process.env.DATABASE_URL)) throw new Error("E2E requires an explicitly isolated ml-curriculum-e2e-* database.");
process.env.E2E_BASE_URL = baseURL;
// Config is also loaded in worker processes: share the isolated test secret
// inherited from the runner instead of silently signing fixtures with a new key.
process.env.NEURALCLONE_E2E_SESSION_SECRET ??= randomBytes(32).toString("hex");
process.env.SESSION_SECRET = process.env.NEURALCLONE_E2E_SESSION_SECRET;
process.env.COOKIE_SECURE = "false";
process.env.NEURALCLONE_E2E = "1";
process.env.LESSON_CONTENT_DIR = path.join(path.dirname(process.env.DATABASE_URL.slice(5)), "lesson-overrides");
export default defineConfig({
  testDir: "./e2e", testIgnore: ["**/cross-browser.spec.ts", "**/apple-design.spec.ts", "**/studio-motion.spec.ts", "**/learning-experiments.spec.ts", "**/learning-refinement.spec.ts", "**/workspace.spec.ts", "**/exhibition.spec.ts"], timeout: 60_000,
  // These integration tests share one explicitly isolated SQLite database.
  // Publication tests temporarily hide a course; browser sweeps must not race it.
  workers: 1,
  use: { baseURL, launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, channel: process.env.PLAYWRIGHT_CHANNEL } },
  webServer: { command: `node scripts/e2e-server.mjs ${target.port}`, url: `${baseURL}/api/health`, reuseExistingServer: false, timeout: 300_000 },
});
