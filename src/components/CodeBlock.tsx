"use client";
import { useEffect, useRef, useState } from "react";
import { tokenize } from "@/lib/highlight";
import Icon from "./Icon";
export default function CodeBlock({ text, lang }: { text: string; lang: string }) {
  const [done, setDone] = useState(false), [error, setError] = useState("");
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyAttempt = useRef(0);
  useEffect(() => () => {
    copyAttempt.current++;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
  }, []);
  async function copy() {
    const attempt = ++copyAttempt.current;
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    setError("");
    try {
      await navigator.clipboard.writeText(text);
      if (attempt !== copyAttempt.current) return;
      setDone(true);
      feedbackTimer.current = setTimeout(() => { setDone(false); feedbackTimer.current = null; }, 1600);
    } catch {
      if (attempt !== copyAttempt.current) return;
      setDone(false);
      setError("Trình duyệt chưa cho sao chép tự động. Bạn có thể chọn code và sao chép thủ công.");
    }
  }
  return <div className="codeblock"><div className="cb-bar"><span>{lang || "text"}</span><button type="button" onClick={copy} aria-label="Sao chép code"><Icon name={done ? "check" : "copy"} />{done ? "Đã chép" : "Sao chép"}</button></div><pre tabIndex={0} role="region" aria-label="Mã nguồn; cuộn ngang để xem đầy đủ"><code>{lang === "python" ? tokenize(text).map((part, i) => <span key={i} className={part.c ? `tk-${part.c}` : undefined}>{part.t}</span>) : text}</code></pre>{error && <p className="copy-message" role="status">{error}</p>}</div>;
}
