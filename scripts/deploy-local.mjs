import fs from "node:fs";
import net from "node:net";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { inspectDatabase, sqlitePath } from "./prepare-db.mjs";

export function localOptions(env, nodeVersion = process.versions.node) {
  if (Number(nodeVersion.split(".")[0]) !== 24) throw new Error("Use Node.js 24 LTS (>=24.0.0 <25).");
  if (!env.DATABASE_URL) throw new Error("Missing DATABASE_URL. Create .env and run npm run setup first.");
  if ((env.SESSION_SECRET || "").length < 32) throw new Error("SESSION_SECRET must contain at least 32 characters. Generate a random secret; do not commit .env.");
  if (env.COOKIE_SECURE && env.COOKIE_SECURE !== "false") throw new Error("Local production uses HTTP. Set COOKIE_SECURE=false; keep true for a separate HTTPS server deployment.");
  const port = env.PORT ?? "3000";
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error("PORT must be an integer between 1 and 65535.");
  return { ...env, PORT: String(Number(port)), NODE_ENV: "production", COOKIE_SECURE: "false" };
}

export async function checkPort(port) {
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once("error", error => reject(new Error(error.code === "EADDRINUSE"
      ? `Port ${port} on 127.0.0.1 is in use. Stop its process or set PORT to another local port.`
      : `Cannot listen on 127.0.0.1:${port} (${error.code}).`)));
    probe.listen(Number(port), "127.0.0.1", () => probe.close(resolve));
  });
}

export function checkLocalDatabase(url) {
  const file = sqlitePath(url);
  if (fs.existsSync(`${file}.bootstrap-pending`) || fs.existsSync(`${file}.bootstrap-lock`)) throw new Error("Database bootstrap is incomplete or still running. Inspect the setup log and recovery instructions before starting.");
  if (inspectDatabase(url).state !== "ready") throw new Error("Database is not initialized. Review DATABASE_URL and run npm run db:initialize explicitly. deploy:local never seeds or migrates.");
}

// Run npm's JS CLI through the current Node executable: no npm.cmd spawning,
// shell interpolation, Unix-only environment assignment, or background daemon.
/**
 * @param {NodeJS.ProcessEnv} env
 * @param {(command: string, args: string[], options: {env: NodeJS.ProcessEnv, stdio: 'inherit'}) => {status: number | null, signal?: string | null, error?: Error}} run
 */
export function runProduction(env, run = spawnSync) {
  const npmCli = env.npm_execpath;
  if (!npmCli || !fs.existsSync(npmCli)) throw new Error("Run this script with npm run deploy:local so npm_execpath is available.");
  for (const args of [["run", "build"], ["run", "start", "--", "--hostname", "127.0.0.1", "--port", env.PORT]]) {
    console.log(`> npm ${args.join(" ")}`);
    const result = run(process.execPath, [npmCli, ...args], { env, stdio: "inherit" });
    if (result.error) throw result.error;
    if (result.signal) return result.signal === "SIGINT" ? 130 : 143;
    if (result.status !== 0) return result.status ?? 1;
  }
  return 0;
}

export async function deployLocal() {
  if (fs.existsSync(".env")) process.loadEnvFile(".env");
  const env = localOptions(process.env);
  for (const file of ["node_modules/next/dist/bin/next", "node_modules/prisma/build/index.js", "node_modules/@prisma/client/package.json", "node_modules/.prisma/client/default.js"]) {
    if (!fs.existsSync(file)) throw new Error(`Missing ${file}. Run npm run setup (installs dependencies, generates Prisma Client and initializes a NEW database only).`);
  }
  checkLocalDatabase(env.DATABASE_URL);
  await checkPort(env.PORT);
  console.log(`Local production: http://127.0.0.1:${env.PORT} (foreground; Ctrl+C to stop). Database checked read-only; no seed/migration.`);
  return runProduction(env);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  deployLocal().then(status => { process.exitCode = status; }).catch(error => {
    console.error(error instanceof Error ? error.message : "Local production startup failed"); process.exitCode = 1;
  });
}
