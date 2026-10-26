import type { JSX } from "react";
export default function HeroArt() {
  const cols = [[40, 3], [130, 4], [220, 4], [310, 2]] as const; const ys = (n: number) => Array.from({ length: n }, (_, i) => 130 + (i - (n - 1) / 2) * 50);
  const lines: JSX.Element[] = [], nodes: JSX.Element[] = [];
  cols.forEach(([x, n], c) => { ys(n).forEach((y, i) => { nodes.push(<circle key={`n${c}${i}`} className="hn" cx={x} cy={y} r={9} style={{ animationDelay: `${(c * 0.5 + i * 0.25).toFixed(2)}s` }} />);
    if (c < cols.length - 1) ys(cols[c + 1][1]).forEach((y2, j) => lines.push(<line key={`l${c}${i}${j}`} className="hl" x1={x} y1={y} x2={cols[c + 1][0]} y2={y2} />)); }); });
  return <svg viewBox="0 0 350 260" role="img" aria-label="Minh họa mạng nơ-ron đang truyền tín hiệu" className="heroart"><g stroke="currentColor" strokeWidth="1.2" opacity=".5">{lines}</g><g>{nodes}</g></svg>;
}
