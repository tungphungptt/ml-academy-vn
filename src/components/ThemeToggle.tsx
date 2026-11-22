"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => { setDark(document.documentElement.dataset.theme !== "light"); }, []);
  function toggle() {
    const el = document.documentElement;
    const current = el.dataset.theme ?? "dark";
    const next = current === "dark" ? "light" : "dark";
    el.dataset.theme = next; setDark(next === "dark");
    try { localStorage.setItem("theme", next); } catch {}
  }
  return <button className="icon-button theme-toggle" onClick={toggle} disabled={dark === null} aria-pressed={dark ?? undefined} aria-label="Đổi giao diện sáng/tối"><Icon name="sun" className="theme-icon-sun" /><Icon name="moon" className="theme-icon-moon" /></button>;
}
