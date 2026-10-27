import { db } from "@/lib/db";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
export const dynamic = "force-dynamic";
export default async function Projects() {
  const ps = await db.project.findMany({ orderBy: { title: "asc" } });
  return <><PageHeading eyebrow="TỪ BÀI HỌC ĐẾN BÀI TOÁN" title="Dự án thực hành" description={`${ps.length} dự án để nối kiến thức thành một quy trình: đặt câu hỏi, xây baseline và đánh giá kết quả.`} />
    {ps.length === 0 && <EmptyState icon="code" title="Chưa có dự án được thêm" description="Bạn vẫn có thể bắt đầu với các lab có code và notebook theo từng chủ đề." href="/lab" action="Mở Code Lab" />}
    <div className="project-grid">{ps.map((p, i) => <section className="project-card" key={p.id}><div className="row2"><span className="eyebrow">DỰ ÁN {String(i + 1).padStart(2, "0")}</span><span className="badge neutral">{p.level}</span></div><h2>{p.title}</h2><p>{p.description}</p>
      {p.datasetSlug && <p><a className="text-link" href="/datasets"><Icon name="grid" />Dataset: {p.datasetSlug}</a></p>}<ol>{(JSON.parse(p.stepsJson) as string[]).map((s, index) => <li key={index}>{s}</li>)}</ol>
      <div className="project-evaluation"><p><strong>Baseline</strong> · {p.baseline}</p><p><strong>Chỉ số đánh giá</strong> · {p.metric}</p></div><p>{p.notebookStatus}</p>{p.notebookUrl && <a className="btn" href={p.notebookUrl} download><Icon name="download" />Tải notebook (.ipynb)</a>}
    </section>)}</div>
  </>;
}
