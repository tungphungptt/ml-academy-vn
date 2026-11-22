import { z } from "zod"; import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth";
import { publishedLesson } from "@/lib/lessonAccess";
const S = z.object({ lessonId: z.string(), done: z.boolean() });
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const p = S.safeParse(await r.json().catch(() => null)); if (!p.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  if (!(await publishedLesson(p.data.lessonId))) return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 });
  const k = { userId_lessonId: { userId: u.id, lessonId: p.data.lessonId } };
  if (p.data.done) await db.lessonProgress.upsert({ where: k, update: {}, create: { userId: u.id, lessonId: p.data.lessonId } });
  else await db.lessonProgress.deleteMany({ where: { userId: u.id, lessonId: p.data.lessonId } });
  return Response.json({ ok: true });
}
