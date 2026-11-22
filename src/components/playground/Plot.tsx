import { useId, type ReactNode } from "react";
export const COLORS = ["var(--plot-1)", "var(--plot-2)", "var(--plot-3)", "var(--plot-4)", "var(--plot-5)"];
type D = { xmin: number; xmax: number; ymin: number; ymax: number };
export default function Plot({ d, label, children, xLabel = "x₁", yLabel = "x₂" }: { d: D; label: string; xLabel?: string; yLabel?: string; children: (sx: (x: number) => number, sy: (y: number) => number) => ReactNode }) {
  // A square plot preserves distances and perpendicular PCA axes when both
  // domains use the same units. Clip data, not tick/axis labels.
  const W = 400, H = 400, m = 42, clip = useId();
  const sx = (x: number) => Number((m + ((x - d.xmin) / (d.xmax - d.xmin)) * (W - 2 * m)).toFixed(4));
  const sy = (y: number) => Number((H - m - ((y - d.ymin) / (d.ymax - d.ymin)) * (H - 2 * m)).toFixed(4));
  return <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className="plot">
    <title>{label}</title><defs><clipPath id={clip}><rect x={m} y={m} width={W - 2 * m} height={H - 2 * m} /></clipPath></defs>
    {Array.from({ length: 5 }, (_, i) => { const x = d.xmin + (d.xmax - d.xmin) * i / 4, y = d.ymin + (d.ymax - d.ymin) * i / 4; const fmt = (v: number) => Math.abs(v) >= 10000 ? v.toExponential(0) : Number(v.toFixed(2)).toString(); return <g key={i} fill="var(--mut)" fontFamily="var(--font-code)" fontSize="9"><line x1={sx(x)} x2={sx(x)} y1={m} y2={H - m} stroke="var(--bd)" strokeDasharray="2 4" /><line x1={m} x2={W - m} y1={sy(y)} y2={sy(y)} stroke="var(--bd)" strokeDasharray="2 4" /><text x={sx(x)} y={H - m + 17} textAnchor="middle">{fmt(x)}</text><text x={m - 7} y={sy(y) + 3} textAnchor="end">{fmt(y)}</text></g>; })}
    <line x1={m} y1={H - m} x2={W - m} y2={H - m} stroke="var(--mut)" /><line x1={m} y1={m} x2={m} y2={H - m} stroke="var(--mut)" />
    <g className="plot-data" clipPath={`url(#${clip})`}>{children(sx, sy)}</g>
    <text x={W - m} y={H - 7} textAnchor="end" fill="var(--mut)" fontFamily="var(--font-code)" fontSize="10">{xLabel}</text><text x={m} y={m - 14} fill="var(--mut)" fontFamily="var(--font-code)" fontSize="10">{yLabel}</text>
  </svg>;
}
