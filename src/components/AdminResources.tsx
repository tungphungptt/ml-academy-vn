"use client";
import { useRouter } from "next/navigation"; import { useState } from "react";
type R = { id: string; title: string; url: string; kind: string };
const J = { "Content-Type": "application/json" };
export default function AdminResources({ resources }: { resources: R[] }) {
  const router = useRouter(); const [err, setErr] = useState("");
  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget, d = Object.fromEntries(new FormData(f)); setErr("");
    const r = await fetch("/api/admin/resource", { method: "POST", headers: J, body: JSON.stringify(d) });
    if (r.ok) { f.reset(); router.refresh(); } else setErr((await r.json().catch(() => ({}))).error ?? "Lỗi");
  }
  async function del(id: string) { const r = await fetch("/api/admin/resource", { method: "DELETE", headers: J, body: JSON.stringify({ id }) }); if (r.ok) router.refresh(); else setErr("Không xóa được"); }
  return <section><h2>Tài nguyên ({resources.length})</h2>
    <ul>{resources.map(r => <li key={r.id}><a href={r.url}>{r.title}</a> [{r.kind}] <button onClick={() => del(r.id)}>Xóa</button></li>)}</ul>
    <form onSubmit={add} style={{ display: "grid", gap: ".5rem", maxWidth: 480 }}>
      <input name="title" placeholder="Tiêu đề" required /><input name="description" placeholder="Mô tả ngắn" required /><input name="topic" placeholder="Chủ đề" required />
      <select name="kind" defaultValue="docs">{["book", "course", "docs", "paper", "repo"].map(k => <option key={k}>{k}</option>)}</select>
      <input name="url" type="url" placeholder="https://..." required /><button>Thêm tài nguyên</button>{err && <p role="alert">{err}</p>}</form></section>;
}
