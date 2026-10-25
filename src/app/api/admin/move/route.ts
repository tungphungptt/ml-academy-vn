import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { validateMove } from "@/lib/validation"; import { reorder } from "@/lib/order";
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateMove(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  const { kind, id, dir } = v.data;
  if (kind === "module") {
    const m = await db.module.findUnique({ where: { id } }); if (!m) return Response.json({ error: "Không tìm thấy module" }, { status: 404 });
    const ids = (await db.module.findMany({ where: { courseId: m.courseId }, orderBy: [{ order: "asc" }, { id: "asc" }] })).map(x => x.id); const next = reorder(ids, id, dir);
    if (next) await db.$transaction(next.map((mid, i) => db.module.update({ where: { id: mid }, data: { order: i } })));
  } else {
    const l = await db.lesson.findUnique({ where: { id } }); if (!l) return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 });
    const ids = (await db.lesson.findMany({ where: { moduleId: l.moduleId }, orderBy: [{ order: "asc" }, { id: "asc" }] })).map(x => x.id); const next = reorder(ids, id, dir);
    if (next) await db.$transaction(next.map((lid, i) => db.lesson.update({ where: { id: lid }, data: { order: i } })));
  }
  return Response.json({ ok: true });
}
