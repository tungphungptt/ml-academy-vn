import { pageMetadata } from "@/lib/metadata";
import { db } from "@/lib/db";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import LearningPipeline from "@/components/LearningPipeline";
import { normalizeSearch } from "@/lib/search";
import { singleQueryValues, type QueryParams } from "@/lib/queryParams";
export const dynamic = "force-dynamic";
export default async function Projects({ searchParams }: { searchParams: Promise<QueryParams> }) {
  const { q = "", level = "" } = singleQueryValues(await searchParams);
  const all = await db.project.findMany({ orderBy: { title: "asc" } });
  const query = normalizeSearch(q.trim());
  const ps = all.filter(p => (!query || normalizeSearch(`${p.title} ${p.description}`).includes(query)) && (!level || p.level === level));
  return <><PageHeading eyebrow="TỪ BÀI HỌC ĐẾN BÀI TOÁN" title="Dự án thực hành" description={`${ps.length} dự án để nối kiến thức thành một quy trình: đặt câu hỏi, xây baseline và đánh giá kết quả.`} />
    <LearningPipeline />
    <form className="filters" role="search"><label className="filter-field query">Tìm dự án<input name="q" type="search" defaultValue={q} placeholder="Bài toán hoặc chủ đề bạn muốn thực hành" /></label><label className="filter-field">Trình độ<select name="level" defaultValue={level}><option value="">Mọi trình độ</option>{[...new Set(all.map(p => p.level))].map(l => <option key={l}>{l}</option>)}</select></label><button className="primary">Lọc dự án</button><a className="filter-reset" href="/projects">Xóa bộ lọc</a></form>
    {ps.length === 0 && <EmptyState icon="code" title={all.length ? "Không tìm thấy dự án phù hợp" : "Chưa có dự án được thêm"} description={all.length ? "Thử một chủ đề khác hoặc bỏ bớt bộ lọc." : "Bạn vẫn có thể bắt đầu với các lab có code và notebook theo từng chủ đề."} href={all.length ? "/projects" : "/lab"} action={all.length ? "Xem tất cả dự án" : "Mở Code Lab"} />}
    <div className="project-grid">{ps.map((p, i) => <section className="project-card" key={p.id}><div className="row2"><span className="eyebrow">DỰ ÁN {String(i + 1).padStart(2, "0")}</span><span className="badge neutral">{p.level}</span></div><h2>{p.title}</h2><p>{p.description}</p>
      {p.datasetSlug && <p><a className="text-link" href={`/datasets#${p.datasetSlug}`}><Icon name="grid" />Dataset: {p.datasetSlug}</a></p>}<ol>{(JSON.parse(p.stepsJson) as string[]).map((s, index) => <li key={index}>{s}</li>)}</ol>
      <div className="project-evaluation"><p><strong>Baseline</strong> · {p.baseline}</p><p><strong>Chỉ số đánh giá</strong> · {p.metric}</p></div><p>{p.notebookStatus}</p>{p.notebookUrl && <a className="btn" href={p.notebookUrl} download><Icon name="download" />Tải notebook (.ipynb)</a>}
    </section>)}</div>
  </>;
}

export const metadata = pageMetadata("Dự án thực hành", "Nối kiến thức AI thành một dự án: đặt bài toán, chọn dữ liệu, xây baseline và đánh giá kết quả.", "/projects", false);
