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
  useEffect(() => {
    const els = items.map(i => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(es => { const v = es.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]; if (v) setActive(v.target.id); }, { rootMargin: "-80px 0px -65% 0px" });
    els.forEach(e => io.observe(e)); return () => io.disconnect();
  }, [items]);
  if (items.length < 3) return null;
  const links = items.map(i => <a key={i.id} href={`#${i.id}`} className={active === i.id ? "active" : ""} aria-current={active === i.id ? "location" : undefined}>{i.text}</a>);
  return <aside className="lesson-toc" aria-label="Mục lục bài học"><p className="toc-label">TRONG BÀI NÀY</p><details className="toc-inline toc"><summary>Mục lục bài học</summary>{links}</details><nav className="toc toc-fixed" aria-label="Mục lục">{links}</nav></aside>;
}
export function FocusToggle() {
  const [on, setOn] = useState(false);
  useEffect(() => { document.body.classList.toggle("focus", on); return () => document.body.classList.remove("focus"); }, [on]);
  return <button className="focus-toggle" onClick={() => setOn(!on)} aria-pressed={on}><Icon name="focus" />{on ? "Thoát chế độ đọc tập trung" : "Chế độ đọc tập trung"}</button>;
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
