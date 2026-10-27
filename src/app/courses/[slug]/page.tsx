import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { courseProgress, nextLesson } from "@/lib/progress";
import PageHeading from "@/components/PageHeading";
import ProgressRing from "@/components/ProgressRing";
import Icon from "@/components/Icon";
export const dynamic = "force-dynamic";
export default async function Course({ params: pendingParams }: { params: Promise<{ slug: string }> }) {
  const params = await pendingParams;
  const c = await db.course.findUnique({ where: { slug: params.slug }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
  if (!c || !c.published) notFound();
  const u = await currentUser();
  const done = new Set(u ? (await db.lessonProgress.findMany({ where: { userId: u.id } })).map(p => p.lessonId) : []);
  const all = c.modules.flatMap(m => m.lessons), entries = all.map(l => ({ id: l.id, slug: l.slug, title: l.title, hasContent: !!l.contentFile }));
  const p = courseProgress(entries, done), next = nextLesson(entries, done);
  return <><nav className="breadcrumb" aria-label="Đường dẫn"><a href="/courses">Lộ trình</a><Icon name="chevron" /><span>{c.title}</span></nav>
    <PageHeading eyebrow="TỪ NỀN TẢNG ĐẾN THỰC HÀNH" title={c.title} description={c.description} actions={<span className="badge">{c.level}</span>} />
    <div className="curriculum-overview"><div><p>{c.modules.length} chương · {all.length} bài học{u ? ` · Tiến độ: ${p.completed}/${p.total} bài (${p.percent}%)` : ""}</p>{u ? <progress aria-label="Tiến độ khóa học" value={p.completed} max={p.total || 1} /> : <span className="mut"><a href="/login">Đăng nhập</a> để lưu tiến độ và kết quả quiz.</span>}</div>{next && <a className="btn primary" href={`/learn/${next.slug}`}>{p.completed ? "Tiếp tục học" : "Bắt đầu lộ trình"}<Icon name="arrow" /></a>}{u && !next && <ProgressRing percent={p.percent} />}</div>
    {c.modules.map((m, index) => <section className="curriculum-module" key={m.id}><span className="module-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h2>{m.title}</h2><p className="module-caption">{m.lessons.length} bài · {m.lessons.reduce((n, l) => n + l.minutes, 0)} phút theo lộ trình</p><ol className="lesson-list">{m.lessons.map((l, i) => <li key={l.id}>{l.contentFile ? <a className="lesson-row" href={`/learn/${l.slug}`}><span className={`lesson-status${done.has(l.id) ? " done" : ""}`} aria-label={done.has(l.id) ? "Đã hoàn thành" : "Chưa hoàn thành"}>{done.has(l.id) ? <Icon name="check" /> : <span className="signal-dot" />}</span><span className="lesson-number" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span><span className="lesson-row-title">{l.title}</span><small>{l.minutes} phút</small><Icon name="arrow" /></a> : <div className="lesson-row"><span className="lesson-row-title">{l.title}</span><small>Chưa biên soạn</small></div>}</li>)}</ol></div></section>)}
  </>;
}
