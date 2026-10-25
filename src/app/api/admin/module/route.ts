import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { validateModule } from "@/lib/validation";
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateModule(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!(await db.course.findUnique({ where: { id: v.data.courseId } }))) return Response.json({ error: "Không tìm thấy khóa học" }, { status: 404 });
  const last = await db.module.aggregate({ where: { courseId: v.data.courseId }, _max: { order: true } });
  return Response.json(await db.module.create({ data: { ...v.data, order: (last._max.order ?? -1) + 1 } }));
}
export async function DELETE(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); if (!b || typeof b.id !== "string") return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  await db.module.deleteMany({ where: { id: b.id } }); return Response.json({ ok: true });
}
export async function PATCH(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); const v = validateModule(b);
  if (!v.ok || typeof b?.id !== "string") return Response.json({ error: v.ok ? "Thiếu id" : v.errors.join("; ") }, { status: 400 });
  try { return Response.json(await db.module.update({ where: { id: b.id }, data: { title: v.data.title } })); } catch { return Response.json({ error: "Không tìm thấy module" }, { status: 404 }); }
}
