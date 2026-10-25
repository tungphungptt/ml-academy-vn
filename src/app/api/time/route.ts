import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth"; import { validateStudyPing } from "@/lib/validation";
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const v = validateStudyPing(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!(await db.lesson.findUnique({ where: { id: v.data.lessonId } }))) return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 });
  const k = { userId_lessonId: { userId: u.id, lessonId: v.data.lessonId } };
  await db.studyTime.upsert({ where: k, update: { seconds: { increment: v.data.seconds } }, create: { userId: u.id, lessonId: v.data.lessonId, seconds: v.data.seconds } });
  return Response.json({ ok: true });
}
