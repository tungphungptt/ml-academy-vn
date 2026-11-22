import { pageMetadata } from "@/lib/metadata";
import { db } from "@/lib/db";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import CodeBlock from "@/components/CodeBlock";
import Icon from "@/components/Icon";
import { normalizeSearch } from "@/lib/search";
import { singleQueryValues, type QueryParams } from "@/lib/queryParams";
export const dynamic = "force-dynamic";
export default async function Datasets({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const { q = "", task = "" } = singleQueryValues(await searchParams);
  const all = await db.dataset.findMany({ orderBy: { name: "asc" } });
  const query = normalizeSearch(q.trim());
  const ds = all.filter(d => (!query || normalizeSearch(`${d.name} ${d.description} ${d.task}`).includes(query)) && (!task || d.task === task));
  return <><PageHeading eyebrow="BẮT ĐẦU TỪ DỮ LIỆU" title="Thư viện dữ liệu" description="Chọn dữ liệu theo bài toán. Đọc nguồn, giấy phép và baseline trước khi bắt đầu một thực nghiệm." />
    <form className="filters" role="search"><label className="filter-field query">Tìm dữ liệu<input name="q" type="search" defaultValue={q} placeholder="Tên dataset hoặc nội dung dữ liệu" /></label><label className="filter-field">Bài toán<select name="task" defaultValue={task}><option value="">Mọi bài toán</option>{[...new Set(all.map(d => d.task))].map(t => <option key={t}>{t}</option>)}</select></label><button className="primary">Lọc dữ liệu</button><a className="filter-reset" href="/datasets">Xóa bộ lọc</a></form>
    {ds.length === 0 && <EmptyState icon="grid" title={all.length ? "Không tìm thấy dataset phù hợp" : "Chưa có dataset trong thư viện"} description={all.length ? "Thử tên khác hoặc chọn mọi bài toán để khám phá thư viện." : "Các lab hiện có vẫn kèm dữ liệu mẫu hoặc hướng dẫn nạp dữ liệu để bạn thực hành."} href={all.length ? "/datasets" : "/lab"} action={all.length ? "Xem tất cả dữ liệu" : "Mở Code Lab"} />}
    {ds.map(d => <section className="data-card" id={d.slug} key={d.id}><span className="badge neutral">{d.task}</span><h2>{d.name}</h2><p>{d.description}</p><div className="data-facts"><span><strong>{d.rows.toLocaleString("vi-VN")}</strong>mẫu</span><span><strong>{d.features}</strong>đặc trưng</span><span><strong><a className="text-link" href={d.url}>Nguồn dữ liệu<Icon name="external" /></a></strong>Thông tin gốc</span></div><p className="data-license">Giấy phép: {d.license}</p><p><strong>Baseline gợi ý</strong> · {d.baseline}</p><CodeBlock text={d.loadCode} lang="python" /></section>)}
  </>;
}

export const metadata = pageMetadata("Thư viện dữ liệu", "Khám phá dataset học Machine Learning cùng nguồn gốc, giấy phép, code nạp dữ liệu và baseline tham khảo.", "/datasets", false);
