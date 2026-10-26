import { requireAdmin } from "@/lib/auth"; import { validateContentFile } from "@/lib/validation"; import { clearContentCache } from "@/lib/content";
import { lessonExists, readLesson, writeLesson } from "@/lib/lessonFiles";
export async function GET(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateContentFile(new URL(r.url).searchParams.get("file")); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!lessonExists(v.data.file)) return Response.json({ error: "Không có file này" }, { status: 404 });
  return Response.json({ text: readLesson(v.data.file) });
}
export async function PUT(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); const v = validateContentFile(b?.file); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (typeof b.text !== "string" || !b.text.trim() || b.text.length > 200_000) return Response.json({ error: "Nội dung phải có 1-200000 ký tự" }, { status: 400 });
  writeLesson(v.data.file, b.text); clearContentCache();
  return Response.json({ ok: true });
}
