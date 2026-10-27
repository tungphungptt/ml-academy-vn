"use client";
import { useState } from "react";
import Icon from "./Icon";
type N = { id: string; body: string };
const J = { "Content-Type": "application/json" };
export default function BookmarkNotes({ lessonId, loggedIn, bookmarked, notes: init }: { lessonId: string; loggedIn: boolean; bookmarked: boolean; notes: N[] }) {
  const [bm, setBm] = useState(bookmarked), [notes, setNotes] = useState(init), [text, setText] = useState(""), [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  if (!loggedIn) return null;
  async function mutate(kind: "bookmark" | "add" | "delete", id?: string) {
    if (busy) return; setBusy(true); setErr("");
    try {
      const r = await fetch(kind === "bookmark" ? "/api/bookmark" : "/api/note", { method: kind === "delete" ? "DELETE" : "POST", headers: J, body: JSON.stringify(kind === "bookmark" ? { lessonId, on: !bm } : kind === "add" ? { lessonId, body: text } : { id }) });
      if (!r.ok) { setErr("Chưa lưu được thay đổi. Hãy thử lại."); return; }
      if (kind === "bookmark") setBm(!bm);
      else if (kind === "delete") setNotes(notes.filter(n => n.id !== id));
      else { setNotes([...notes, await r.json()]); setText(""); }
    } catch { setErr("Chưa kết nối được. Nội dung bạn đang viết vẫn được giữ lại."); }
    finally { setBusy(false); }
  }
  return <section className="notes-panel"><button onClick={() => mutate("bookmark")} aria-pressed={bm} disabled={busy}><Icon name="bookmark" />{bm ? "Đã đánh dấu bài này" : "Bookmark bài này"}</button>
    <h2>Ghi chú của bạn</h2>{notes.length === 0 && <p className="mut">Lưu một ý chính, một câu hỏi hoặc điều bạn muốn thử lại. Ghi chú chỉ hiển thị trong tài khoản của bạn.</p>}
    <ul className="notes-list">{notes.map(n => <li key={n.id}><span className="note-body">{n.body}</span><button className="quiet" onClick={() => mutate("delete", n.id)} aria-label="Xóa ghi chú" disabled={busy}>Xóa</button></li>)}</ul>
    <label className="sr-only" htmlFor={`note-${lessonId}`}>Ghi chú mới</label><textarea id={`note-${lessonId}`} value={text} onChange={e => setText(e.target.value)} maxLength={2000} rows={4} placeholder="Điều bạn muốn nhớ từ bài học này…" aria-label="Ghi chú mới" />
    <div className="row2"><small className="mut">{text.length}/2000 ký tự</small><button onClick={() => mutate("add")} disabled={busy || !text.trim()}>Lưu ghi chú</button></div>{err && <p className="notice error" role="alert">{err}</p>}
  </section>;
}
