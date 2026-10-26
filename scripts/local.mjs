import { existsSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";

const prod = process.argv.includes("--prod"), dry = process.argv.includes("--dry");
if (Number(process.versions.node.split(".")[0]) !== 24) throw new Error("Use Node.js 24 LTS");
if (process.argv.includes("--reset")) throw new Error("Automatic reset was removed. Back up your database and manage development data explicitly.");
if (!existsSync(".env") && !dry) {
  writeFileSync(".env", `DATABASE_URL="file:./dev.db"\nSESSION_SECRET="${randomBytes(32).toString("hex")}"\nCOOKIE_SECURE="false"\n`, { flag: "wx", mode: 0o600 });
  console.log("Created local .env; no admin account is provisioned.");
}
if (existsSync(".env")) process.loadEnvFile(".env");
const env = { ...process.env, COOKIE_SECURE: process.env.COOKIE_SECURE ?? "false" };
const run = (cmd, args) => {
  console.log(`▶ ${cmd} ${args.join(" ")}`);
  if (dry) return;
  const r = spawnSync(cmd, args, { stdio: "inherit", env });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
};
if (!existsSync("node_modules/next")) run("npm", ["ci"]);
run(process.execPath, ["node_modules/prisma/build/index.js", "generate"]);
run(process.execPath, ["scripts/prepare-db.mjs"]);
if (prod) run("npm", ["run", "build"]);
run(process.execPath, ["node_modules/next/dist/bin/next", prod ? "start" : "dev", "-p", env.PORT || "3000"]);
