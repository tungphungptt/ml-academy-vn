// Triển khai localhost bằng MỘT lệnh:  npm run local   (chế độ phát triển)  |  npm run prod  (build tối ưu + next start)
// Cờ: --reset xóa DB cũ và nạp lại nội dung; PORT=4000 đổi cổng; --dry chỉ in các bước
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
const prod = process.argv.includes("--prod"), dry = process.argv.includes("--dry"), reset = process.argv.includes("--reset");
const [maj, min] = process.versions.node.split(".").map(Number);
if (maj < 18 || (maj === 18 && min < 17)) { console.error(`Cần Node.js >= 18.17 (khuyến nghị 20 LTS). Bản hiện tại: ${process.version}`); process.exit(1); }
if (!existsSync(".env")) {
  const pw = randomBytes(9).toString("base64url");
  writeFileSync(".env", `DATABASE_URL="file:./dev.db"\nSESSION_SECRET="${randomBytes(32).toString("hex")}"\nADMIN_EMAIL="admin@example.com"\nADMIN_PASSWORD="${pw}"\n`);
  console.log(`✔ Đã tạo .env. Tài khoản admin: admin@example.com / ${pw}  (có thể đổi trong .env rồi chạy lại với --reset)`);
}
const env = { ...process.env }; env.COOKIE_SECURE ??= "false"; // chạy qua http://localhost nên không đặt cookie secure
for (const l of readFileSync(".env", "utf8").split(/\r?\n/)) { const m = l.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*"?(.*?)"?\s*$/); if (m && env[m[1]] === undefined) env[m[1]] = m[2]; }
if (reset) for (const f of ["prisma/dev.db", "prisma/dev.db-journal"]) rmSync(f, { force: true });
const run = (cmd) => {
  console.log(`\n▶ ${cmd}`); if (dry) return;
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, env });
  if (r.status !== 0) { console.error(`\n✖ Lệnh thất bại: ${cmd}\nHãy gửi lại thông báo lỗi phía trên để được hỗ trợ.`); process.exit(r.status ?? 1); }
};
run("npm install"); run("npx prisma db push"); run("npx tsx prisma/seed.ts");
const port = env.PORT || "3000";
console.log(`\n✔ Sẵn sàng. Mở http://localhost:${port}  (dừng server: Ctrl+C)`);
if (prod) { run("npx next build"); run(`npx next start -p ${port}`); } else run(`npx next dev -p ${port}`);
