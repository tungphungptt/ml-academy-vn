"use client";
import { useEffect, useRef, useState } from "react"; import CodeEditor from "./CodeEditor";
import MarkdownContent from "../MarkdownContent";
import Icon from "../Icon";
import CodeBlock from "../CodeBlock";
export type Lab = { id: string; title: string; description: string; lessonSlugs?: string[]; runtime: "pyodide" | "local"; variants: string[]; expected: Record<string, string | null>; notebooks?: Record<string, string>; code: Record<string, string> };
const EXECUTION_TIMEOUT_MS = 90000, LOAD_TIMEOUT_MS = 300000;
export default function CodeLab({ labs, initialLabId, lessonTitles = {} }: { labs: Lab[]; initialLabId?: string; lessonTitles?: Record<string, string> }) {
  const [ready, setReady] = useState(false);
  const [id, setId] = useState(labs.some(l => l.id === initialLabId) ? initialLabId! : labs[0].id); const [variant, setVariant] = useState("scratch");
  const lab = labs.find(l => l.id === id)!; const v = lab.variants.includes(variant) ? variant : lab.variants[0];
  const orig = lab.code[v]; const [edits, setEdits] = useState<Record<string, string>>({});
  const key = `${id}:${v}`; const code = edits[key] ?? orig;
  const [out, setOut] = useState(""); const [err, setErr] = useState(""); const [status, setStatus] = useState(""); const [busy, setBusy] = useState(false);
  const [executedCode, setExecutedCode] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const stale = !!(out || err || completed) && executedCode !== code;
  const worker = useRef<Worker | null>(null); const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { setReady(true); return () => { if (timer.current) clearTimeout(timer.current); worker.current?.terminate(); }; }, []);
  function kill(msg: string, error = "") { if (timer.current) clearTimeout(timer.current); timer.current = null; worker.current?.terminate(); worker.current = null; setBusy(false); setCompleted(false); setStatus(msg); setErr(error); }
  function pick(nid: string) {
    kill(""); setId(nid); setOut(""); setErr("");
    const url = new URL(window.location.href); url.searchParams.set("lab", nid);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  function run() {
    if (!ready || busy) return;
    setExecutedCode(code);
    setBusy(true); setCompleted(false); setOut(""); setErr(""); setStatus("Đang chuẩn bị Python; lần đầu cần tải môi trường và thư viện...");
    const pk = [...(/\bnumpy\b/.test(code) ? ["numpy"] : []), ...(/\bsklearn\b/.test(code) ? ["scikit-learn"] : [])];
    let w: Worker;
    try { w = worker.current ?? (worker.current = new Worker("/pyodide-worker.js")); }
    catch { kill("Lỗi.", "Trình duyệt không cho khởi tạo Web Worker. Hãy tải code để chạy cục bộ."); return; }
    timer.current = setTimeout(() => kill("Đã dừng.", "Tải môi trường quá 5 phút. Hãy kiểm tra kết nối và thử lại; code chưa được chạy."), LOAD_TIMEOUT_MS);
    w.onmessage = e => {
      if (worker.current !== w) return;
      const d = e.data;
      if (d.type === "status") {
        if (d.phase === "running") {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => kill("Đã dừng.", `Code chạy quá ${EXECUTION_TIMEOUT_MS / 1000} giây nên bị dừng.`), EXECUTION_TIMEOUT_MS);
          setStatus("Đang chạy Python trong Web Worker...");
        } else setStatus(d.phase === "loading-runtime" ? "Đang tải Python; lần đầu có thể mất vài phút..." : "Đang tải thư viện cần thiết; code chưa được chạy...");
        return;
      }
      if (timer.current) clearTimeout(timer.current); timer.current = null;
      setOut(d.out ?? ""); setCompleted(d.type !== "error"); if (d.type === "error") { setErr(d.message); setStatus("Lỗi."); } else setStatus("Hoàn tất."); setBusy(false);
    };
    w.onerror = () => kill("Lỗi.", "Không khởi động được Worker/Pyodide (cần Internet để tải Pyodide).");
    w.postMessage({ code, packages: pk });
  }
  const download = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([code], { type: "text/x-python" })); a.download = `${id}_${v}.py`; a.click(); URL.revokeObjectURL(a.href); };
  const copy = async () => { try { await navigator.clipboard.writeText(code); setStatus("Đã sao chép code."); } catch { setStatus("Trình duyệt không cho sao chép tự động."); } };
  const exp = lab.expected[v];
  return <div className="lab-frame" aria-busy={!ready}>
    <div className="lab-toolbar"><label className="lab-picker">Bài thực hành: <select disabled={!ready} value={id} onChange={e => pick(e.target.value)}>{labs.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label><span className={`badge${lab.runtime === "local" ? " warm" : ""}`}>{lab.runtime === "local" ? "Chạy trên máy · CPU" : "Chạy trong trình duyệt · Pyodide"}</span></div>
    <div className="lab-description"><MarkdownContent>{lab.description}</MarkdownContent></div>
    {!!lab.lessonSlugs?.length && <p className="lab-related">Bài học liên quan: {lab.lessonSlugs.map((slug, i) => <span key={slug}>{i > 0 && " · "}<a href={`/learn/${slug}`}>{lessonTitles[slug] ?? slug}</a></span>)}</p>}
    <div className="lab-layout"><div className="lab-workspace" data-busy={busy}>
      <div className="variant-toggle" role="group" aria-label="Phiên bản">{lab.variants.map(x => <button key={x} disabled={!ready} aria-pressed={x === v} onClick={() => { kill(""); setVariant(x); setOut(""); setErr(""); }}>{x === "scratch" ? "From Scratch" : "Library-based"}</button>)}</div>
      <div className="lab-actions">
        {lab.runtime === "pyodide" && (busy ? <button onClick={() => kill("Đã dừng.")}>■ Stop</button> : <button className="primary" disabled={!ready} onClick={run}>▶ Run</button>)}
        <button disabled={!ready} onClick={() => { kill(""); setEdits({ ...edits, [key]: orig }); setOut(""); }}>Reset Code</button><button disabled={!ready} onClick={copy}>Copy Code</button><button disabled={!ready} onClick={download}>Download .py</button>
        {lab.notebooks?.[v] && <a className="text-link" href={lab.notebooks[v]} download><Icon name="download" />Download Notebook (.ipynb)</a>}
        {(out || err) && <a className="text-link" href="#lab-output">Xem output<Icon name="arrow" /></a>}
      </div>
      {status && <p className="lab-status" aria-live="polite">{busy && <span className="spinner" aria-hidden="true" />} {stale && status === "Hoàn tất." ? "Code đã thay đổi; hãy chạy lại để cập nhật kết quả." : status}</p>}
      <div className="lab-editor"><div className="editor-heading"><span>{id}/{v}.py</span><span>Python</span></div><CodeEditor value={code} disabled={!ready} onChange={val => setEdits({ ...edits, [key]: val })} /></div>
    </div><div className="lab-side">
      <section id="lab-output" tabIndex={-1} className="lab-panel" data-state={stale ? "stale" : err ? "error" : completed ? "success" : "idle"} aria-label="Kết quả chạy"><h2>Output</h2>{stale && <p role="status">Kết quả bên dưới thuộc phiên bản code trước. Nhấn Run để kiểm tra code hiện tại.</p>}{out ? <pre className="lab-output">{out}</pre> : <p className="lab-output">{completed ? "Code đã chạy xong; không có nội dung được in ra." : err ? "Code chưa tạo output trước khi gặp lỗi. Xem chi tiết bên dưới." : lab.runtime === "local" ? "Lab này chạy trên máy của bạn. Kết quả sẽ xuất hiện trong terminal hoặc notebook." : "Nhấn Run để thực thi code. Kết quả thật sẽ xuất hiện tại đây."}</p>}{err && <pre role="alert">{err}</pre>}</section>
      <section className="lab-panel"><h2>Kết quả kỳ vọng</h2>{exp ? <><pre>{exp}</pre><p>Output tham khảo từ môi trường Python CPU được pin trong repository. Số lẻ có thể chênh nhẹ trên môi trường khác; đây không phải bộ tự chấm.</p></> : <p>Chưa xác minh trong môi trường kiểm thử.</p>}</section>
      <details className="lab-guide" open={lab.runtime === "local"}><summary>Hướng dẫn chạy & notebook</summary>{lab.runtime === "local" ? <>
        <p>Dùng Python 3.12 tại thư mục gốc dự án, nơi có <code>requirements-curriculum.txt</code> và thư mục <code>labs</code>. Ví dụ dưới dùng PowerShell trên Windows; virtualenv giữ thư viện riêng cho phần thực hành.</p>
        <CodeBlock lang="powershell" text={`py -3.12 -m venv .venv\n.venv\\Scripts\\python.exe -m pip install -r requirements-curriculum.txt${/\btorch\b/.test(orig) ? '\n.venv\\Scripts\\python.exe -m pip install torch==2.14.1+cpu --index-url https://download.pytorch.org/whl/cpu' : ''}\n.venv\\Scripts\\python.exe labs/${id}/${v}.py`} />
        <p>Trên macOS/Linux, tạo môi trường bằng <code>python3.12 -m venv .venv</code> và thay đường dẫn interpreter bằng <code>.venv/bin/python</code>. Wheel PyTorch phải phù hợp nền tảng; kiểm tra <a href="https://pytorch.org/get-started/locally/">hướng dẫn cài chính thức</a> nếu không có bản CPU tương ứng.</p>
        <p>Notebook cần chạy từ gốc dự án khi sử dụng checkpoint hoặc script khác, đặc biệt lab transfer. Không tải checkpoint không rõ nguồn gốc. Lab này không chạy PyTorch trong trình duyệt.</p>
      </> : <p>Code chạy thật trong Web Worker, tối đa 90 giây sau khi môi trường sẵn sàng. Lần đầu cần Internet; tải Python và thư viện có thời hạn riêng 5 phút. Có thể Stop ở bất kỳ giai đoạn nào.</p>}</details>
    </div></div>
  </div>;
}
