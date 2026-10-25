import { searchDocs } from "@/lib/search"; import { getSearchDocs } from "@/lib/content";
export const dynamic = "force-dynamic"; export const metadata = { title: "Tìm bài học | ML Academy VN" };
export default function Search({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q ?? "").trim(); const docs = getSearchDocs(); const hits = searchDocs(docs, q);
  return <><h1>Tìm bài học</h1>
    <form role="search" style={{ display: "flex", gap: ".5rem" }}><input type="search" name="q" defaultValue={q} placeholder="Ví dụ: gradient, dao ham, softmax" aria-label="Từ khóa" style={{ flex: 1 }} autoFocus /><button className="primary">Tìm</button></form>
    <p style={{ color: "var(--mut)" }}>Tìm trong nội dung {docs.length} bài, không phân biệt dấu; mọi từ khóa phải xuất hiện.</p>
    {q.length > 0 && hits.length === 0 && <p>Không có bài nào khớp “{q}”. Hãy thử từ khóa ngắn hơn hoặc bỏ dấu.</p>}
    {hits.map(h => <div className="hit" key={h.slug}><a href={`/learn/${h.slug}`}><b>{h.title}</b></a><p>{h.snippet}</p></div>)}</>;
}
