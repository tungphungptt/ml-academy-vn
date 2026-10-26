"use client";
import { useRef, useState } from "react"; import CodeEditor from "./CodeEditor";
import MarkdownContent from "../MarkdownContent";
type Lab = { id: string; title: string; description: string; lessonSlugs?: string[]; runtime: "pyodide" | "local"; variants: string[]; expected: Record<string, string | null>; notebooks?: Record<string, string>; code: Record<string, string> };
const TIMEOUT_MS = 90000;
export default function CodeLab({ labs, initialLabId, lessonTitles = {} }: { labs: Lab[]; initialLabId?: string; lessonTitles?: Record<string, string> }) {
  const [id, setId] = useState(labs.some(l => l.id === initialLabId) ? initialLabId! : labs[0].id); const [variant, setVariant] = useState("scratch");
  const lab = labs.find(l => l.id === id)!; const v = lab.variants.includes(variant) ? variant : lab.variants[0];
  const orig = lab.code[v]; const [edits, setEdits] = useState<Record<string, string>>({});
  const key = `${id}:${v}`; const code = edits[key] ?? orig;
  const [out, setOut] = useState(""); const [err, setErr] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  const worker = useRef<Worker | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function kill(msg: string, error = "") { if (timer.current) clearTimeout(timer.current); worker.current?.terminate(); worker.current = null; setBusy(false); setStatus(msg); if (error) setErr(error); }
  function pick(nid: string) { kill(""); setId(nid); setOut(""); setErr(""); }
  function run() {
    setBusy(true); setOut(""); setErr(""); setStatus("Đang chạy trong Web Worker (lần đầu cần Internet để tải Pyodide)...");
    const pk = ["numpy", ...(/sklearn/.test(code) ? ["scikit-learn"] : [])];
    const w = worker.current ?? (worker.current = new Worker("/pyodide-worker.js"));
    timer.current = setTimeout(() => kill("Đã dừng.", `Quá thời gian ${TIMEOUT_MS / 1000} giây nên chương trình bị dừng.`), TIMEOUT_MS);
    w.onmessage = e => { if (timer.current) clearTimeout(timer.current); const d = e.data; setOut(d.out); if (d.type === "error") { setErr(d.message); setStatus("Lỗi."); } else setStatus("Hoàn tất."); setBusy(false); };
    w.onerror = () => kill("Lỗi.", "Không khởi động được Worker/Pyodide (cần Internet để tải Pyodide).");
    w.postMessage({ code, packages: pk });
  }
  const download = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([code], { type: "text/x-python" })); a.download = `${id}_${v}.py`; a.click(); URL.revokeObjectURL(a.href); };
  const copy = async () => { try { await navigator.clipboard.writeText(code); setStatus("Đã sao chép code."); } catch { setStatus("Trình duyệt không cho sao chép tự động."); } };
  const exp = lab.expected[v];
  return <div>
    <label>Bài thực hành: <select value={id} onChange={e => pick(e.target.value)}>{labs.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
    <div className="lab-description"><MarkdownContent>{lab.description}</MarkdownContent></div>
    {!!lab.lessonSlugs?.length && <p>Bài học liên quan: {lab.lessonSlugs.map((slug, i) => <span key={slug}>{i > 0 && " · "}<a href={`/learn/${slug}`}>{lessonTitles[slug] ?? slug}</a></span>)}</p>}
    <div role="group" aria-label="Phiên bản">{lab.variants.map(x => <button key={x} aria-pressed={x === v} onClick={() => { kill(""); setVariant(x); setOut(""); setErr(""); }} style={{ fontWeight: x === v ? 700 : 400 }}>{x === "scratch" ? "From Scratch" : "Library-based"}</button>)}</div>
    <CodeEditor value={code} onChange={val => setEdits({ ...edits, [key]: val })} />
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
      {lab.runtime === "pyodide" && (busy ? <button onClick={() => kill("Đã dừng.")}>■ Stop</button> : <button onClick={run}>▶ Run</button>)}
      <button onClick={() => setEdits({ ...edits, [key]: orig })}>Reset Code</button><button onClick={copy}>Copy Code</button><button onClick={download}>Download .py</button>
      {lab.notebooks?.[v] && <a href={lab.notebooks[v]} download>Download Notebook (.ipynb)</a>}</div>
    {lab.runtime === "local" && <p>Bài này chạy bằng môi trường Python cục bộ; <b>không có nút Run trong trình duyệt</b>. Cài thư viện theo <a href="https://github.com/tungphungptt/ml-academy-vn/blob/main/docs/curriculum-practice.md">hướng dẫn CPU</a>, rồi chạy tại gốc repository: <code>python labs/{id}/{v}.py</code>. Notebook cũng cần repository nếu dùng file checkpoint hoặc script khác.</p>}
    {status && <p aria-live="polite">{status}</p>}
    {out && <><h3>Output</h3><pre>{out}</pre></>}{err && <><h3>Lỗi</h3><pre role="alert">{err}</pre></>}
    <h3>Kết quả kỳ vọng</h3>{exp ? <><pre>{exp}</pre><p>Ghi nhận khi chạy bằng môi trường Python CPU được pin trong repository (<code>scripts/gen_labs.py</code>). Phiên bản và hash code được lưu trong registry; số lẻ có thể chênh nhẹ trên môi trường khác. Đây là output tham khảo, không phải bộ tự chấm.</p></> : <p>Chưa xác minh: môi trường phát triển chưa có thư viện cần thiết để chạy thử file này.</p>}
  </div>;
}
