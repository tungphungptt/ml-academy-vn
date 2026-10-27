"use client";
import { useState } from "react";
export default function ResetForm({ token }: { token: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null); const next = String(new FormData(e.currentTarget).get("next"));
    try {
      const r = await fetch("/api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, next }) });
      setMsg(r.ok ? { ok: true, t: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập." } : { ok: false, t: (await r.json().catch(() => ({}))).error ?? "Không đặt lại được" });
    } catch { setMsg({ ok: false, t: "Chưa kết nối được. Hãy thử lại." }); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="account-form"><label>Mật khẩu mới (8 ký tự trở lên)<input name="next" type="password" minLength={8} required autoComplete="new-password" /></label>
    <button className="primary" disabled={busy}>{busy ? "Đang lưu..." : "Đặt lại mật khẩu"}</button>{msg && <p className={`notice ${msg.ok ? "success" : "error"}`} role={msg.ok ? "status" : "alert"}>{msg.t} {msg.ok && <a href="/login">Đăng nhập</a>}</p>}</form>;
}
