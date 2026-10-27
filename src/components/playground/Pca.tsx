"use client";
import { useMemo, useState } from "react";
import Plot from "./Plot"; import { makeCloud, pca2 } from "@/lib/ml2";
export default function Pca() {
  const [noise, setNoise] = useState(0.7); const [proj, setProj] = useState(false);
  const pts = useMemo(() => makeCloud(60, noise, 4), [noise]); const r = useMemo(() => pca2(pts), [pts]);
  const L = 4, m = r.mean, [a, b] = r.pc1, [c, d] = r.pc2;
  return <section><h2>PCA: hướng có phương sai lớn nhất</h2>
    <label>Độ nhiễu vuông góc: {noise.toFixed(1)} <input type="range" min={0.1} max={2} step={0.1} value={noise} onChange={e => setNoise(+e.target.value)} /></label><br />
    <label><input type="checkbox" checked={proj} onChange={e => setProj(e.target.checked)} /> Chiếu các điểm lên PC1 (giảm từ 2 chiều xuống 1)</label>
    <p>PC1 giữ {(r.ratio * 100).toFixed(1)}% phương sai (trị riêng {r.values[0].toFixed(2)} và {r.values[1].toFixed(2)}).</p>
    <Plot d={{ xmin: 0, xmax: 10, ymin: 0, ymax: 10 }} label="PCA">{(sx, sy) => <>
      {pts.map((p, i) => { const t = (p.x - m.x) * a + (p.y - m.y) * b; return <g key={i}>{proj && <line x1={sx(p.x)} y1={sy(p.y)} x2={sx(m.x + t * a)} y2={sy(m.y + t * b)} stroke="var(--mut)" strokeOpacity={0.4} />}<circle cx={sx(p.x)} cy={sy(p.y)} r={3} fill="var(--plot-1)" />{proj && <circle cx={sx(m.x + t * a)} cy={sy(m.y + t * b)} r={2.5} fill="var(--plot-2)" />}</g>; })}
      <line x1={sx(m.x - L * a)} y1={sy(m.y - L * b)} x2={sx(m.x + L * a)} y2={sy(m.y + L * b)} stroke="var(--plot-2)" strokeWidth={2} />
      <line x1={sx(m.x - 1.5 * c)} y1={sy(m.y - 1.5 * d)} x2={sx(m.x + 1.5 * c)} y2={sy(m.y + 1.5 * d)} stroke="var(--plot-3)" strokeWidth={2} /></>}</Plot>
    <p className="plot-legend"><span style={{ color: "var(--plot-2)" }}>PC1 · cam</span>. <span style={{ color: "var(--plot-3)" }}>PC2 · xanh lam</span> (vuông góc với PC1).</p></section>;
}
