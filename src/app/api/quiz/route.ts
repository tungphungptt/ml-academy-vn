import { z } from "zod"; import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth"; import { gradeQuiz } from "@/lib/quiz";
const S = z.object({ quizId: z.string(), answers: z.record(z.string(), z.number().int()) });
export async function POST(r: Request) {
  const u = await currentUser(); if (!u) return Response.json({ error: "Cần đăng nhập" }, { status: 401 });
  const p = S.safeParse(await r.json().catch(() => null)); if (!p.success) return Response.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  const qs = await db.quizQuestion.findMany({ where: { quizId: p.data.quizId } });
  const g = gradeQuiz(qs, p.data.answers);
  await db.quizAttempt.create({ data: { userId: u.id, quizId: p.data.quizId, score: g.score, total: g.total } });
  return Response.json(g);
}
