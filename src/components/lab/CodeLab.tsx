"use client";
import { useRef, useState } from "react"; import CodeEditor from "./CodeEditor";
import MarkdownContent from "../MarkdownContent";
import Icon from "../Icon";
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
  return <div className="lab-frame">
    <div className="lab-toolbar"><label className="lab-picker">Bài thực hành: <select value={id} onChange={e => pick(e.target.value)}>{labs.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label><span className={`badge${lab.runtime === "local" ? " warm" : ""}`}>{lab.runtime === "local" ? "Chạy trên máy · CPU" : "Chạy trong trình duyệt · Pyodide"}</span></div>
    <div className="lab-description"><MarkdownContent>{lab.description}</MarkdownContent></div>
    {!!lab.lessonSlugs?.length && <p className="lab-related">Bài học liên quan: {lab.lessonSlugs.map((slug, i) => <span key={slug}>{i > 0 && " · "}<a href={`/learn/${slug}`}>{lessonTitles[slug] ?? slug}</a></span>)}</p>}
    <div className="lab-layout"><div className="lab-workspace">
      <div className="variant-toggle" role="group" aria-label="Phiên bản">{lab.variants.map(x => <button key={x} aria-pressed={x === v} onClick={() => { kill(""); setVariant(x); setOut(""); setErr(""); }}>{x === "scratch" ? "From Scratch" : "Library-based"}</button>)}</div>
      <div className="lab-editor"><div className="editor-heading"><span>{id}/{v}.py</span><span>Python</span></div><CodeEditor value={code} onChange={val => setEdits({ ...edits, [key]: val })} /></div>
      <div className="lab-actions">
        {lab.runtime === "pyodide" && (busy ? <button onClick={() => kill("Đã dừng.")}>■ Stop</button> : <button className="primary" onClick={run}>▶ Run</button>)}
        <button onClick={() => setEdits({ ...edits, [key]: orig })}>Reset Code</button><button onClick={copy}>Copy Code</button><button onClick={download}>Download .py</button>
        {lab.notebooks?.[v] && <a className="text-link" href={lab.notebooks[v]} download><Icon name="download" />Download Notebook (.ipynb)</a>}
      </div>
      {status && <p className="lab-status" aria-live="polite">{busy && <span className="spinner" aria-hidden="true" />} {status}</p>}
    </div><div className="lab-side">
      <section className="lab-panel" aria-label="Kết quả chạy"><h2>Output</h2>{out ? <pre className="lab-output">{out}</pre> : <p className="lab-output">{lab.runtime === "local" ? "Lab này chạy trên máy của bạn. Kết quả sẽ xuất hiện trong terminal hoặc notebook." : "Nhấn Run để thực thi code. Kết quả thật sẽ xuất hiện tại đây."}</p>}{err && <pre role="alert">{err}</pre>}</section>
      <section className="lab-panel"><h2>Kết quả kỳ vọng</h2>{exp ? <><pre>{exp}</pre><p>Output tham khảo từ môi trường Python CPU được pin trong repository. Số lẻ có thể chênh nhẹ trên môi trường khác; đây không phải bộ tự chấm.</p></> : <p>Chưa xác minh trong môi trường kiểm thử.</p>}</section>
      <details className="lab-guide" open={lab.runtime === "local"}><summary>Hướng dẫn chạy & notebook</summary>{lab.runtime === "local" ? <p>Bài này chạy bằng Python cục bộ; không có nút Run trong trình duyệt. Cài thư viện theo <a href="https://github.com/tungphungptt/ml-academy-vn/blob/main/docs/curriculum-practice.md">hướng dẫn CPU</a>, rồi chạy tại gốc repository: <code>python labs/{id}/{v}.py</code>. Notebook cũng cần repository nếu dùng checkpoint hoặc script khác.</p> : <p>Code chạy thật trong Web Worker, giới hạn 90 giây. Lần đầu cần Internet để tải Pyodide và thư viện. Có thể Stop bất cứ lúc nào.</p>}<p>Xem hướng dẫn CPU để tái hiện kết quả tham khảo với cùng phiên bản thư viện.</p></details>
    </div></div>
  </div>;
}
