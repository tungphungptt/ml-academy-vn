"use client";
import { useState } from "react";
export default function LessonActions({ lessonId, initialDone, loggedIn }: { lessonId: string; initialDone: boolean; loggedIn: boolean }) {
  const [done, setDone] = useState(initialDone); const [err, setErr] = useState("");
  if (!loggedIn) return <p><a href="/login">Đăng nhập</a> để lưu tiến độ học.</p>;
  async function toggle() {
    setErr(""); const next = !done;
    const r = await fetch("/api/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, done: next }) });
    if (r.ok) setDone(next); else setErr("Không lưu được tiến độ");
  }
  return <div><button onClick={toggle} aria-pressed={done}>{done ? "✓ Đã hoàn thành (bấm để bỏ)" : "Đánh dấu hoàn thành"}</button>{err && <span role="alert"> {err}</span>}</div>;
}
