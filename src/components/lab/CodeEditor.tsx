"use client";
import { useRef } from "react"; import { tokenize } from "@/lib/highlight";
export default function CodeEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const pre = useRef<HTMLPreElement>(null);
  const common = { fontFamily: "monospace", fontSize: 14, lineHeight: "20px", padding: 12, margin: 0, whiteSpace: "pre" as const, boxSizing: "border-box" as const, width: "100%", tabSize: 4 };
  return <div style={{ position: "relative", height: 340, border: "1px solid #8884", borderRadius: 8, overflow: "hidden" }}>
    <pre ref={pre} aria-hidden style={{ ...common, position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", background: "transparent", borderRadius: 0 }}>{tokenize(value).map((k, i) => <span key={i} className={k.c ? `tk-${k.c}` : undefined}>{k.t}</span>)}{"\n"}</pre>
    <textarea aria-label="Code Python" value={value} onChange={e => onChange(e.target.value)} wrap="off" spellCheck={false}
      onScroll={e => { if (pre.current) { pre.current.scrollTop = e.currentTarget.scrollTop; pre.current.scrollLeft = e.currentTarget.scrollLeft; } }}
      style={{ ...common, position: "absolute", inset: 0, height: "100%", resize: "none", background: "transparent", color: "transparent", caretColor: "var(--fg)", border: 0, outline: "none", overflow: "auto" }} />
  </div>;
}
