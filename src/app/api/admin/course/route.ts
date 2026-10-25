import { z } from "zod"; import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth";
const S = z.object({ id: z.string(), published: z.boolean() });
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const p = S.safeParse(await r.json().catch(() => null)); if (!p.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  try { await db.course.update({ where: { id: p.data.id }, data: { published: p.data.published } }); } catch { return Response.json({ error: "Không tìm thấy khóa học" }, { status: 404 }); }
  return Response.json({ ok: true });
}
