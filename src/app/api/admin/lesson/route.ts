import fs from "fs"; import path from "path";
import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { validateLesson } from "@/lib/validation";
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateLesson(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!(await db.module.findUnique({ where: { id: v.data.moduleId } }))) return Response.json({ error: "Không tìm thấy module" }, { status: 404 });
  if (await db.lesson.findUnique({ where: { slug: v.data.slug } })) return Response.json({ error: "slug đã tồn tại" }, { status: 409 });
  if (v.data.contentFile && !fs.existsSync(path.join(process.cwd(), "content/lessons", v.data.contentFile))) return Response.json({ error: "Không có file content/lessons/" + v.data.contentFile }, { status: 400 });
  const last = await db.lesson.aggregate({ where: { moduleId: v.data.moduleId }, _max: { order: true } });
  return Response.json(await db.lesson.create({ data: { ...v.data, order: (last._max.order ?? -1) + 1 } }));
}
export async function DELETE(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); if (!b || typeof b.id !== "string") return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  await db.lesson.deleteMany({ where: { id: b.id } }); return Response.json({ ok: true });
}
export async function PATCH(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); const v = validateLesson(b);
  if (!v.ok || typeof b?.id !== "string") return Response.json({ error: v.ok ? "Thiếu id" : v.errors.join("; ") }, { status: 400 });
  const dup = await db.lesson.findUnique({ where: { slug: v.data.slug } });
  if (dup && dup.id !== b.id) return Response.json({ error: "slug đã tồn tại" }, { status: 409 });
  if (v.data.contentFile && !fs.existsSync(path.join(process.cwd(), "content/lessons", v.data.contentFile))) return Response.json({ error: "Không có file content/lessons/" + v.data.contentFile }, { status: 400 });
  try { const { moduleId: _m, ...data } = v.data; return Response.json(await db.lesson.update({ where: { id: b.id }, data })); } catch { return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 }); }
}
