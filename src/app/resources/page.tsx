import { pageMetadata } from "@/lib/metadata";
import { db } from "@/lib/db";
import PageHeading, { SectionHeading } from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { normalizeSearch } from "@/lib/search";
import { singleQueryValues, type QueryParams } from "@/lib/queryParams";
export const dynamic = "force-dynamic";
const KIND: Record<string, string> = { book: "Sách và giáo trình", course: "Khóa học", docs: "Tài liệu chính thức", paper: "Bài báo khoa học", repo: "GitHub" };
export default async function Resources({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const { q = "", kind = "" } = singleQueryValues(await searchParams);
  const all = await db.resource.findMany({ orderBy: { title: "asc" } });
  const query = normalizeSearch(q.trim());
  const rs = all.filter(r => (!query || normalizeSearch(`${r.title} ${r.description} ${r.topic}`).includes(query)) && (!kind || r.kind === kind));
  return <><PageHeading eyebrow="ĐỌC SÂU HƠN" title="Tài liệu tham khảo" description="Mở rộng góc nhìn từ giáo trình, tài liệu chính thức và nghiên cứu gốc. Nguồn đối chiếu cụ thể nằm trong từng bài học." />
    <form className="filters" role="search"><label className="filter-field query">Tìm tài liệu<input name="q" type="search" defaultValue={q} placeholder="Tên, tác giả hoặc chủ đề" /></label><label className="filter-field">Loại tài liệu<select name="kind" defaultValue={kind}><option value="">Mọi loại tài liệu</option>{Object.entries(KIND).map(([k, label]) => <option value={k} key={k}>{label}</option>)}</select></label><button className="primary">Lọc tài liệu</button><a className="filter-reset" href="/resources">Xóa bộ lọc</a></form>
    {rs.length === 0 && <EmptyState title={all.length ? "Không tìm thấy tài liệu phù hợp" : "Thư viện đang được bổ sung"} description={all.length ? "Thử một chủ đề khác hoặc bỏ bớt bộ lọc." : "Trong lúc chờ, bạn có thể đọc các nguồn tham khảo được dẫn trực tiếp ở cuối bài học."} href={all.length ? "/resources" : "/courses"} action={all.length ? "Xem tất cả tài liệu" : "Mở lộ trình"} icon="book" />}
    {Object.entries(KIND).map(([k, label]) => { const group = rs.filter(r => r.kind === k); return group.length ? <section key={k}><SectionHeading eyebrow={`${group.length} TÀI LIỆU`} title={label} /><div className="resource-grid">{group.map(r => <article className="resource-card" key={r.id}><span className="badge neutral">{r.topic}</span><h3>{r.title}</h3><p>{r.description}</p><a className="text-link" href={r.url}>Đọc tài liệu<Icon name="external" /><span className="sr-only">: {r.title}</span></a></article>)}</div></section> : null; })}
  </>;
}

export const metadata = pageMetadata("Tài liệu tham khảo", "Giáo trình, tài liệu chính thức và nghiên cứu gốc để học sâu hơn về Machine Learning và AI.", "/resources", false);
