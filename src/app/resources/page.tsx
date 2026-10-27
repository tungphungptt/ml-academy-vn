import { db } from "@/lib/db";
import PageHeading, { SectionHeading } from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
export const dynamic = "force-dynamic";
const KIND: Record<string, string> = { book: "Sách và giáo trình", course: "Khóa học", docs: "Tài liệu chính thức", paper: "Bài báo khoa học", repo: "GitHub" };
export default async function Resources() {
  const rs = await db.resource.findMany({ orderBy: { title: "asc" } });
  return <><PageHeading eyebrow="ĐỌC SÂU HƠN" title="Tài liệu tham khảo" description="Mở rộng góc nhìn từ giáo trình, tài liệu chính thức và nghiên cứu gốc. Nguồn đối chiếu cụ thể nằm trong từng bài học." />
    {rs.length === 0 && <EmptyState title="Thư viện đang được bổ sung" description="Trong lúc chờ, bạn có thể đọc các nguồn tham khảo được dẫn trực tiếp ở cuối bài học." href="/courses" action="Mở lộ trình" icon="book" />}
    {Object.entries(KIND).map(([k, label]) => { const group = rs.filter(r => r.kind === k); return group.length ? <section key={k}><SectionHeading eyebrow={`${group.length} TÀI LIỆU`} title={label} /><div className="resource-grid">{group.map(r => <article className="resource-card" key={r.id}><span className="badge neutral">{r.topic}</span><h3>{r.title}</h3><p>{r.description}</p><a className="text-link" href={r.url}>Đọc tài liệu<Icon name="external" /><span className="sr-only">: {r.title}</span></a></article>)}</div></section> : null; })}
  </>;
}
