"use client";
import Icon from "@/components/Icon";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <section className="state-page" role="alert"><Icon name="alert" /><h1>Trang chưa tải được</h1><p>Đã có lỗi xảy ra. Bạn có thể thử tải lại trang hoặc quay về danh sách khóa học.</p><div className="actions"><button className="primary" onClick={reset}>Thử lại</button><a className="btn" href="/courses">Về khóa học</a></div></section>;
}
