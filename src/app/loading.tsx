export default function Loading() {
  return <div className="loading-state" aria-busy="true" aria-label="Đang tải"><p role="status">Đang mở trang…</p><div aria-hidden="true"><div className="skeleton title" /><div className="skeleton" /><div className="skeleton" /><div className="skeleton block" /></div></div>;
}
