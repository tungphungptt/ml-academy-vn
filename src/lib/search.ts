export type Doc = { slug: string; title: string; text: string };
export type Hit = { slug: string; title: string; snippet: string; score: number };
const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d");
export function searchDocs(docs: Doc[], q: string, limit = 20): Hit[] {
  const terms = norm(q.trim()).split(/\s+/).filter(Boolean); if (terms.join("").length < 2) return [];
  const hits: Hit[] = [];
  for (const d of docs) {
    const nt = norm(d.title), nx = norm(d.text); let score = 0, first = -1, ok = true;
    for (const t of terms) {
      const i = nx.indexOf(t); const inTitle = nt.includes(t);
      if (i < 0 && !inTitle) { ok = false; break; }
      if (inTitle) score += 10; if (i >= 0) { score += 1 + Math.min(5, nx.split(t).length - 1); if (first < 0) first = i; }
    }
    if (!ok) continue;
    const start = Math.max(0, (first < 0 ? 0 : first) - 50);
    hits.push({ slug: d.slug, title: d.title, score, snippet: (start > 0 ? "…" : "") + d.text.slice(start, start + 170).replace(/\s+/g, " ") + "…" });
  }
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
export function shuffleIdx(n: number, seed: number): number[] {
  let s = seed >>> 0; const r = () => { s = (s + 0x6d2b79f5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a;
}
export const slugifyHeading = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
