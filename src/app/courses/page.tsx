import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth"; import ProgressRing from "@/components/ProgressRing"; import { courseProgress } from "@/lib/progress";
export const dynamic = "force-dynamic";
type SP = { q?: string; level?: string; status?: string };
export default async function Courses({ searchParams }: { searchParams: SP }) {
  const q = (searchParams.q ?? "").trim().toLowerCase(), level = searchParams.level ?? "", status = searchParams.status ?? "";
  const u = await currentUser();
  const done = new Set(u ? (await db.lessonProgress.findMany({ where: { userId: u.id } })).map(p => p.lessonId) : []);
  const cs = await db.course.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { modules: { include: { lessons: true } } } });
  const rows = cs.map(c => {
    const ls = c.modules.flatMap(m => m.lessons); const p = courseProgress(ls.map(l => ({ id: l.id, slug: l.slug, title: l.title, hasContent: !!l.contentFile })), done);
    return { c, ls, p, full: ls.filter(l => l.contentFile).length };
  }).filter(({ c, ls, p }) =>
    (!q || [c.title, c.description, ...ls.map(l => l.title)].some(t => t.toLowerCase().includes(q))) &&
    (!level || c.level === level) &&
    (!status || !u || (status === "done" ? p.completed === p.total && p.total > 0 : status === "doing" ? p.completed > 0 && p.completed < p.total : p.completed === 0)));
  return <><h1>Khóa học</h1>
    <form method="get" style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }} role="search">
      <input name="q" defaultValue={searchParams.q ?? ""} placeholder="Tìm theo tên hoặc chủ đề" aria-label="Tìm kiếm" />
      <select name="level" defaultValue={level} aria-label="Trình độ"><option value="">Mọi trình độ</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
      {u && <select name="status" defaultValue={status} aria-label="Tình trạng"><option value="">Mọi tình trạng</option><option value="todo">Chưa học</option><option value="doing">Đang học</option><option value="done">Hoàn thành</option></select>}
      <button>Lọc</button></form>
    {rows.length === 0 && <p>Không có khóa học phù hợp. Hãy thử bỏ bớt bộ lọc.</p>}
    <div className="grid">{rows.map(({ c, ls, p, full }) => <div className="card" key={c.id}><h2><a href={`/courses/${c.slug}`}>{c.title}</a></h2><p>{c.description}</p>
      <p><span className="badge">{c.level}</span> {c.modules.length} module · {ls.length} bài ({full} bài đã có nội dung){u ? ` · hoàn thành ${p.completed}/${p.total}` : ""}</p>{u && <ProgressRing percent={p.percent} size={44} />}</div>)}</div></>;
}
