export default function ProgressRing({ percent, size = 56 }: { percent: number; size?: number }) {
  const c = 2 * Math.PI * 24, p = Math.max(0, Math.min(100, percent));
  return <svg className="ring" width={size} height={size} viewBox="0 0 56 56" role="img" aria-label={`Hoàn thành ${p}%`}>
    <circle className="bg" cx="28" cy="28" r="24" fill="none" strokeWidth="6" /><circle className="arc" cx="28" cy="28" r="24" fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(c * p) / 100} ${c}`} transform="rotate(-90 28 28)" />
    <text x="28" y="33" textAnchor="middle">{p}%</text></svg>;
}
