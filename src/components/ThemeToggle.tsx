"use client";
import { useEffect, useState } from "react";
import Icon from "./Icon";
export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => { setDark((document.documentElement.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")) === "dark"); }, []);
  function toggle() {
    const el = document.documentElement;
    const current = el.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = current === "dark" ? "light" : "dark";
    el.dataset.theme = next; setDark(next === "dark");
    try { localStorage.setItem("theme", next); } catch {}
  }
  return <button className="icon-button" onClick={toggle} aria-pressed={dark} aria-label="Đổi giao diện sáng/tối"><Icon name={dark ? "sun" : "moon"} /></button>;
}
