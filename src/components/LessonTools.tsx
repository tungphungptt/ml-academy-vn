"use client";
import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null); const [show, setShow] = useState(false);
  useEffect(() => {
    const f = () => { const h = document.documentElement, max = h.scrollHeight - h.clientHeight; if (bar.current) bar.current.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%"; setShow(h.scrollTop > 600); };
    f(); addEventListener("scroll", f, { passive: true }); return () => removeEventListener("scroll", f);
  }, []);
  return <><div className="topbar" ref={bar} aria-hidden /><button className={"totop" + (show ? " show" : "")} onClick={() => scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })} aria-label="Lên đầu trang"><Icon name="up" /></button></>;
}
export function Toc({ items }: { items: { id: string; text: string }[] }) {
  const [active, setActive] = useState("");
  const [reading, setReading] = useState(true);
  const mobile = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const article = document.querySelector("article.lesson"); if (!article) return;
    const observer = new IntersectionObserver(([entry]) => { setReading(entry.isIntersecting); if (!entry.isIntersecting && mobile.current) mobile.current.open = false; });
    observer.observe(article); return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === "Escape" && mobile.current?.open) { mobile.current.open = false; mobile.current.querySelector("summary")?.focus(); } };
    const outside = (e: PointerEvent) => { if (e.target instanceof Node && mobile.current?.open && !mobile.current.contains(e.target)) mobile.current.open = false; };
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); };
  }, []);
  useEffect(() => {
    const els = items.map(i => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(es => { const v = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: "-80px 0px -65% 0px" });
    els.forEach(e => io.observe(e)); return () => io.disconnect();
  }, [items]);
  if (items.length < 3) return null;
  const links = (small = false) => items.map(i => <a key={i.id} href={`#${i.id}`} className={active === i.id ? "active" : ""} aria-current={active === i.id ? "location" : undefined} onClick={small ? () => { if (mobile.current) mobile.current.open = false; requestAnimationFrame(() => { const heading = document.getElementById(i.id); if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); } }); } : undefined}>{i.text}</a>);
  return <aside className="lesson-toc" data-reading={reading} aria-label="Mục lục bài học"><p className="toc-label">TRONG BÀI NÀY</p><details ref={mobile} className="toc-inline toc"><summary>Mục lục bài học</summary><nav className="toc-mobile-links" aria-label="Mục lục trên màn hình nhỏ">{links(true)}</nav></details><nav className="toc toc-fixed" aria-label="Mục lục">{links()}</nav></aside>;
}
export function FocusToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { document.body.classList.toggle("focus", on); return () => document.body.classList.remove("focus"); }, [on]);
  const label = on ? "Thoát chế độ đọc tập trung" : "Chế độ đọc tập trung";
  return <button className="focus-toggle" onClick={() => setOn(!on)} aria-pressed={on} aria-label={label} title={label}><Icon name="focus" /><span className="focus-toggle-label">{label}</span></button>;
}
export function StudyTimer({ lessonId }: { lessonId: string }) {
  useEffect(() => {
    let acc = 0, last = Date.now(); const visible = () => document.visibilityState === "visible";
    const flush = () => { const n = Math.min(120, Math.floor(acc)); if (n >= 5) { acc -= n; fetch("/api/time", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ lessonId, seconds: n }), keepalive: true }).catch(() => {}); } };
    const tick = setInterval(() => { const now = Date.now(); if (visible()) acc += (now - last) / 1000; last = now; if (acc >= 30) flush(); }, 1000);
    const vc = () => { last = Date.now(); if (!visible()) flush(); }; document.addEventListener("visibilitychange", vc);
    return () => { clearInterval(tick); document.removeEventListener("visibilitychange", vc); flush(); };
  }, [lessonId]);
  return null;
}
