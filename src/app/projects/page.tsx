import { db } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Projects() {
  const ps = await db.project.findMany({ orderBy: { title: "asc" } });
  return <><h1>Dự án thực hành</h1>{ps.map(p => <section key={p.id}><h2>{p.title}</h2><p>{p.description} ({p.level})</p>
    {p.datasetSlug && <p>Dataset: <a href="/datasets">{p.datasetSlug}</a></p>}<ol>{(JSON.parse(p.stepsJson) as string[]).map((s, i) => <li key={i}>{s}</li>)}</ol>
    <p>Baseline: {p.baseline} · Chỉ số: {p.metric}</p><p><i>{p.notebookStatus}</i></p>{p.notebookUrl && <p><a className="btn primary" href={p.notebookUrl} download>Tải notebook (.ipynb)</a></p>}</section>)}</>;
}
