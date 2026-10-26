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
  return <><h1>Tìm bài học</h1>
    <form role="search" className="filters">
      <input type="search" name="q" defaultValue={q} placeholder="Ví dụ: gradient, dao ham, softmax" aria-label="Từ khóa" />
      <select name="course" defaultValue={filters.course ?? ""} aria-label="Lộ trình"><option value="">Mọi lộ trình</option>{courses.map(([slug, title]) => <option key={slug} value={slug}>{title}</option>)}</select>
      <select name="level" defaultValue={filters.level ?? ""} aria-label="Trình độ"><option value="">Mọi trình độ</option>{["Beginner", "Intermediate", "Advanced"].map(v => <option key={v}>{v}</option>)}</select>
      <select name="tier" defaultValue={filters.tier ?? ""} aria-label="Ưu tiên học"><option value="">Mọi ưu tiên</option>{["Core", "Intermediate", "Advanced"].map(v => <option key={v}>{v}</option>)}</select>
      <select name="kind" defaultValue={filters.kind ?? ""} aria-label="Loại bài"><option value="">Mọi loại bài</option><option value="lesson">Kiến thức</option><option value="practice">Thực hành</option></select>
      <button className="primary">Tìm</button><a href="/search">Xóa bộ lọc</a>
    </form>
    <p className="mut">Tìm trong {docs.length} bài đã xuất bản, không phân biệt dấu. Mọi từ khóa phải xuất hiện; ưu tiên học khác với độ khó.</p>
    {q.length < 2 && <p>Nhập ít nhất 2 ký tự, ví dụ “dao ham”. Bạn cũng có thể <a href="/courses">khám phá các lộ trình</a>.</p>}
    {q.length >= 2 && hits.length === 0 && <p role="status">Không có bài nào khớp “{q}”. Hãy thử từ khóa ngắn hơn hoặc <a href={`/search?q=${encodeURIComponent(q)}`}>bỏ bộ lọc</a>.</p>}
    {hits.map(h => <div className="hit" key={h.slug}><a href={`/learn/${h.slug}`}><b>{h.title}</b></a><div className="mut">{meta.get(h.slug)?.courseTitle} · {meta.get(h.slug)?.level} · {meta.get(h.slug)?.tier}</div><p>{h.snippet}</p></div>)}
  </>;
}
