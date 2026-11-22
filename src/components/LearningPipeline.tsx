import Icon from "./Icon";
export default function LearningPipeline() {
  const steps = [
    ["Đặt câu hỏi", "Xác định đầu vào, mục tiêu và metric trước khi chọn mô hình.", "search"],
    ["Tách dữ liệu", "Giữ riêng tập test. Tránh để thông tin tương lai lọt vào train.", "grid"],
    ["Xây baseline", "Fit tiền xử lý trên train; chọn tham số bằng validation hoặc CV.", "code"],
    ["Đánh giá", "Dùng tập test sau khi chốt mô hình, phân tích lỗi và giới hạn.", "check"],
  ] as const;
  return <aside className="learning-pipeline" aria-label="Quy trình thực nghiệm tránh rò rỉ dữ liệu"><p className="eyebrow">MỘT DỰ ÁN TỐT BẮT ĐẦU TỪ MỘT CÂU HỎI TỐT</p><ol>{steps.map(([title, description, icon], i) => <li key={title}><div><span>0{i + 1}</span><Icon name={icon} /></div><h2>{title}</h2><p>{description}</p></li>)}</ol></aside>;
}
