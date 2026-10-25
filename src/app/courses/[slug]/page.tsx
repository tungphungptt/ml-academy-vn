import { notFound } from "next/navigation"; import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth"; import { courseProgress } from "@/lib/progress";
export const dynamic = "force-dynamic";
export default async function Course({ params }: { params: { slug: string } }) {
  const c = await db.course.findUnique({ where: { slug: params.slug }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
  if (!c || !c.published) notFound();
  const u = await currentUser();
  const done = new Set(u ? (await db.lessonProgress.findMany({ where: { userId: u.id } })).map(p => p.lessonId) : []);
  const all = c.modules.flatMap(m => m.lessons); const p = courseProgress(all.map(l => ({ id: l.id, slug: l.slug, title: l.title, hasContent: !!l.contentFile })), done);
  return <><p><a href="/courses">← Tất cả khóa học</a></p><h1>{c.title}</h1><p>{c.description} ({c.level})</p>
    {u ? <><p>Tiến độ: {p.completed}/{p.total} bài ({p.percent}%)</p><progress value={p.completed} max={p.total || 1} style={{ width: "100%" }} /></> : <p><a href="/login">Đăng nhập</a> để theo dõi tiến độ.</p>}
    {c.modules.map(m => <section key={m.id}><h2>{m.title}</h2><ol>{m.lessons.map(l => <li key={l.id}>{done.has(l.id) ? "✓ " : ""}{l.contentFile ? <a href={`/learn/${l.slug}`}>{l.title}</a> : <span>{l.title} (chưa biên soạn)</span>} · {l.minutes} phút</li>)}</ol></section>)}</>;
}
