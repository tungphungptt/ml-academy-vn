export type Pt = { x: number; y: number };
export type LPt = Pt & { label: number };
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function gauss(r: () => number) { return Math.sqrt(-2 * Math.log(1 - r())) * Math.cos(2 * Math.PI * r()); }
export function makeLinear(n = 30, seed = 7): Pt[] {
  const r = rng(seed);
  return Array.from({ length: n }, () => { const x = r() * 10; return { x, y: 2.5 * x + 4 + gauss(r) * 2 }; });
}
export function makeBlobs(centers: Pt[], per = 30, sd = 1, seed = 3): LPt[] {
  const r = rng(seed);
  return centers.flatMap((c, label) => Array.from({ length: per }, () => ({ x: c.x + gauss(r) * sd, y: c.y + gauss(r) * sd, label })));
}
export const mse = (d: Pt[], w: number, b: number) => d.reduce((s, p) => s + (w * p.x + b - p.y) ** 2, 0) / d.length;
export function gradientDescent(d: Pt[], lr: number, epochs: number) {
  let w = 0, b = 0; const losses = [mse(d, w, b)]; let diverged = false;
  for (let e = 0; e < epochs; e++) {
    let gw = 0, gb = 0;
    for (const p of d) { const err = w * p.x + b - p.y; gw += 2 * err * p.x; gb += 2 * err; }
    w -= (lr * gw) / d.length; b -= (lr * gb) / d.length;
    const L = mse(d, w, b);
    if (!Number.isFinite(L) || L > 1e12) { diverged = true; break; }
    losses.push(L);
  }
  return { w, b, losses, diverged };
}
export function olsFit(d: Pt[]) {
  const n = d.length, mx = d.reduce((s, p) => s + p.x, 0) / n, my = d.reduce((s, p) => s + p.y, 0) / n;
  let sxy = 0, sxx = 0; for (const p of d) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; }
  const w = sxy / sxx; return { w, b: my - w * mx };
}
export function knnPredict(train: LPt[], q: Pt, k: number, classes: number) {
  const nb = train.map(p => ({ l: p.label, d: (p.x - q.x) ** 2 + (p.y - q.y) ** 2 })).sort((a, c) => a.d - c.d).slice(0, k);
  const votes = new Array(classes).fill(0); nb.forEach(n => votes[n.l]++);
  const best = Math.max(...votes);
  return nb.find(n => votes[n.l] === best)!.l; // hòa phiếu: chọn lớp của láng giềng gần nhất
}
export function kmeansInit(pts: Pt[], k: number, seed = 1): Pt[] {
  const r = rng(seed), idx = new Set<number>();
  while (idx.size < Math.min(k, pts.length)) idx.add(Math.floor(r() * pts.length));
  return [...idx].map(i => ({ x: pts[i].x, y: pts[i].y }));
}
export function kmeansStep(pts: Pt[], cents: Pt[]) {
  const assign = pts.map(p => { let bi = 0, bd = Infinity; cents.forEach((c, i) => { const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi; });
  const next = cents.map((c, i) => { const m = pts.filter((_, j) => assign[j] === i); return m.length ? { x: m.reduce((s, p) => s + p.x, 0) / m.length, y: m.reduce((s, p) => s + p.y, 0) / m.length } : c; });
  const inertia = pts.reduce((s, p, j) => s + (p.x - next[assign[j]].x) ** 2 + (p.y - next[assign[j]].y) ** 2, 0);
  const moved = next.some((c, i) => Math.abs(c.x - cents[i].x) + Math.abs(c.y - cents[i].y) > 1e-9);
  return { assign, centroids: next, inertia, converged: !moved };
}
