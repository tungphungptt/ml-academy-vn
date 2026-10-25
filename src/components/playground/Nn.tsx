"use client";
import { useMemo, useState } from "react";
import Plot, { COLORS } from "./Plot"; import { makeXor, trainMLP } from "@/lib/ml2";
export default function Nn() {
  const data = useMemo(() => makeXor(25, 9), []);
  const [H, setH] = useState(4); const [lr, setLr] = useState(0.5); const [ep, setEp] = useState(800);
  const net = useMemo(() => trainMLP(data, H, lr, ep, 1), [data, H, lr, ep]);
  const grid = useMemo(() => { const c: { x: number; y: number; p: number }[] = []; for (let i = 0; i < 30; i++) for (let j = 0; j < 30; j++) { const x = i / 3, y = j / 3; c.push({ x, y, p: net.predict(x + 0.17, y + 0.17) }); } return c; }, [net]);
  const L = net.losses, mx = Math.max(...L);
  return <section><h2>Neural Network (MLP 2-H-1) trên bài toán XOR</h2>
    <label>Số neuron ẩn: {H} <input type="range" min={1} max={8} value={H} onChange={e => setH(+e.target.value)} /></label><br />
    <label>Learning rate: {lr.toFixed(2)} <input type="range" min={0.05} max={1} step={0.05} value={lr} onChange={e => setLr(+e.target.value)} /></label><br />
    <label>Epoch: {ep} <input type="range" min={50} max={2000} step={50} value={ep} onChange={e => setEp(+e.target.value)} /></label>
    <p>Loss cuối: {L[L.length - 1].toFixed(4)} · Accuracy: {(net.accuracy * 100).toFixed(1)}%. Với 1 neuron ẩn, mạng chỉ tạo được ranh giới tuyến tính nên không giải được XOR.</p>
    <Plot d={{ xmin: 0, xmax: 10, ymin: 0, ymax: 10 }} label="Ranh giới quyết định của mạng">{(sx, sy) => <>
      {grid.map((c, i) => <rect key={i} x={sx(c.x)} y={sy(c.y + 1 / 3)} width={sx(1 / 3) - sx(0)} height={sy(0) - sy(1 / 3)} fill={COLORS[c.p > 0.5 ? 1 : 0]} opacity={0.2} />)}
      {data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={COLORS[p.label]} stroke="#fff" strokeWidth={0.5} />)}</>}</Plot>
    <Plot d={{ xmin: 0, xmax: L.length - 1, ymin: 0, ymax: mx }} label="Loss theo epoch">{(sx, sy) => <polyline fill="none" stroke="#2b8a3e" strokeWidth={2} points={L.map((v, i) => `${sx(i)},${sy(v)}`).join(" ")} />}</Plot></section>;
}
