"use client";
import { useRouter } from "next/navigation"; import { useState } from "react";
type D = { id: string; slug: string; name: string };
const J = { "Content-Type": "application/json" };
export default function AdminDatasets({ datasets }: { datasets: D[] }) {
  const router = useRouter(); const [err, setErr] = useState("");
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget, d: Record<string, unknown> = Object.fromEntries(new FormData(f)); setErr("");
    d.rows = Number(d.rows); d.features = Number(d.features);
    const r = await fetch("/api/admin/dataset", { method: "POST", headers: J, body: JSON.stringify(d) });
    if (r.ok) { f.reset(); router.refresh(); } else setErr((await r.json().catch(() => ({}))).error ?? "Lỗi");
  }
  async function del(id: string) { const r = await fetch("/api/admin/dataset", { method: "DELETE", headers: J, body: JSON.stringify({ id }) }); if (r.ok) router.refresh(); else setErr("Không xóa được"); }
  return <section><h2>Dataset ({datasets.length})</h2>
    <ul>{datasets.map(d => <li key={d.id}>{d.name} ({d.slug}) <button onClick={() => del(d.id)}>Xóa</button></li>)}</ul>
    <form onSubmit={add} style={{ display: "grid", gap: ".5rem", maxWidth: 480 }}>
      <input name="slug" placeholder="slug (vd: wine)" required /><input name="name" placeholder="Tên" required /><input name="description" placeholder="Mô tả" required /><input name="task" placeholder="Loại bài toán" required />
      <input name="rows" type="number" min={1} placeholder="Số mẫu" required /><input name="features" type="number" min={1} placeholder="Số đặc trưng" required />
      <input name="url" type="url" placeholder="URL nguồn https://..." required /><input name="license" placeholder="Giấy phép / ghi chú nguồn" required />
      <textarea name="loadCode" placeholder="Code Python đọc dữ liệu" rows={3} required /><input name="baseline" placeholder="Baseline gợi ý" required />
      <button>Thêm dataset</button>{err && <p role="alert">{err}</p>}</form></section>;
}
