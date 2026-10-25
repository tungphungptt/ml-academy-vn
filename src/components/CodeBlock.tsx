"use client";
import { useState } from "react"; import { tokenize } from "@/lib/highlight";
export default function CodeBlock({ text, lang }: { text: string; lang: string }) {
  const [done, setDone] = useState(false);
  async function copy() { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); } catch { /* trình duyệt không cho phép */ } }
  return <div className="codeblock"><div className="cb-bar"><span>{lang || "text"}</span><button onClick={copy} aria-label="Sao chép code">{done ? "✓ Đã chép" : "Sao chép"}</button></div>
    <pre><code>{lang === "python" ? tokenize(text).map((k, i) => <span key={i} className={k.c ? `tk-${k.c}` : undefined}>{k.t}</span>) : text}</code></pre></div>;
}
