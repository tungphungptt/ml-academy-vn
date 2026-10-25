import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
const KIND: Record<string, string> = { book: "Sách và giáo trình", course: "Khóa học", docs: "Tài liệu chính thức", paper: "Bài báo khoa học", repo: "GitHub" };
export default async function Resources() {
  const rs = await db.resource.findMany({ orderBy: { title: "asc" } });
  return <><h1>Tài liệu tham khảo</h1>{Object.entries(KIND).map(([k, label]) => { const g = rs.filter(r => r.kind === k); return g.length ? <section key={k}><h2>{label}</h2><ul>{g.map(r => <li key={r.id}><a href={r.url}>{r.title}</a> ({r.topic}): {r.description}</li>)}</ul></section> : null; })}</>;
}
