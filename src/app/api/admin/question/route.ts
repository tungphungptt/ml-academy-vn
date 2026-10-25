import { db } from "@/lib/db"; import { requireAdmin } from "@/lib/auth"; import { validateQuestion } from "@/lib/validation";
export async function POST(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const v = validateQuestion(await r.json().catch(() => null)); if (!v.ok) return Response.json({ error: v.errors.join("; ") }, { status: 400 });
  if (!(await db.lesson.findUnique({ where: { id: v.data.lessonId } }))) return Response.json({ error: "Không tìm thấy bài học" }, { status: 404 });
  const quiz = await db.quiz.upsert({ where: { lessonId: v.data.lessonId }, update: {}, create: { lessonId: v.data.lessonId } });
  const n = await db.quizQuestion.count({ where: { quizId: quiz.id } });
  return Response.json(await db.quizQuestion.create({ data: { quizId: quiz.id, order: n, prompt: v.data.prompt, optionsJson: JSON.stringify(v.data.options), correctIndex: v.data.correct, explanation: v.data.explanation } }));
}
export async function DELETE(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); if (!b || typeof b.id !== "string") return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  await db.quizQuestion.deleteMany({ where: { id: b.id } }); return Response.json({ ok: true });
}
export async function PATCH(r: Request) {
  if (!(await requireAdmin())) return Response.json({ error: "Không có quyền" }, { status: 403 });
  const b = await r.json().catch(() => null); const v = validateQuestion(b);
  if (!v.ok || typeof b?.id !== "string") return Response.json({ error: v.ok ? "Thiếu id" : v.errors.join("; ") }, { status: 400 });
  try { return Response.json(await db.quizQuestion.update({ where: { id: b.id }, data: { prompt: v.data.prompt, optionsJson: JSON.stringify(v.data.options), correctIndex: v.data.correct, explanation: v.data.explanation } })); } catch { return Response.json({ error: "Không tìm thấy câu hỏi" }, { status: 404 }); }
}
