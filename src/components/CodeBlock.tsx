"use client";
import { useState } from "react";
import { tokenize } from "@/lib/highlight";
import Icon from "./Icon";
export default function CodeBlock({ text, lang }: { text: string; lang: string }) {
  const [done, setDone] = useState(false), [error, setError] = useState("");
  async function copy() {
    setError("");
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1600); }
    catch { setError("Trình duyệt chưa cho sao chép tự động. Bạn có thể chọn code và sao chép thủ công."); }
  }
  return <div className="codeblock"><div className="cb-bar"><span>{lang || "text"}</span><button type="button" onClick={copy} aria-label="Sao chép code"><Icon name={done ? "check" : "copy"} />{done ? "Đã chép" : "Sao chép"}</button></div><pre><code>{lang === "python" ? tokenize(text).map((part, i) => <span key={i} className={part.c ? `tk-${part.c}` : undefined}>{part.t}</span>) : text}</code></pre>{error && <p className="copy-message" role="status">{error}</p>}</div>;
}
