"use client";
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return <div className="card" role="alert"><h2>Đã có lỗi xảy ra</h2><p>Trang không tải được. Bạn có thể thử lại; nếu lỗi lặp lại, hãy kiểm tra kết nối cơ sở dữ liệu (đã chạy <code>npm run setup</code> chưa?).</p><p style={{ color: "var(--mut)", fontSize: ".85rem" }}>{error.message}</p><button className="primary" onClick={reset}>Thử lại</button></div>;
}
