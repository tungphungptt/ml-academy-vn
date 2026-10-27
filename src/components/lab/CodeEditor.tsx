"use client";
import { useRef } from "react"; import { tokenize } from "@/lib/highlight";
export default function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pre = useRef<HTMLPreElement>(null);
  return <div className="code-editor">
    <pre ref={pre} aria-hidden className="code-editor-layer">{tokenize(value).map((k, i) => <span key={i} className={k.c ? `tk-${k.c}` : undefined}>{k.t}</span>)}{"\n"}</pre>
    <textarea className="code-editor-layer" aria-label="Code Python" value={value} onChange={e => onChange(e.target.value)} wrap="off" spellCheck={false}
      onScroll={e => { if (pre.current) { pre.current.scrollTop = e.currentTarget.scrollTop; pre.current.scrollLeft = e.currentTarget.scrollLeft; } }} />
  </div>;
}
