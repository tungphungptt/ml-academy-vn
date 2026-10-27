import type { ReactNode } from "react";
export const COLORS = ["var(--plot-1)", "var(--plot-2)", "var(--plot-3)", "var(--plot-4)", "var(--plot-5)"];
type D = { xmin: number; xmax: number; ymin: number; ymax: number };
export default function Plot({ d, label, children }: { d: D; label: string; children: (sx: (x: number) => number, sy: (y: number) => number) => ReactNode }) {
  const W = 400, H = 300, m = 24;
  const sx = (x: number) => m + ((x - d.xmin) / (d.xmax - d.xmin)) * (W - 2 * m);
  const sy = (y: number) => H - m - ((y - d.ymin) / (d.ymax - d.ymin)) * (H - 2 * m);
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="plot">
    <line x1={m} y1={H - m} x2={W - m} y2={H - m} stroke="var(--mut)" /><line x1={m} y1={m} x2={m} y2={H - m} stroke="var(--mut)" />{children(sx, sy)}</svg>;
}
