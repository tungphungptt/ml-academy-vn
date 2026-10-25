import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { validateDataset } from "@/lib/validation";
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateDataset(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (await db.dataset.findUnique({ where: { slug: v.data.slug } })) return Response.json({ error: "slug đã tồn tại" }, { status: 409 });
  return Response.json(await db.dataset.create({ data: v.data }));
}
export async function DELETE(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); if (!b || typeof b.id !== "string") return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  await db.dataset.deleteMany({ where: { id: b.id } }); return Response.json({ ok: true });
}
