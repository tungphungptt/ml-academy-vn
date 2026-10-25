"use client";
import { useState } from "react";
export default function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const f = e.currentTarget, d = Object.fromEntries(new FormData(f)); setBusy(true); setMsg(null);
    const r = await fetch("/api/account/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current: d.current, next: d.next }) });
    if (r.ok) { f.reset(); setMsg({ ok: true, t: "Đã đổi mật khẩu." }); } else setMsg({ ok: false, t: (await r.json().catch(() => ({}))).error ?? "Không đổi được mật khẩu" });
    setBusy(false);
  }
  return <form onSubmit={submit} style={{ display: "grid", gap: ".6rem", maxWidth: 380 }}>
    <label>Mật khẩu hiện tại<input name="current" type="password" required autoComplete="current-password" style={{ width: "100%" }} /></label>
    <label>Mật khẩu mới (8 ký tự trở lên)<input name="next" type="password" minLength={8} required autoComplete="new-password" style={{ width: "100%" }} /></label>
    <button className="primary" disabled={busy}>{busy ? "Đang lưu..." : "Đổi mật khẩu"}</button>
    {msg && <p role={msg.ok ? "status" : "alert"} style={{ color: msg.ok ? "var(--ok)" : undefined }}>{msg.t}</p>}</form>;
}
