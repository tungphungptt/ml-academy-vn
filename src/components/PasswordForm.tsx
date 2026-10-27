"use client";
import { useState } from "react";
export default function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget, d = Object.fromEntries(new FormData(f)); setBusy(true); setMsg(null);
    try {
      const r = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: d.current, next: d.next }) });
      if (r.ok) { f.reset(); setMsg({ ok: true, t: "Đã đổi mật khẩu." }); } else setMsg({ ok: false, t: (await r.json().catch(() => ({}))).error ?? "Không đổi được mật khẩu" });
    } catch { setMsg({ ok: false, t: "Chưa kết nối được. Hãy thử lại." }); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="account-form">
    <label>Mật khẩu hiện tại<input name="current" type="password" required autoComplete="current-password" /></label>
    <label>Mật khẩu mới (8 ký tự trở lên)<input name="next" type="password" minLength={8} required autoComplete="new-password" /></label>
    <button className="primary" disabled={busy}>{busy ? "Đang lưu..." : "Đổi mật khẩu"}</button>
    {msg && <p role={msg.ok ? "status" : "alert"} className={`notice ${msg.ok ? "success" : "error"}`}>{msg.t}</p>}</form>;
}
