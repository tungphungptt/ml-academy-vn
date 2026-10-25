import fs from "fs"; import path from "path"; import { requireAdmin } from "@/lib/auth"; import { validateContentFile } from "@/lib/validation"; import { clearContentCache } from "@/lib/content";
const dir = () => path.join(process.cwd(), "content/lessons");
export async function GET(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateContentFile(new URL(r.url).searchParams.get("file")); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  const p = path.join(dir(), v.data.file); if (!fs.existsSync(p)) return Response.json({ error: "Không có file này" }, { status: 404 });
  return Response.json({ text: fs.readFileSync(p, "utf8") });
}
export async function PUT(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); const v = validateContentFile(b?.file); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (typeof b.text !== "string" || !b.text.trim() || b.text.length > 200_000) return Response.json({ error: "Nội dung phải có 1-200000 ký tự" }, { status: 400 });
  const p = path.join(dir(), v.data.file), tmp = p + ".tmp"; fs.writeFileSync(tmp, b.text, "utf8"); fs.renameSync(tmp, p); clearContentCache();
  return Response.json({ ok: true });
}
