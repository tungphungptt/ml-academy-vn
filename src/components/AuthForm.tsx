"use client";
import { useState } from "react";
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [err, setErr] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr("");
    const f = new FormData(e.currentTarget);
    const r = await fetch(`/api/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), password: f.get("password") }) });
    if (r.ok) { window.location.href = "/"; return; }
    setErr((await r.json().catch(() => ({}))).error ?? "Có lỗi xảy ra"); setBusy(false);
  }
  return <form onSubmit={submit} style={{ display: "grid", gap: ".75rem", maxWidth: 360 }}>
    <h1>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h1>
    <label>Email<input name="email" type="email" required style={{ width: "100%" }} /></label>
    <label>Mật khẩu (tối thiểu 8 ký tự)<input name="password" type="password" minLength={mode === "register" ? 8 : 1} required style={{ width: "100%" }} /></label>
    {err && <p role="alert" style={{ color: "crimson" }}>{err}</p>}
    <button disabled={busy}>{busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}</button>
  {mode === "login" && <p className="mut" style={{ fontSize: ".9rem" }}>Quên mật khẩu? Hãy nhờ quản trị viên tạo liên kết đặt lại cho bạn.</p>}</form>;
}
