"use client";
import { useState } from "react";
export default function ResetForm({ token }: { token: string }) {
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setMsg(null); const next = String(new FormData(e.currentTarget).get("next"));
    const r = await fetch("/api/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, next }) });
    setMsg(r.ok ? { ok: true, t: "Đã đặt lại mật khẩu. Bạn có thể đăng nhập." } : { ok: false, t: (await r.json().catch(() => ({}))).error ?? "Không đặt lại được" }); setBusy(false);
  }
  return <form onSubmit={submit} style={{ display: "grid", gap: ".6rem", maxWidth: 380 }}><label>Mật khẩu mới (8 ký tự trở lên)<input name="next" type="password" minLength={8} required autoComplete="new-password" style={{ width: "100%" }} /></label>
    <button className="primary" disabled={busy}>{busy ? "Đang lưu..." : "Đặt lại mật khẩu"}</button>{msg && <p role={msg.ok ? "status" : "alert"}>{msg.t} {msg.ok && <a href="/login">Đăng nhập</a>}</p>}</form>;
}
