"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Icon from "./Icon";
const LINKS = [["/courses", "Lộ trình"], ["/playground", "Playground"], ["/lab", "Code Lab"], ["/projects", "Dự án"], ["/datasets", "Dữ liệu"], ["/resources", "Tài liệu"]];
export default function Nav({ email, admin }: { email?: string; admin?: boolean }) {
  const path = usePathname() ?? "", [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null), toggle = useRef<HTMLButtonElement>(null);
  const current = (href: string) => path.startsWith(href) || (href === "/courses" && path.startsWith("/learn/"));
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const outside = (e: PointerEvent) => { if (e.target instanceof Node && !nav.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", key); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header className="site-header"><nav className="site-nav" aria-label="Điều hướng chính" ref={nav}>
    <a className="brand" href="/" aria-label="ML Academy VN — Trang chủ"><span className="brand-symbol" aria-hidden="true">m<span>·</span></span><span>ML Academy<span className="brand-country">VIỆT NAM</span></span></a>
    <button ref={toggle} className="burger icon-button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)} aria-label="Mở hoặc đóng menu"><Icon name={open ? "close" : "menu"} /></button>
    <div id="menu" className={`nav-menu${open ? " open" : ""}`}>
      <div className="nav-links">{LINKS.map(([href, title]) => <a key={href} href={href} className={current(href) ? "cur" : ""} aria-current={current(href) ? "location" : undefined} onClick={() => setOpen(false)}>{title}</a>)}{admin && <a href="/admin" className={current("/admin") ? "cur" : ""}>Quản trị</a>}</div>
      <div className="nav-utilities"><a className="icon-button nav-search" href="/search" aria-label="Tìm bài học"><Icon name="search" /></a><ThemeToggle />
        {email ? <><a className="icon-button" href="/account" aria-label="Tài khoản"><Icon name="user" /></a><form action="/api/logout" method="post"><button className="quiet" title={email}>Đăng xuất</button></form></> : <><a className="nav-login" href="/login">Đăng nhập</a><a className="btn primary nav-signup" href="/register">Bắt đầu học<Icon name="arrow" /></a></>}
      </div>
    </div>
  </nav></header>;
}
