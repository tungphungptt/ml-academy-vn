import HeroArt from "./HeroArt"; import { getStats } from "@/lib/content";
const FEATURED: [string, string, string][] = [["gradient-descent", "Gradient Descent", "Hoạt ảnh điểm lăn xuống cực tiểu"], ["knn", "KNN", "Láng giềng gần nhất bỏ phiếu"], ["k-means", "K-Means", "Phân cụm và inertia"], ["backpropagation", "Backpropagation", "Gradient chảy ngược qua đồ thị"], ["attention-transformer", "Attention", "Trọng số softmax(q·k)"], ["pca", "PCA", "Hướng có phương sai lớn nhất"]];
export default function Landing() {
  const { lessons, images: imgs, labs } = getStats();
  return <>
    <section className="hero hero2"><div><span className="badge">Miễn phí · Tiếng Việt · Chạy offline sau khi cài</span><h1>Học Machine Learning và Deep Learning từ nền tảng đến Transformer</h1>
      <p>Mỗi bài có công thức rõ ràng, ví dụ tính tay, code Python chạy được và hình minh họa. Thử ngay các thuật toán trong trình duyệt, không cần cài gì thêm.</p>
      <div className="row"><a className="btn primary" href="/courses">Bắt đầu học</a><a className="btn" href="/playground">Thử Playground</a><a className="btn" href="/register">Lưu tiến độ học</a></div></div><HeroArt /></section>
    <div className="stat"><div><b>{lessons}</b>bài học đầy đủ</div><div><b>{imgs}</b>hình minh họa</div><div><b>6</b>demo tương tác</div><div><b>{labs}</b>bài thực hành code</div></div>
    <h2>Lộ trình gợi ý</h2>
    <div className="grid">{[["1", "Nền tảng", "Python, vector, đạo hàm, xác suất, chuẩn bị dữ liệu.", "/courses/python-math"], ["2", "Machine Learning", "Từ hồi quy tuyến tính đến SVM, cây, ensemble, đánh giá mô hình.", "/courses/ml-fundamentals"], ["3", "Deep Learning", "Backpropagation, CNN, RNN, Attention, Transformer, mô hình sinh.", "/courses/deep-learning"]].map(([n, t, d, h]) => <a key={n} href={h} className="card step"><span className="num">{n}</span><b>{t}</b><br /><span className="mut">{d}</span></a>)}</div>
    <h2>Xem thử vài bài</h2>
    <div className="grid">{FEATURED.map(([s, t, d]) => <a key={s} href={`/learn/${s}`} className="card thumb"><img src={`/img/${s === "k-means" ? "kmeans" : s === "attention-transformer" ? "attention" : s}.svg`} alt="" loading="lazy" /><b>{t}</b><br /><span className="mut">{d}</span></a>)}</div>
    <h2>Học bằng cách làm</h2>
    <div className="grid">{[["/playground", "Playground", "6 demo: Linear Regression, KNN, K-Means, Decision Tree, PCA, Neural Network."], ["/lab", "Code Lab", "Chạy Python ngay trên trình duyệt, tải .py và notebook."], ["/projects", "Dự án", "8 dự án có baseline và chỉ số đánh giá."]].map(([h, t, d]) => <a key={h} href={h} className="card"><b>{t}</b><br /><span className="mut">{d}</span></a>)}</div></>;
}
