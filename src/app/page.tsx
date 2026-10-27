import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Landing from "@/components/Landing";
import PageHeading, { SectionHeading } from "@/components/PageHeading";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import Icon from "@/components/Icon";
import { courseProgress, nextLesson } from "@/lib/progress";
export const dynamic = "force-dynamic";
export default async function Home() {
  const u = await currentUser();
  if (!u) return <Landing />;
  const courses = await db.course.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
  const done = new Set((await db.lessonProgress.findMany({ where: { userId: u.id } })).map(p => p.lessonId));
  const attempts = await db.quizAttempt.findMany({ where: { userId: u.id }, orderBy: { createdAt: "desc" }, take: 5, include: { quiz: { include: { lesson: true } } } });
  const secs = (await db.studyTime.aggregate({ where: { userId: u.id }, _sum: { seconds: true } }))._sum.seconds ?? 0;
  const rows = courses.map(c => { const ls = c.modules.flatMap(m => m.lessons).map(l => ({ id: l.id, slug: l.slug, title: l.title, hasContent: !!l.contentFile })); return { c, p: courseProgress(ls, done), next: nextLesson(ls, done) }; });
  const suggestion = rows.find(r => r.next)?.next;
  return <><PageHeading eyebrow="KHÔNG GIAN HỌC TẬP" title="Tiến độ của bạn" description={done.size ? "Mỗi bài đã học là một kết nối mới. Tiếp tục từ bước tiếp theo của bạn." : "Chọn một lộ trình, bắt đầu một bài học. Tiến độ và kết quả sẽ được lưu ở đây."} actions={<a className="text-link" href="/courses">Khám phá lộ trình<Icon name="arrow" /></a>} />
    {suggestion && <section className="dashboard-continue"><div><p className="eyebrow">BÀI TIẾP THEO</p><h2>{suggestion.title}</h2><p>{done.size ? "Giữ nhịp học, tiếp tục xây nền tảng của bạn." : "Một bài học đầu tiên là một khởi đầu tốt."}</p></div><a className="btn" href={`/learn/${suggestion.slug}`}>Tiếp tục học<Icon name="arrow" /></a></section>}
    <div className="metric-strip" aria-label="Hoạt động học tập"><div><b>{done.size}</b><span>bài đã hoàn thành</span></div><div><b>{Math.round(secs / 60)}</b><span>phút học được ghi nhận</span></div><div><b>{attempts.length}</b><span>lượt quiz gần đây</span></div></div>
    <SectionHeading eyebrow="LỘ TRÌNH CỦA BẠN" title="Học từng bước, thấy mình tiến bộ." />
    <div className="course-grid">{rows.map(({ c, p }, i) => <CourseCard key={c.id} slug={c.slug} title={c.title} description={c.description} level={c.level} index={i} lessons={c.modules.flatMap(m => m.lessons).filter(l => l.contentFile).length} modules={c.modules.length} progress={p} headingLevel={3} />)}</div>
    <SectionHeading eyebrow="TỰ KIỂM TRA" title="Điểm quiz gần đây" />
    {attempts.length === 0 ? <EmptyState title="Chưa có lượt làm quiz nào" description="Quiz nằm cuối mỗi bài học. Làm thử để kiểm tra điều bạn vừa hiểu và đọc lời giải sau khi nộp." href={suggestion ? `/learn/${suggestion.slug}` : "/courses"} action="Mở một bài học" icon="book" /> : <ul className="recent-list">{attempts.map(a => <li key={a.id}><div><strong>{a.quiz.lesson.title}</strong><small>{a.createdAt.toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</small></div><span className="score-badge">{a.score}/{a.total}</span></li>)}</ul>}
  </>;
}
