import type { ReactNode } from "react";
export const COLORS = ["#2f5bea", "#e8590c", "#2b8a3e", "#ae3ec9", "#c2255c"];
type D = { xmin: number; xmax: number; ymin: number; ymax: number };
export default function Plot({ d, label, children }: { d: D; label: string; children: (sx: (x: number) => number, sy: (y: number) => number) => ReactNode }) {
  const W = 400, H = 300, m = 24;
  const sx = (x: number) => m + ((x - d.xmin) / (d.xmax - d.xmin)) * (W - 2 * m);
  const sy = (y: number) => H - m - ((y - d.ymin) / (d.ymax - d.ymin)) * (H - 2 * m);
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} style={{ width: "100%", maxWidth: 480, border: "1px solid #8884", borderRadius: 8 }}>
    <line x1={m} y1={H - m} x2={W - m} y2={H - m} stroke="#888" /><line x1={m} y1={m} x2={m} y2={H - m} stroke="#888" />{children(sx, sy)}</svg>;
}
