"use client";
import { useState } from "react";
import Icon from "./Icon";
export default function LessonActions({ lessonId, initialDone, loggedIn }: { lessonId: string; initialDone: boolean; loggedIn: boolean }) {
  const [done, setDone] = useState(initialDone), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  if (!loggedIn) return <p className="notice"><Icon name="bookmark" /><span><a href="/login">Đăng nhập</a> để lưu tiến độ và ghi chú của bạn.</span></p>;
  async function toggle() {
    if (busy) return;
    setErr(""); setBusy(true); const next = !done;
    try {
      const r = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, done: next }) });
      if (r.ok) setDone(next); else setErr("Không lưu được tiến độ. Hãy thử lại.");
    } catch { setErr("Chưa kết nối được để lưu tiến độ. Hãy thử lại."); }
    finally { setBusy(false); }
  }
  return <div className="lesson-completion"><button className={done ? "done" : "primary"} onClick={toggle} aria-pressed={done} disabled={busy}>{busy ? <span className="spinner" aria-hidden="true" /> : <Icon name="check" />}{busy ? "Đang lưu…" : done ? "Đã hoàn thành (bấm để bỏ)" : "Đánh dấu hoàn thành"}</button>{err && <p className="notice error" role="alert">{err}</p>}</div>;
}
