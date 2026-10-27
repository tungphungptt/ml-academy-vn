"use client";
import { useMemo, useState } from "react";
import Plot, { COLORS } from "./Plot"; import { makeBlobs, knnPredict } from "@/lib/ml";
export default function Knn() {
  const train = useMemo(() => makeBlobs([{ x: 3, y: 3 }, { x: 6, y: 6 }, { x: 3, y: 7 }], 25, 1.2, 5), []);
  const [k, setK] = useState(5);
  const grid = useMemo(() => { const c: { x: number; y: number; l: number }[] = []; for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) { const x = i / 4, y = j / 4; c.push({ x, y, l: knnPredict(train, { x, y }, k, 3) }); } return c; }, [train, k]);
  return <section><h2>KNN: ranh giới phân loại</h2>
    <label>K = {k} <input type="range" min={1} max={25} value={k} onChange={e => setK(+e.target.value)} /></label>
    <p>K nhỏ cho ranh giới lởm chởm (dễ overfit); K lớn cho ranh giới mượt hơn (có thể underfit).</p>
    <Plot d={{ xmin: 0, xmax: 10, ymin: 0, ymax: 10 }} label="Ranh giới quyết định KNN">{(sx, sy) => <>
      {grid.map((c, i) => <rect key={i} x={sx(c.x)} y={sy(c.y + 0.25)} width={sx(0.25) - sx(0)} height={sy(0) - sy(0.25)} fill={COLORS[c.l]} opacity={0.18} />)}
      {train.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={COLORS[p.label]} stroke="var(--bg2)" strokeWidth={0.5} />)}</>}</Plot></section>;
}
