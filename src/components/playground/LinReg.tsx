"use client";
import { useMemo, useState } from "react";
import Plot from "./Plot"; import { makeLinear, gradientDescent, olsFit } from "@/lib/ml";
export default function LinReg() {
  const data = useMemo(() => makeLinear(30, 7), []);
  const ols = useMemo(() => olsFit(data), [data]);
  const [lr, setLr] = useState(0.01); const [ep, setEp] = useState(50);
  const g = useMemo(() => gradientDescent(data, lr, ep), [data, lr, ep]);
  const L = g.losses, maxL = Math.max(...L, 1e-9);
  const ys = data.map(p => p.y), dom = { xmin: 0, xmax: 10, ymin: Math.min(0, ...ys), ymax: Math.max(...ys) + 2 };
  return <section><h2>Linear Regression + Gradient Descent</h2>
    <label>Learning rate: {lr.toFixed(3)} <input type="range" min={0.001} max={0.05} step={0.001} value={lr} onChange={e => setLr(+e.target.value)} /></label><br />
    <label>Số vòng lặp (epoch): {ep} <input type="range" min={1} max={300} value={ep} onChange={e => setEp(+e.target.value)} /></label>
    {g.diverged && <p role="alert">Phân kỳ: learning rate quá lớn nên loss tăng vô hạn. Hãy giảm learning rate.</p>}
    <p>w = {g.w.toFixed(3)}, b = {g.b.toFixed(3)}, MSE = {L[L.length - 1].toFixed(3)} (nghiệm đóng: w = {ols.w.toFixed(3)}, b = {ols.b.toFixed(3)})</p>
    <Plot d={dom} label="Dữ liệu và đường hồi quy">{(sx, sy) => <>{data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill="#2f5bea" />)}
      <line x1={sx(0)} y1={sy(g.b)} x2={sx(10)} y2={sy(g.w * 10 + g.b)} stroke="#e8590c" strokeWidth={2} /></>}</Plot>
    <Plot d={{ xmin: 0, xmax: Math.max(L.length - 1, 1), ymin: 0, ymax: maxL }} label="Đường cong loss theo epoch">{(sx, sy) => <polyline fill="none" stroke="#2b8a3e" strokeWidth={2} points={L.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} />}</Plot>
  </section>;
}
