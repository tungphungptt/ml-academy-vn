import { rng, gauss, makeBlobs, type Pt, type LPt } from "./ml";
export function makeCloud(n = 60, noise = 0.7, seed = 4): Pt[] {
  const r = rng(seed), a = Math.PI / 6;
  return Array.from({ length: n }, () => { const u = gauss(r) * 2.2, v = gauss(r) * noise; return { x: 5 + u * Math.cos(a) - v * Math.sin(a), y: 5 + u * Math.sin(a) + v * Math.cos(a) }; });
}
export function pca2(pts: Pt[]) {
  const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n;
  let a = 0, b = 0, d = 0; for (const p of pts) { a += (p.x - mx) ** 2; b += (p.x - mx) * (p.y - my); d += (p.y - my) ** 2; }
  a /= n - 1; b /= n - 1; d /= n - 1;
  const m = (a + d) / 2, s = Math.sqrt(((a - d) / 2) ** 2 + b * b), l1 = m + s, l2 = m - s;
  let v: [number, number] = b !== 0 ? [l1 - d, b] : a >= d ? [1, 0] : [0, 1];
  const len = Math.hypot(v[0], v[1]); v = [v[0] / len, v[1] / len];
  return { mean: { x: mx, y: my }, values: [l1, l2], pc1: v, pc2: [-v[1], v[0]] as [number, number], ratio: l1 / (l1 + l2) };
}
export const gini = (pts: LPt[]) => { const c = new Map<number, number>(); pts.forEach(p => c.set(p.label, (c.get(p.label) ?? 0) + 1)); let s = 1; c.forEach(v => (s -= (v / pts.length) ** 2)); return s; };
export type Node = { leaf: true; label: number; n: number; gini: number } | { leaf: false; f: "x" | "y"; t: number; n: number; gini: number; l: Node; r: Node };
export function buildTree(pts: LPt[], maxDepth: number, depth = 0): Node {
  const g = gini(pts), cnt = new Map<number, number>(); pts.forEach(p => cnt.set(p.label, (cnt.get(p.label) ?? 0) + 1));
  const label = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0][0], leaf: Node = { leaf: true, label, n: pts.length, gini: g };
  if (depth >= maxDepth || g < 1e-12 || pts.length < 2) return leaf;
  let best: { f: "x" | "y"; t: number; score: number } | null = null;
  for (const f of ["x", "y"] as const) {
    const vals = [...new Set(pts.map(p => p[f]))].sort((a, b) => a - b);
    for (let i = 0; i + 1 < vals.length; i++) {
      const t = (vals[i] + vals[i + 1]) / 2, L = pts.filter(p => p[f] <= t), R = pts.filter(p => p[f] > t);
      const score = (L.length * gini(L) + R.length * gini(R)) / pts.length;
      if (!best || score < best.score) best = { f, t, score };
    }
  }
  if (!best || best.score >= g - 1e-12) return leaf;
  const { f, t } = best;
  return { leaf: false, f, t, n: pts.length, gini: g, l: buildTree(pts.filter(p => p[f] <= t), maxDepth, depth + 1), r: buildTree(pts.filter(p => p[f] > t), maxDepth, depth + 1) };
}
export const treePredict = (n: Node, p: Pt): number => (n.leaf ? n.label : treePredict(p[n.f] <= n.t ? n.l : n.r, p));
export const makeXor = (per = 25, seed = 9): LPt[] => makeBlobs([{ x: 2, y: 2 }, { x: 8, y: 8 }, { x: 2, y: 8 }, { x: 8, y: 2 }], per, 1, seed).map(p => ({ ...p, label: p.label < 2 ? 0 : 1 }));
export function trainMLP(data: LPt[], H: number, lr: number, epochs: number, seed = 1) {
  const r = rng(seed), sc = (v: number) => (v - 5) / 3, N = data.length;
  const W1 = Array.from({ length: H }, () => [gauss(r) * 0.8, gauss(r) * 0.8]), b1 = new Array(H).fill(0), w2 = Array.from({ length: H }, () => gauss(r) * 0.8); let b2 = 0;
  const fwd = (x: number, y: number) => { const h = W1.map((w, j) => Math.tanh(w[0] * x + w[1] * y + b1[j])); return { h, p: 1 / (1 + Math.exp(-(h.reduce((s, v, j) => s + v * w2[j], b2)))) }; };
  const losses: number[] = [];
  for (let e = 0; e < epochs; e++) {
    const gW1 = W1.map(() => [0, 0]), gb1 = new Array(H).fill(0), gw2 = new Array(H).fill(0); let gb2 = 0, L = 0;
    for (const d of data) {
      const x = sc(d.x), y = sc(d.y), { h, p } = fwd(x, y), dz2 = p - d.label;
      L += -(d.label * Math.log(p + 1e-12) + (1 - d.label) * Math.log(1 - p + 1e-12)); gb2 += dz2;
      for (let j = 0; j < H; j++) { gw2[j] += dz2 * h[j]; const dz1 = dz2 * w2[j] * (1 - h[j] ** 2); gW1[j][0] += dz1 * x; gW1[j][1] += dz1 * y; gb1[j] += dz1; }
    }
    for (let j = 0; j < H; j++) { w2[j] -= (lr * gw2[j]) / N; W1[j][0] -= (lr * gW1[j][0]) / N; W1[j][1] -= (lr * gW1[j][1]) / N; b1[j] -= (lr * gb1[j]) / N; }
    b2 -= (lr * gb2) / N; losses.push(L / N);
  }
  const predict = (x: number, y: number) => fwd(sc(x), sc(y)).p;
  return { losses, predict, accuracy: data.filter(d => (predict(d.x, d.y) > 0.5 ? 1 : 0) === d.label).length / N };
}
