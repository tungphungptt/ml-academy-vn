"use client";
import { useMemo, useState } from "react";
import Plot, { COLORS } from "./Plot"; import { makeBlobs, kmeansInit, kmeansStep, type Pt } from "@/lib/ml";
export default function KMeans() {
  const pts = useMemo(() => makeBlobs([{ x: 2, y: 2 }, { x: 8, y: 3 }, { x: 5, y: 8 }], 30, 1, 11), []);
  const [k, setK] = useState(3); const [seed, setSeed] = useState(1);
  const [st, setSt] = useState(() => ({ it: 0, cents: kmeansInit(pts, 3, 1), assign: null as number[] | null, inertia: NaN, done: false }));
  const reset = (nk = k, ns = seed) => setSt({ it: 0, cents: kmeansInit(pts, nk, ns), assign: null, inertia: NaN, done: false });
  const step = () => { const s = kmeansStep(pts, st.cents); setSt({ it: st.it + 1, cents: s.centroids, assign: s.assign, inertia: s.inertia, done: s.converged }); };
  return <section><h2>K-Means: cập nhật tâm cụm từng bước</h2>
    <label>Số cụm K = {k} <input type="range" min={2} max={5} value={k} onChange={e => { setK(+e.target.value); reset(+e.target.value, seed); }} /></label>{" "}
    <button onClick={() => { const s = seed + 1; setSeed(s); reset(k, s); }}>Khởi tạo tâm khác</button>{" "}
    <button onClick={step} disabled={st.done}>Chạy 1 bước</button> <button onClick={() => reset()}>Đặt lại</button>
    <p>Bước {st.it}{st.assign ? `, inertia = ${st.inertia.toFixed(2)}` : " (tâm cụm khởi tạo ngẫu nhiên từ dữ liệu)"}{st.done ? ". Đã hội tụ." : ""}</p>
    <Plot d={{ xmin: 0, xmax: 10, ymin: 0, ymax: 10 }} label="K-Means">{(sx, sy) => <>
      {pts.map((p: Pt, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3} fill={st.assign ? COLORS[st.assign[i]] : "var(--mut)"} opacity={0.8} />)}
      {st.cents.map((c, i) => <rect key={i} x={sx(c.x) - 6} y={sy(c.y) - 6} width={12} height={12} fill={COLORS[i]} stroke="#000" strokeWidth={2} />)}</>}</Plot></section>;
}
