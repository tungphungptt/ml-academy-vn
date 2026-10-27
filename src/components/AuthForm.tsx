"use client";
import { useState } from "react";
import Icon from "./Icon";
export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [err, setErr] = useState(""), [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy) return;
    const f = new FormData(e.currentTarget); setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: f.get("email"), password: f.get("password") }) });
      if (r.ok) { window.location.href = "/"; return; }
      setErr((await r.json().catch(() => ({}))).error ?? "Chưa thể xử lý yêu cầu. Hãy thử lại.");
    } catch { setErr("Chưa kết nối được. Hãy kiểm tra mạng và thử lại."); }
    finally { setBusy(false); }
  }
  return <div className="auth-layout"><aside className="auth-aside"><div><p className="eyebrow">ML ACADEMY · VIỆT NAM</p><p className="auth-statement">Học một điều mới.<br />Kết nối một ý tưởng.</p><p>Không gian của bạn để học từ nền tảng, thực hành bằng code và nhìn lại điều đã hiểu.</p></div><ul><li><Icon name="check" />Lưu tiến độ từng bài học</li><li><Icon name="check" />Làm quiz và đọc lời giải</li><li><Icon name="check" />Bookmark và ghi chú riêng</li></ul></aside>
    <form className="auth-form" onSubmit={submit} aria-busy={busy}><p className="eyebrow">{mode === "login" ? "CHÀO MỪNG BẠN TRỞ LẠI" : "BẮT ĐẦU HÀNH TRÌNH"}</p><h1>{mode === "login" ? "Đăng nhập" : "Đăng ký"}</h1><p>{mode === "login" ? "Tiếp tục từ bài học đang chờ bạn." : "Tạo tài khoản để lưu những bước tiến của bạn."}</p>
      <label>Email<input name="email" type="email" autoComplete="email" placeholder="ban@example.com" required /></label>
      <label>{mode === "register" ? "Mật khẩu (tối thiểu 8 ký tự)" : "Mật khẩu"}<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "register" ? 8 : 1} required /></label>
      {err && <p className="notice error" role="alert">{err}</p>}
      <button className="primary" disabled={busy}>{busy && <span className="spinner" aria-hidden="true" />}{busy ? "Đang xử lý..." : mode === "login" ? "Đăng nhập" : "Tạo tài khoản"}{!busy && <Icon name="arrow" />}</button>
      {mode === "login" && <p>Quên mật khẩu? Hãy nhờ quản trị viên tạo liên kết đặt lại cho bạn.</p>}
      <p className="auth-switch">{mode === "login" ? <>Chưa có tài khoản? <a href="/register">Đăng ký</a></> : <>Đã có tài khoản? <a href="/login">Đăng nhập</a></>}</p>
    </form>
  </div>;
}
