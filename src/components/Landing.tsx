import HeroArt from "./HeroArt";
import Icon from "./Icon";
import CourseCard from "./CourseCard";
import { SectionHeading } from "./PageHeading";
import { getStats } from "@/lib/content";
import { db } from "@/lib/db";
const FEATURED = [
  ["gradient-descent", "Đi từng bước theo hướng giảm loss", "gradient-descent"],
  ["knn", "Bắt đầu từ những láng giềng gần nhất", "knn"],
  ["k-means", "Tìm cấu trúc trong dữ liệu chưa có nhãn", "kmeans"],
  ["backpropagation", "Theo dấu gradient qua đồ thị tính toán", "backpropagation"],
  ["attention-transformer", "Hiểu cách mô hình chọn điều cần chú ý", "attention"],
  ["pca", "Nhìn dữ liệu từ một góc độ mới", "pca"],
];
export default async function Landing() {
  const courses = await db.course.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { modules: { include: { lessons: true } } } });
  const lessons = courses.flatMap(c => c.modules.flatMap(m => m.lessons)).filter(l => l.contentFile);
  const bySlug = new Map(lessons.map(l => [l.slug, l]));
  const projects = await db.project.count();
  return <>
    <section className="hero"><div className="hero-copy"><p className="eyebrow"><span className="signal-dot" />KHÔNG GIAN HỌC MÁY BẰNG TIẾNG VIỆT</p>
      <h1>Học máy.<br /><em>Hiểu từ gốc.</em></h1><p>Đi từ một ý tưởng đến công thức, rồi tự tay kiểm chứng bằng code. Khám phá Machine Learning và Deep Learning, từng bước có căn cứ.</p>
      <div className="actions"><a className="btn primary" href="/courses">Khám phá lộ trình<Icon name="arrow" /></a><a className="btn quiet" href="/lab">Thử Code Lab<Icon name="external" /></a></div>
    </div><div className="hero-visual"><p className="eyebrow">MỘT Ý TƯỞNG. NHIỀU KẾT NỐI.</p><HeroArt /><div className="visual-caption"><span><b>01</b> Đặc trưng</span><span>→</span><span><b>02</b> Biểu diễn</span><span>→</span><span><b>03</b> Dự đoán</span></div></div></section>
    <div className="metric-strip" aria-label="Nội dung hiện có"><div><b>{lessons.length}</b><span>bài đã xuất bản</span></div><div><b>{getStats().labs}</b><span>lab thực hành</span></div><div><b>{projects}</b><span>dự án để khám phá</span></div></div>
    <SectionHeading eyebrow="01 / LỘ TRÌNH" title="Vững nền tảng, mở rộng từng bước."><a className="text-link" href="/courses">Tất cả lộ trình<Icon name="arrow" /></a></SectionHeading>
    <div className="course-grid">{courses.map((c, i) => <CourseCard key={c.id} slug={c.slug} title={c.title} description={c.description} level={c.level} index={i} lessons={c.modules.flatMap(m => m.lessons).filter(l => l.contentFile).length} modules={c.modules.length} headingLevel={3} />)}</div>
    <SectionHeading eyebrow="02 / MỞ MỘT TRANG MỚI" title="Bắt đầu từ điều bạn tò mò."><a className="text-link" href="/search">Tìm một chủ đề<Icon name="search" /></a></SectionHeading>
    <div className="preview-grid">{FEATURED.filter(([slug]) => bySlug.has(slug)).map(([slug, description, image]) => <article className="lesson-preview" key={slug}><div className="preview-image"><img src={`/img/${image}.svg`} alt="" loading="lazy" /></div><div><h3><a href={`/learn/${slug}`}>{bySlug.get(slug)!.title}</a></h3><p>{description}</p></div></article>)}</div>
    <SectionHeading eyebrow="03 / TỪ HIỂU ĐẾN LÀM" title="Kiến thức có thể tự kiểm chứng." />
    <div className="learning-method"><div><Icon name="book" /><h3>Đọc để hiểu</h3><p>Trực giác, công thức và ví dụ số đi cùng nhau. Có nguồn tham khảo và kiến thức tiên quyết để bạn học tiếp.</p></div><div><Icon name="layers" /><h3>Thử để thấy</h3><p>Thay một tham số trong <a href="/playground">Playground</a>, quan sát ranh giới dự đoán và đường cong loss thay đổi.</p></div><div><Icon name="code" /><h3>Làm để nhớ</h3><p>Mở <a href="/lab">Code Lab</a> hoặc tải notebook. Các lab Pyodide chạy trong trình duyệt; lab CPU có hướng dẫn chạy cục bộ.</p></div></div>
  </>;
}
