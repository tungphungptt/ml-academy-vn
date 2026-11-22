"use client";
import { useEffect, useMemo, useState } from "react";
import { gradientDescent, makeLinear, mse } from "@/lib/ml";
import Icon from "./Icon";

export default function HeroExperiment() {
  const [epochs, setEpochs] = useState(40);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const data = useMemo(() => makeLinear(24, 7), []);
  const model = useMemo(() => gradientDescent(data, 0.01, epochs), [data, epochs]);
  const loss = mse(data, model.w, model.b);
  // Math.cos/log may differ by a final bit between V8 versions. Quantize only
  // SVG coordinates, preserving full precision in the actual calculation.
  const sx = (x: number) => Number((36 + x * 35).toFixed(4));
  const sy = (y: number) => Number((224 - y * 5.8).toFixed(4));
  return <div className="experiment">
    <div className="experiment-bar"><span className="signal-dot" /><span>THỰC NGHIỆM 001</span><span>Linear Regression</span></div>
    <div className="experiment-title"><h2>Một đường thẳng. Một cách học.</h2><span className="badge">Chạy thật trong trình duyệt</span></div>
    <svg className="experiment-plot" viewBox="0 0 420 260" role="img" aria-label="Các điểm dữ liệu và đường hồi quy y bằng w nhân x cộng b. Thay số bước để xem mô hình học.">
      <defs><clipPath id="experiment-clip"><rect x="36" y="20" width="350" height="204" /></clipPath></defs>
      {[0, 10, 20, 30].map(y => <g key={y}><line x1="36" x2="386" y1={sy(y)} y2={sy(y)} stroke="var(--bd)" strokeDasharray="3 5" /><text x="25" y={sy(y) + 4} textAnchor="end">{y}</text></g>)}
      {[0, 2, 4, 6, 8, 10].map(x => <text key={x} x={sx(x)} y="245" textAnchor="middle">{x}</text>)}
      <g clipPath="url(#experiment-clip)">{data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4" fill="var(--plot-1)" opacity=".8" />)}<line x1={sx(0)} x2={sx(10)} y1={sy(model.b)} y2={sy(model.w * 10 + model.b)} stroke="var(--plot-2)" strokeWidth="2.5" /></g>
      <text x="394" y="245">x</text><text x="14" y="18">y</text>
    </svg>
    <div className="experiment-controls"><label htmlFor="hero-epochs">Số bước học <output htmlFor="hero-epochs">{epochs}</output></label><input id="hero-epochs" type="range" min="0" max="240" step="10" disabled={!ready} value={epochs} onChange={e => setEpochs(Number(e.target.value))} /></div>
    <div className="experiment-results" aria-live="polite"><span>MSE <strong>{loss.toFixed(2)}</strong></span><code>ŷ = {model.w.toFixed(2)}x + {model.b.toFixed(2)}</code></div>
    <a className="experiment-link" href="/playground#linreg">Đổi tham số. Hiểu cách mô hình học.<Icon name="arrow" /></a>
  </div>;
}
