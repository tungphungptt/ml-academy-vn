import Icon from "@/components/Icon";
export default function NotFound() {
  return <section className="state-page"><span className="state-symbol" aria-hidden="true">404</span><h1>Không tìm thấy trang</h1><p>Đường dẫn không tồn tại hoặc bạn không có quyền xem. Hãy trở lại lộ trình hoặc tìm một chủ đề khác.</p><div className="actions"><a className="btn primary" href="/courses">Về danh sách khóa học<Icon name="arrow" /></a><a className="btn" href="/search">Tìm bài học</a></div></section>;
}
