import { currentUser } from "@/lib/auth"; import { db } from "@/lib/db"; import Landing from "@/components/Landing"; import ProgressRing from "@/components/ProgressRing"; import { courseProgress, nextLesson } from "@/lib/progress";
export const dynamic = "force-dynamic";
export default async function Home() {
  const u = await currentUser();
  if (!u) return <Landing />;
  const courses = await db.course.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
  const done = new Set((await db.lessonProgress.findMany({ where: { userId: u.id } })).map(p => p.lessonId));
  const attempts = await db.quizAttempt.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 5, include: { quiz: { include: { lesson: true } } } });
  const secs = (await db.studyTime.aggregate({ where: { userId: u.id }, _sum: { seconds: true } }))._sum.seconds ?? 0;
  const rows = courses.map(c => { const ls = c.modules.flatMap(m => m.lessons).map(l => ({ id: l.id, slug: l.slug, title: l.title, hasContent: !!l.contentFile })); return { c, p: courseProgress(ls, done), next: nextLesson(ls, done) }; });
  const suggestion = rows.find(r => r.next)?.next;
  return <><h1>Tiến độ của bạn</h1>
    {done.size === 0 && <p>Bạn chưa hoàn thành bài nào. Hãy bắt đầu từ một bài học bên dưới.</p>}
    {suggestion && <a className="card cont" href={`/learn/${suggestion.slug}`}><span className="badge">Tiếp tục học</span><br /><b>{suggestion.title}</b> →</a>}
    <div className="stat"><div><b>{done.size}</b>bài đã hoàn thành</div><div><b>{Math.round(secs / 60)}</b>phút học được ghi nhận</div><div><b>{attempts.length}</b>lượt quiz gần đây</div></div>
    <div className="grid">{rows.map(({ c, p }) => <a key={c.id} href={`/courses/${c.slug}`} className="card"><div className="row2"><div><b>{c.title}</b><br /><span style={{ color: "var(--mut)" }}>{p.completed}/{p.total} bài</span></div><ProgressRing percent={p.percent} /></div></a>)}</div>
    <h2>Điểm quiz gần đây</h2>{attempts.length === 0 ? <p>Chưa có lượt làm quiz nào.</p> : <ul>{attempts.map(a => <li key={a.id}>{a.quiz.lesson.title}: {a.score}/{a.total} ({a.createdAt.toLocaleDateString("vi-VN")})</li>)}</ul>}</>;
}
