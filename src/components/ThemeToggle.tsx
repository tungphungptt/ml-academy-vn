"use client";
export default function ThemeToggle() {
  function toggle() {
    const el = document.documentElement;
    const cur = el.dataset.theme ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    const next = cur === "dark" ? "light" : "dark"; el.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
  }
  return <button onClick={toggle} aria-label="Đổi giao diện sáng/tối">◐ Sáng/Tối</button>;
}
