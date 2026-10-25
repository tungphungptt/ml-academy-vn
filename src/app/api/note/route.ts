import { z } from "zod"; import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth";
const C = z.object({ lessonId: z.string(), body: z.string().trim().min(1).max(2000) });
const D = z.object({ id: z.string() });
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const p = C.safeParse(await r.json().catch(() => null)); if (!p.success) return Response.json({ error: "Ghi chú không hợp lệ" }, { status: 400 });
  if (!(await db.lesson.findUnique({ where: { id: p.data.lessonId } }))) return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 });
  const n = await db.note.create({ data: { userId: u.id, lessonId: p.data.lessonId, body: p.data.body } });
  return Response.json({ id: n.id, body: n.body });
}
export async function DELETE(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const p = D.safeParse(await r.json().catch(() => null)); if (!p.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  await db.note.deleteMany({ where: { id: p.data.id, userId: u.id } });
  return Response.json({ ok: true });
}
