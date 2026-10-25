import { z } from "zod"; import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth";
const S = z.object({ lessonId: z.string(), on: z.boolean() });
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const p = S.safeParse(await r.json().catch(() => null)); if (!p.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  if (!(await db.lesson.findUnique({ where: { id: p.data.lessonId } }))) return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 });
  const k = { userId_lessonId: { userId: u.id, lessonId: p.data.lessonId } };
  if (p.data.on) await db.bookmark.upsert({ where: k, update: {}, create: { userId: u.id, lessonId: p.data.lessonId } });
  else await db.bookmark.deleteMany({ where: { userId: u.id, lessonId: p.data.lessonId } });
  return Response.json({ ok: true });
}
