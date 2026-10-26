import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { spawnSync } from "node:child_process";

export function sqlitePath(url) {
  if (!url?.startsWith("file:") || /[?#]/.test(url)) throw new Error("DATABASE_URL must be a SQLite file: path without query parameters");
  const file = url.slice(5);
  if (!file) throw new Error("Empty SQLite path");
  return path.isAbsolute(file) ? file : path.resolve("prisma", file);
}

export function inspectDatabase(url, migrationsDir = "prisma/migrations") {
  const file = sqlitePath(url);
  if (!fs.existsSync(file)) return { state: "empty", file };
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all();
    if (!tables.length) return { state: "empty", file };
    if (!tables.some(t => t.name === "_prisma_migrations")) throw new Error("Existing database has no migration history. Back up and verify/baseline it manually; startup will not alter it.");
    const rows = db.prepare("SELECT migration_name, finished_at, rolled_back_at FROM _prisma_migrations").all();
    if (rows.some(r => !r.finished_at && !r.rolled_back_at)) throw new Error("Unfinished migration; operator recovery is required.");
    const applied = new Set(rows.filter(r => r.finished_at && !r.rolled_back_at).map(r => r.migration_name));
    const expected = fs.readdirSync(migrationsDir).filter(n => fs.existsSync(path.join(migrationsDir, n, "migration.sql")));
    if (expected.some(n => !applied.has(n)) || [...applied].some(n => !expected.includes(n))) throw new Error("Database migrations differ from this release. Back up, review and run npm run db:migrate separately; startup will not migrate it.");
    if (!tables.some(t => t.name === "User")) throw new Error("Missing application tables");
    return { state: "ready", file };
  } finally {
    db.close();
  }
}

export function prepareDatabase(url, resume = false) {
  const file = sqlitePath(url), pending = `${file}.bootstrap-pending`, lock = `${file}.bootstrap-lock`;
  if (fs.existsSync(pending) && !resume) throw new Error("Incomplete initial setup. Inspect/back up the database, then explicitly run npm run db:initialize -- --resume-bootstrap.");
  if (resume && !fs.existsSync(pending)) throw new Error("No incomplete bootstrap to resume");
  const state = inspectDatabase(url);
  if (state.state === "ready" && !resume) {
    console.log("Existing database is ready; no migrations or seed performed.");
    return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const fd = fs.openSync(lock, "wx", 0o600);
  try {
    // Recheck after the lock: never treat a concurrently created database as new.
    if (!resume && inspectDatabase(url).state !== "empty") throw new Error("Database changed during initialization");
    if (!resume) fs.writeFileSync(pending, "Initial setup incomplete\n", { flag: "wx", mode: 0o600 });
    // Prisma 5.20 migrate deploy needs the SQLite file to exist. Exclusive
    // creation under the bootstrap lock never truncates an existing database.
    if (!fs.existsSync(file)) fs.closeSync(fs.openSync(file, "wx", 0o600));
    const run = args => {
      const r = spawnSync(process.execPath, args, { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
      if (r.error) throw r.error;
      if (r.status !== 0) throw new Error(`Database setup failed (exit ${r.status}); pending marker retained for operator recovery`);
    };
    run(["node_modules/prisma/build/index.js", "migrate", "deploy"]);
    run(["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"]);
    if (inspectDatabase(url).state !== "ready") throw new Error("Database setup did not finish");
    fs.unlinkSync(pending);
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    if (fs.existsSync(".env")) process.loadEnvFile(".env");
    prepareDatabase(process.env.DATABASE_URL, process.argv.includes("--resume-bootstrap"));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}
