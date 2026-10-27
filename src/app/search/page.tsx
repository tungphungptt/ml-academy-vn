import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import HighlightedText from "@/components/HighlightedText";
import Icon from "@/components/Icon";
import { getLabLinks } from "@/lib/content";
import { db } from "@/lib/db";
import { searchDocs } from "@/lib/search";
import { getPublishedSearchDocs } from "@/lib/publishedContent";
export const dynamic = "force-dynamic";
export const metadata = { title: "Tìm bài học | ML Academy VN" };
type Filters = { q?: string; level?: string; tier?: string; kind?: string; course?: string };
export default async function Search({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams, q = (filters.q ?? "").trim();
  const docs = await getPublishedSearchDocs();
  const selected = docs.filter(d => (!filters.level || d.level === filters.level) &&
    (!filters.tier || d.tier === filters.tier) && (!filters.kind || d.kind === filters.kind) &&
    (!filters.course || d.courseSlug === filters.course));
  const hits = searchDocs(selected, q), meta = new Map(docs.map(d => [d.slug, d]));
  const courses = [...new Map(docs.map(d => [d.courseSlug, d.courseTitle])).entries()];
  const quizLessons = new Set((await db.quiz.findMany({ where: { lesson: { slug: { in: hits.map(h => h.slug) }, module: { course: { published: true } } } }, select: { lesson: { select: { slug: true } } } })).map(q => q.lesson.slug));
  const labs = getLabLinks();
  return <><PageHeading eyebrow="THEO DẤU SỰ TÒ MÒ" title="Tìm bài học" description="Tìm một khái niệm, kết nối với điều đã biết, rồi thử bằng một bài thực hành." />
    <form role="search" className="filters">
      <label className="filter-field query">Từ khóa<input type="search" name="q" defaultValue={q} placeholder="Ví dụ: gradient, dao ham, softmax" aria-label="Từ khóa" /></label>
      <label className="filter-field">Lộ trình<select name="course" defaultValue={filters.course ?? ""} aria-label="Lộ trình"><option value="">Mọi lộ trình</option>{courses.map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}</select></label>
      <label className="filter-field">Trình độ<select name="level" defaultValue={filters.level ?? ""} aria-label="Trình độ"><option value="">Mọi trình độ</option>{["Beginner", "Intermediate", "Advanced"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="filter-field">Ưu tiên học<select name="tier" defaultValue={filters.tier ?? ""} aria-label="Ưu tiên học"><option value="">Mọi ưu tiên</option>{["Core", "Intermediate", "Advanced"].map(v => <option key={v}>{v}</option>)}</select></label>
      <label className="filter-field">Loại bài<select name="kind" defaultValue={filters.kind ?? ""} aria-label="Loại bài"><option value="">Mọi loại bài</option><option value="lesson">Kiến thức</option><option value="practice">Thực hành</option></select></label>
      <button className="primary"><Icon name="search" />Tìm</button><a className="filter-reset" href="/search">Xóa bộ lọc</a>
    </form>
    <p className="mut">{q.length >= 2 ? `${hits.length} bài được hiển thị · ` : ""}Tìm trong {docs.length} bài đã xuất bản, không phân biệt dấu. Mọi từ khóa phải xuất hiện; ưu tiên học khác với độ khó.</p>
    {q.length < 2 && <EmptyState title="Bạn muốn hiểu điều gì hôm nay?" description="Nhập ít nhất 2 ký tự, có hoặc không có dấu. Thử “dao ham”, “gradient” hoặc “mạng nơ-ron”." href="/courses" action="Khám phá lộ trình" />}
    {q.length >= 2 && hits.length === 0 && <EmptyState title={`Chưa có bài khớp “${q}”`} description="Thử một thuật ngữ ngắn hơn, kiểm tra cách viết hoặc bỏ bớt bộ lọc." href={`/search?q=${encodeURIComponent(q)}`} action="Bỏ bộ lọc" />}
    {hits.map(h => { const info = meta.get(h.slug), related = labs.filter(l => l.lessonSlugs?.includes(h.slug)); return <article className="search-result" key={h.slug}><div className="search-result-top"><span className="badge neutral">{info?.kind === "practice" ? "Bài thực hành" : "Bài học"}</span><span>{info?.level}</span><span>{info?.tier}</span></div><h2><a href={`/learn/${h.slug}`}><HighlightedText text={h.title} query={q} /></a></h2><p><HighlightedText text={h.snippet} query={q} /></p><p className="eyebrow">{info?.courseTitle}</p>
      <div className="result-resources">{quizLessons.has(h.slug) && <a href={`/learn/${h.slug}#quiz`}><Icon name="check" />Quiz trong bài</a>}{related.map(l => <a key={l.id} href={`/lab?lab=${l.id}`}><Icon name="code" />Code Lab: {l.title}</a>)}{related.map(l => { const notebook = Object.values(l.notebooks ?? {})[0]; return notebook ? <a key={l.id} href={notebook} download><Icon name="download" />Notebook: {l.title}</a> : null; })}</div>
    </article>; })}
  </>;
}
