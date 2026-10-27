import Icon from "./Icon";
type Progress = { completed: number; total: number; percent: number };
export default function CourseCard({ slug, title, description, level, index, lessons, modules, progress, headingLevel = 2 }: {
  slug: string; title: string; description: string; level: string; index: number; lessons: number; modules: number; progress?: Progress; headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  const status = !progress || progress.completed === 0 ? "Chưa bắt đầu" : progress.completed === progress.total ? "Đã hoàn thành" : "Đang học";
  return <article className="course-card" data-track={slug}>
    <div className="course-card-top"><span className="eyebrow">Lộ trình {String(index + 1).padStart(2, "0")}</span><Icon name={index % 3 === 0 ? "grid" : index % 3 === 1 ? "layers" : "code"} /></div>
    <Heading><a href={`/courses/${slug}`}>{title}</a></Heading><p className="course-description">{description}</p>
    <div className="course-meta"><span className="badge">{level}</span><span>{lessons} bài</span><span>{modules} chương</span></div>
    {progress && <div className="course-progress"><div><span>{status}</span><strong>{progress.completed}/{progress.total} bài</strong></div><progress aria-label={`Tiến độ ${title}`} value={progress.completed} max={progress.total || 1} /></div>}
    <div className="course-card-foot"><span>{progress?.completed ? "Tiếp tục khám phá" : "Xem lộ trình"}</span><Icon name="arrow" /></div>
  </article>;
}
