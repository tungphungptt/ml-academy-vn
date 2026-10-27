import { db } from "@/lib/db";
import PageHeading from "@/components/PageHeading";
import EmptyState from "@/components/EmptyState";
import CodeBlock from "@/components/CodeBlock";
import Icon from "@/components/Icon";
export const dynamic = "force-dynamic";
export default async function Datasets() {
  const ds = await db.dataset.findMany({ orderBy: { name: "asc" } });
  return <><PageHeading eyebrow="BẮT ĐẦU TỪ DỮ LIỆU" title="Thư viện dữ liệu" description="Chọn dữ liệu theo bài toán. Đọc nguồn, giấy phép và baseline trước khi bắt đầu một thực nghiệm." />
    {ds.length === 0 && <EmptyState icon="grid" title="Chưa có dataset trong thư viện" description="Các lab hiện có vẫn kèm dữ liệu mẫu hoặc hướng dẫn nạp dữ liệu để bạn thực hành." href="/lab" action="Mở Code Lab" />}
    {ds.map(d => <section className="data-card" key={d.id}><span className="badge neutral">{d.task}</span><h2>{d.name}</h2><p>{d.description}</p><div className="data-facts"><span><strong>{d.rows.toLocaleString("vi-VN")}</strong>mẫu</span><span><strong>{d.features}</strong>đặc trưng</span><span><strong><a className="text-link" href={d.url}>Nguồn dữ liệu<Icon name="external" /></a></strong>Thông tin gốc</span></div><p className="data-license">Giấy phép: {d.license}</p><p><strong>Baseline gợi ý</strong> · {d.baseline}</p><CodeBlock text={d.loadCode} lang="python" /></section>)}
  </>;
}
