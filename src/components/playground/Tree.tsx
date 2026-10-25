"use client";
import { useMemo, useState } from "react";
import Plot, { COLORS } from "./Plot"; import { makeBlobs } from "@/lib/ml"; import { buildTree, treePredict, type Node } from "@/lib/ml2";
const Outline = ({ n, ind = 0 }: { n: Node; ind?: number }) => <div style={{ marginLeft: ind * 16, fontFamily: "monospace", fontSize: 13 }}>
  {n.leaf ? `→ lớp ${n.label} (n=${n.n}, gini=${n.gini.toFixed(2)})` : <>{`${n.f} ≤ ${n.t.toFixed(2)}? (n=${n.n}, gini=${n.gini.toFixed(2)})`}<Outline n={n.l} ind={ind + 1} /><Outline n={n.r} ind={ind + 1} /></>}</div>;
export default function Tree() {
  const data = useMemo(() => makeBlobs([{ x: 3, y: 3 }, { x: 6, y: 6 }, { x: 3, y: 7 }], 25, 1.4, 5), []);
  const [depth, setDepth] = useState(2); const tree = useMemo(() => buildTree(data, depth), [data, depth]);
  const acc = data.filter(p => treePredict(tree, p) === p.label).length / data.length;
  const grid = useMemo(() => { const c: { x: number; y: number; l: number }[] = []; for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) c.push({ x: i / 4, y: j / 4, l: treePredict(tree, { x: i / 4 + 0.125, y: j / 4 + 0.125 }) }); return c; }, [tree]);
  return <section><h2>Decision Tree: chia theo Gini</h2>
    <label>Độ sâu tối đa: {depth} <input type="range" min={1} max={6} value={depth} onChange={e => setDepth(+e.target.value)} /></label>
    <p>Accuracy trên tập huấn luyện: {(acc * 100).toFixed(1)}%. Cây càng sâu càng khớp dữ liệu train (nguy cơ overfit).</p>
    <Plot d={{ xmin: 0, xmax: 10, ymin: 0, ymax: 10 }} label="Vùng quyết định của cây">{(sx, sy) => <>
      {grid.map((c, i) => <rect key={i} x={sx(c.x)} y={sy(c.y + 0.25)} width={sx(0.25) - sx(0)} height={sy(0) - sy(0.25)} fill={COLORS[c.l]} opacity={0.18} />)}
      {data.map((p, i) => <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={COLORS[p.label]} stroke="#fff" strokeWidth={0.5} />)}</>}</Plot>
    <h3>Cấu trúc cây</h3><Outline n={tree} /></section>;
}
