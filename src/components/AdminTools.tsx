"use client";
import { useState } from "react";
const J = { "Content-Type": "application/json" };
export function AdminReset() {
  const [link, setLink] = useState(""); const [msg, setMsg] = useState("");
  async function go(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setMsg(""); setLink(""); const email = String(new FormData(e.currentTarget).get("email"));
    const r = await fetch("/api/admin/reset-link", { method: "POST", headers: J, body: JSON.stringify({ email }) }); const d = await r.json().catch(() => ({}));
    if (r.ok) { setLink(d.link); setMsg(`Liên kết có hiệu lực ${d.expiresInMinutes} phút và chỉ hiện một lần. Hãy gửi riêng cho người dùng.`); } else setMsg(d.error ?? "Không tạo được liên kết");
  }
  return <section><h2>Đặt lại mật khẩu cho người dùng</h2><form onSubmit={go} style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><input name="email" type="email" placeholder="Email người dùng" required /><button>Tạo liên kết đặt lại</button></form>
    {msg && <p role="status">{msg}</p>}{link && <input readOnly value={link} onFocus={e => e.currentTarget.select()} style={{ width: "100%" }} aria-label="Liên kết đặt lại" />}</section>;
}
export function AdminEditor({ files }: { files: string[] }) {
  const [file, setFile] = useState(files[0] ?? ""); const [text, setText] = useState(""); const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  async function load() { setMsg(""); const r = await fetch(`/api/admin/content?file=${encodeURIComponent(file)}`); const d = await r.json().catch(() => ({})); if (r.ok) { setText(d.text); setMsg("Đã tải."); } else setMsg(d.error ?? "Không tải được"); }
  async function save() { setBusy(true); setMsg(""); const r = await fetch("/api/admin/content", { method: "PUT", headers: J, body: JSON.stringify({ file, text }) }); setMsg(r.ok ? "Đã lưu bài học." : (await r.json().catch(() => ({}))).error ?? "Không lưu được"); setBusy(false); }
  return <section><h2>Soạn nội dung bài học (Markdown + LaTeX)</h2><p className="mut">Các chỉnh sửa được lưu riêng và được ưu tiên so với nội dung mặc định khi cập nhật ứng dụng. Tên file mới phải dạng <code>ten-bai.md</code>, rồi liên kết với bài học ở phần trên.</p>
    <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}><input list="lesson-files" value={file} onChange={e => setFile(e.target.value)} aria-label="Tên file" /><datalist id="lesson-files">{files.map(f => <option key={f} value={f} />)}</datalist><button onClick={load}>Tải</button><button className="primary" onClick={save} disabled={busy || !text.trim()}>Lưu</button></div>
    <textarea value={text} onChange={e => setText(e.target.value)} rows={22} spellCheck={false} aria-label="Nội dung Markdown" style={{ width: "100%", fontFamily: "monospace", fontSize: 14, marginTop: 8 }} />{msg && <p role="status">{msg}</p>}</section>;
}
