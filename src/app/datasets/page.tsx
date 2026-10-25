import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Datasets() {
  const ds = await db.dataset.findMany({ orderBy: { name: "asc" } });
  return <><h1>Thư viện dữ liệu</h1>{ds.map(d => <section key={d.id}><h2>{d.name}</h2><p>{d.description}</p>
    <p>{d.task} · {d.rows} mẫu · {d.features} đặc trưng · <a href={d.url}>Nguồn</a></p><p>Giấy phép: {d.license}</p><p>Baseline gợi ý: {d.baseline}</p><pre>{d.loadCode}</pre></section>)}</>;
}
