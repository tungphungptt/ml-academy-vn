export default function Loading() {
  return <div aria-busy="true" aria-label="Đang tải"><div className="skeleton" style={{ width: "55%", height: 34 }} /><div className="skeleton" /><div className="skeleton" style={{ width: "90%" }} /><div className="skeleton" style={{ width: "75%" }} /><div className="skeleton" style={{ height: 120 }} /></div>;
}
