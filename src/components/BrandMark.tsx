export default function BrandMark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M9 29V11l14 18V11M17 29V11l14 18V11" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
    <g fill="currentColor"><circle cx="9" cy="11" r="2.7" /><circle cx="23" cy="29" r="2.7" /><circle cx="31" cy="11" r="2.7" /></g>
  </svg>;
}
