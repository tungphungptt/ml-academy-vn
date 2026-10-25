"use client";
import { useState } from "react";
type N = { id: string; body: string };
const J = { "Content-Type": "application/json" };
export default function BookmarkNotes({ lessonId, loggedIn, bookmarked, notes: init }: { lessonId: string; loggedIn: boolean; bookmarked: boolean; notes: N[] }) {
  const [bm, setBm] = useState(bookmarked); const [notes, setNotes] = useState(init); const [text, setText] = useState(""); const [err, setErr] = useState("");
  if (!loggedIn) return null;
  async function toggle() { const r = await fetch("/api/bookmark", { method: "POST", headers: J, body: JSON.stringify({ lessonId, on: !bm }) }); if (r.ok) setBm(!bm); else setErr("Không lưu được bookmark"); }
  async function add() { setErr(""); const r = await fetch("/api/note", { method: "POST", headers: J, body: JSON.stringify({ lessonId, body: text }) }); if (r.ok) { setNotes([...notes, await r.json()]); setText(""); } else setErr("Không lưu được ghi chú"); }
  async function del(id: string) { const r = await fetch("/api/note", { method: "DELETE", headers: J, body: JSON.stringify({ id }) }); if (r.ok) setNotes(notes.filter(n => n.id !== id)); }
  return <section><button onClick={toggle} aria-pressed={bm}>{bm ? "★ Đã đánh dấu" : "☆ Bookmark bài này"}</button>
    <h2>Ghi chú của bạn</h2>{notes.length === 0 && <p>Chưa có ghi chú.</p>}
    <ul>{notes.map(n => <li key={n.id}>{n.body} <button onClick={() => del(n.id)} aria-label="Xóa ghi chú">Xóa</button></li>)}</ul>
    <textarea value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={3} style={{ width: "100%" }} aria-label="Ghi chú mới" />
    <button onClick={add} disabled={!text.trim()}>Lưu ghi chú</button>{err && <p role="alert">{err}</p>}</section>;
}
