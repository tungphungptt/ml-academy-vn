// Kiểm tra mọi liên kết nguồn (bài học, tài nguyên, dataset). Cần Internet:  npm run check:links
import fs from "node:fs";
const urls = new Set(); const J = f => JSON.parse(fs.readFileSync(f, "utf8"));
for (const c of J("content/catalog.json").courses) for (const m of c.modules) for (const l of m.lessons) if (typeof l !== "string") for (const s of l.src ?? []) urls.add(s.url);
for (const file of fs.readdirSync("content/lessons").filter(f => f.endsWith(".md"))) {
  const markdown = fs.readFileSync(`content/lessons/${file}`, "utf8");
  for (const match of markdown.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)) urls.add(match[1]);
}
for (const r of J("content/resources.json")) urls.add(r.url); for (const d of J("content/datasets.json")) urls.add(d.url);
const list = [...urls]; if (process.argv.includes("--list")) { console.log(list.join("\n")); process.exit(0); }
async function check(u) {
  for (const method of ["HEAD", "GET"]) {
    try { const r = await fetch(u, { method, redirect: "follow", signal: AbortSignal.timeout(15000), headers: { "user-agent": "ml-academy-link-check" } }); if (r.ok) return { u, ok: true, status: r.status }; if (method === "GET") return { u, ok: false, s: r.status }; }
    catch (e) { if (method === "GET") return { u, ok: false, s: String(e.cause?.code || e.cause?.message || e.message) }; }
  }
}
let bad = 0; const q = [...list], results = [];
await Promise.all(Array.from({ length: 6 }, async () => { while (q.length) { const r = await check(q.shift()); results.push(r); if (!r.ok) { bad++; console.log("✖", r.s, r.u); } } }));
const reportAt = process.argv.indexOf("--report");
if (reportAt >= 0) fs.writeFileSync(process.argv[reportAt + 1], JSON.stringify({ total: list.length, passed: list.length - bad, failed: bad, results: results.sort((a, b) => a.u.localeCompare(b.u)) }, null, 1) + "\n");
console.log(`${list.length} liên kết đã kiểm tra, ${bad} lỗi`); process.exit(bad ? 1 : 0);
