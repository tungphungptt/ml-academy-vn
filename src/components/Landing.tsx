import HeroExperiment from "./HeroExperiment";
import Icon from "./Icon";
import CourseCard from "./CourseCard";
import { SectionHeading } from "./PageHeading";
import { getStats } from "@/lib/content";
import { db } from "@/lib/db";
import EmptyState from "./EmptyState";
import KnowledgeFlow from "./KnowledgeFlow";
import ExhibitionJourney from "./ExhibitionJourney";
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
    <ExhibitionJourney />
    <div className="home-overview"><p>Đi từ <strong>hiểu</strong> đến <strong>làm được.</strong><br /><span>Một chương trình, nhiều cách khám phá.</span></p><div className="metric-strip" aria-label="Nội dung hiện có"><div><b>{lessons.length}</b><span>bài đã xuất bản</span></div><div><b>{getStats().labs}</b><span>lab thực hành</span></div><div><b>{projects}</b><span>dự án thực tế</span></div></div></div>
    <section className="home-paths" id="learning-paths"><SectionHeading title="Một lộ trình rõ ràng cho bạn."><a className="text-link" href="/courses">Xem thư viện<Icon name="arrow" /></a></SectionHeading>
    {courses.length ? <div className="course-grid">{courses.map((c, i) => <CourseCard key={c.id} slug={c.slug} title={c.title} description={c.description} level={c.level} index={i} lessons={c.modules.flatMap(m => m.lessons).filter(l => l.contentFile).length} modules={c.modules.length} headingLevel={3} />)}</div> : <EmptyState title="Lộ trình đang được chuẩn bị" description="Trong lúc chờ bài học được xuất bản, bạn có thể thử bảy thí nghiệm tương tác hoặc chạy Python trong Code Lab." href="/playground" action="Khám phá Playground" />}
    </section><section className="forward-gallery"><div><h2>Từ hình dung đến phép tính thật.</h2><p>Khối điêu khắc phía trên là một biểu tượng. Ở đây, mỗi con số đến từ một lượt tính qua mạng neural 2–2–1, với trọng số minh họa cố định.</p><a className="text-link" href="/learn/mlp">Đọc lời giải từng lớp<Icon name="arrow" /></a></div><KnowledgeFlow /></section>
    <section className="studio-invitation"><div><h2>Mô hình học<br /> như thế nào?</h2><p>Thay số bước học. Quan sát đường hồi quy tiến gần dữ liệu và loss giảm dần. Mỗi thay đổi đều đến từ phép tính thật.</p><a className="text-link" href="/learn/gradient-descent">Hiểu từng bước tối ưu<Icon name="arrow"/></a></div><HeroExperiment /></section>
    <SectionHeading title="Bắt đầu từ điều bạn tò mò."><a className="text-link" href="/search">Tìm một chủ đề<Icon name="search" /></a></SectionHeading>
    {bySlug.size ? <div className="preview-grid">{FEATURED.filter(([slug]) => bySlug.has(slug)).map(([slug, description, image]) => <article className="lesson-preview" key={slug}><div className="preview-image"><img src={`/img/${image}.svg`} width={440} height={290} alt="" loading="lazy" /></div><div><p className="preview-meta">{bySlug.get(slug)!.level} · {bySlug.get(slug)!.minutes} phút theo lộ trình</p><h3><a href={`/learn/${slug}`}>{bySlug.get(slug)!.title}</a></h3><p>{description}</p><a className="text-link" href={`/learn/${slug}`}>Mở bài học<Icon name="arrow"/></a></div></article>)}</div> : <EmptyState title="Chưa có bài học được xuất bản" description="Các bài thực hành Python vẫn sẵn sàng để bạn bắt đầu từ một thí nghiệm nhỏ." href="/lab" action="Chọn bài thực hành" icon="code" />}
    <SectionHeading title="Đọc. Thử. Tự tay kiểm chứng." />
    <div className="learning-method"><div><Icon name="book" /><h3>Đọc để hiểu</h3><p>Trực giác, công thức và ví dụ số đi cùng nhau. Có nguồn tham khảo và kiến thức tiên quyết để bạn học tiếp.</p></div><div><Icon name="layers" /><h3>Thử để thấy</h3><p>Thay một tham số trong <a href="/playground">Playground</a>, quan sát ranh giới dự đoán và đường cong loss thay đổi.</p></div><div><Icon name="code" /><h3>Làm để nhớ</h3><p>Mở <a href="/lab">Code Lab</a> hoặc tải notebook. Các lab Pyodide chạy trong trình duyệt; lab CPU có hướng dẫn chạy cục bộ.</p></div></div>
  </>;
}
