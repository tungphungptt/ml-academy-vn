"use client";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import Icon from "./Icon";
import type { NavigationLink } from "@/lib/navigation";
import BrandMark from "./BrandMark";
import { authHref } from "@/lib/returnPath";
import useDisclosureMotion from "./useDisclosureMotion";
export default function Nav({ email, admin, links }: { email?: string; admin?: boolean; links: readonly NavigationLink[] }) {
  const path = usePathname() ?? "", [open, setOpen] = useState(false);
  const nav = useRef<HTMLElement>(null), toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const {present,mobile}=useDisclosureMotion(menu,open);
  const current = (href: string) => path.startsWith(href) || (href === "/courses" && path.startsWith("/learn/"));
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); toggle.current?.focus(); } };
    const outside = (e: PointerEvent) => { if (e.target instanceof Node && !nav.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("keydown", key); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", key); document.removeEventListener("pointerdown", outside); };
  }, [open]);
  return <header className="site-header"><nav className="site-nav" aria-label="Điều hướng chính" ref={nav}>
    <a className="brand" href="/" aria-label="NeuralClone — Trang chủ"><span className="brand-symbol"><BrandMark /></span><span>NeuralClone<span className="brand-country">HỌC AI TỪ GỐC</span></span></a>
    <button ref={toggle} className="burger icon-button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen(!open)} aria-label="Mở hoặc đóng menu"><Icon name={open ? "close" : "menu"} /></button>
    <div id="menu" ref={menu} data-present={present} inert={mobile && !open} className={`nav-menu${open ? " open" : ""}`}>
      <div className="nav-links"><a href="/" className={path === "/" ? "cur" : ""} aria-current={path === "/" ? "page" : undefined} onClick={() => setOpen(false)}><Icon name="grid" />Không gian học</a>{links.map(({href, title, icon}) => <a key={href} href={href} className={current(href) ? "cur" : ""} aria-current={current(href) ? "location" : undefined} onClick={() => setOpen(false)}><Icon name={icon} />{title}<Icon className="nav-link-arrow" name="chevron" /></a>)}{admin && <a href="/admin" className={current("/admin") ? "cur" : ""}><Icon name="user" />Quản trị</a>}</div>
      <div className="nav-utilities"><a className="icon-button nav-search" href="/search" aria-label="Tìm bài học"><Icon name="search" /></a><ThemeToggle />
        {email ? <><a className="icon-button" href="/account" aria-label="Tài khoản"><Icon name="user" /></a><form action="/api/logout" method="post"><button className="quiet" title={email}>Đăng xuất</button></form></> : <><a className="nav-login" href={authHref("login",path.startsWith("/learn/")?path:"/")}>Đăng nhập</a><a className="btn primary nav-signup" href={authHref("register",path.startsWith("/learn/")?path:"/")}>Bắt đầu học<Icon name="arrow" /></a></>}
      </div>
    </div>
  </nav></header>;
}
