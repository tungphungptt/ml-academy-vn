"use client";
import { usePathname } from "next/navigation"; import { useState } from "react"; import ThemeToggle from "./ThemeToggle";
const LINKS = [["/courses", "Khóa học"], ["/playground", "Playground"], ["/lab", "Code Lab"], ["/projects", "Dự án"], ["/datasets", "Dữ liệu"], ["/resources", "Tài liệu"]];
export default function Nav({ email, admin }: { email?: string; admin?: boolean }) {
  const path = usePathname() ?? ""; const [open, setOpen] = useState(false); const cur = (h: string) => path.startsWith(h);
  return <nav aria-label="Điều hướng chính"><a className="brand" href="/">◆ ML Academy VN</a>
    <button className="burger" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)} aria-label="Mở hoặc đóng menu">{open ? "✕" : "☰"}</button>
    <div id="menu" className={"menu" + (open ? " open" : "")}>
      {LINKS.map(([h, t]) => <a key={h} href={h} className={cur(h) ? "cur" : ""} aria-current={cur(h) ? "page" : undefined}>{t}</a>)}
      {admin && <a href="/admin" className={cur("/admin") ? "cur" : ""}>Quản trị</a>}
      <form action="/search" role="search"><input type="search" name="q" placeholder="Tìm bài học…" aria-label="Tìm bài học" /></form>
      <ThemeToggle />
      {email ? <><a href="/account" className={cur("/account") ? "cur" : ""}>Tài khoản</a><form action="/api/logout" method="post"><button title={email}>Đăng xuất</button></form></> : <><a href="/login">Đăng nhập</a><a className="btn primary" href="/register">Đăng ký</a></>}
    </div></nav>;
}
