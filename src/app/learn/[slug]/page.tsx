import Icon from "@/components/Icon";
import { notFound } from "next/navigation"; import { readLesson } from "@/lib/lessonFiles";
import { getLessons, getLabLinks } from "@/lib/content";
import MarkdownContent from "@/components/MarkdownContent";
import { readingMinutes } from "@/lib/reading";
import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth";
import { ReadingProgress, Toc, FocusToggle, StudyTimer } from "@/components/LessonTools"; import { slugifyHeading } from "@/lib/search"; import BookmarkNotes from "@/components/BookmarkNotes"; import LessonActions from "@/components/LessonActions"; import QuizForm from "@/components/QuizForm";
export const dynamic = "force-dynamic";
export default async function Lesson({ params: pendingParams }: { params: Promise<{ slug: string }> }) {
  const params = await pendingParams;
  const l = await db.lesson.findUnique({ where: { slug: params.slug }, include: { sources: true, module: { include: { course: true } }, quiz: { include: { questions: { orderBy: { order: "asc" } } } } } });
  if (!l || !l.contentFile || !l.module.course.published) notFound();
  const meta = getLessons().find(item => item.s === l.slug);
  const prerequisites = meta?.prerequisites?.length ? await db.lesson.findMany({ where: { slug: { in: meta.prerequisites }, module: { course: { published: true } } } }) : [];
  const u = await currentUser();
  const done = u ? !!(await db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: u.id, lessonId: l.id } } })) : false;
  const bookmarked = u ? !!(await db.bookmark.findUnique({ where: { userId_lessonId: { userId: u.id, lessonId: l.id } } })) : false;
  const notes = u ? (await db.note.findMany({ where: { userId: u.id, lessonId: l.id }, orderBy: { id: "asc" } })).map(n => ({ id: n.id, body: n.body })) : [];
  const md = readLesson(l.contentFile);
  const labs = getLabLinks().filter(lab => lab.lessonSlugs?.includes(l.slug));
  const qs = l.quiz?.questions.map(q => ({ id: q.id, prompt: q.prompt, options: JSON.parse(q.optionsJson) as string[] })) ?? [];
  const heads = md.split("\n").filter(x => x.startsWith("## ")).map(x => x.slice(3).trim()).map(t => ({ id: slugifyHeading(t), text: t }));
  const siblings = (await db.module.findMany({ where: { courseId: l.module.courseId }, orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } })).flatMap(m => m.lessons).filter(x => x.contentFile);
  const i = siblings.findIndex(x => x.id === l.id), prev = siblings[i - 1], next = siblings[i + 1];
  return <div className="reading-page"><ReadingProgress />{u && <StudyTimer lessonId={l.id} />}
    <nav className="breadcrumb" aria-label="Đường dẫn bài học"><a href="/courses">Lộ trình</a><Icon name="chevron" /><a href={`/courses/${l.module.course.slug}`}>{l.module.course.title}</a><Icon name="chevron" /><span>{l.module.title}</span></nav>
    <header className="reading-header"><div className="row2"><h1>{l.title}</h1><FocusToggle /></div><div className="reading-meta"><span className="badge">{l.level}</span>{meta?.tier && <span className="badge neutral">{meta.tier}</span>}<span><Icon name="clock" />{l.minutes} phút theo lộ trình</span><span>{l.module.title}</span><span>{i + 1}/{siblings.length} bài trong khóa học</span></div><p className="reading-estimate">Khoảng {readingMinutes(md)} phút đọc ở 180 từ/phút, chưa gồm suy luận và thực hành.</p></header>
    <div className={`reading-layout${heads.length < 3 ? " without-toc" : ""}`}><Toc items={heads} /><div className="reading-body">
      <article className="lesson"><MarkdownContent>{md}</MarkdownContent></article>
      {prerequisites.length > 0 && <nav className="prerequisites" aria-label="Kiến thức tiên quyết"><p className="eyebrow">KẾT NỐI KIẾN THỨC</p><p>Nên học trước</p>{prerequisites.map(item => <a key={item.id} href={`/learn/${item.slug}`}>{item.title} <span aria-hidden="true">↗</span></a>)}</nav>}
      {labs.length > 0 && <aside className="related-practice" aria-label="Thực hành liên quan"><h2>Đến lượt bạn kiểm chứng</h2><p>Đối chiếu công thức với code, kết quả tham khảo và notebook có thể tải về.</p><div className="actions">{labs.map(lab => <a key={lab.id} className="btn" href={`/lab?lab=${lab.id}`}><Icon name="code" />{lab.title}<Icon name="arrow" /></a>)}</div></aside>}
      {l.quiz && qs.length > 0 && <QuizForm quizId={l.quiz.id} questions={qs} loggedIn={!!u} />}
      <LessonActions lessonId={l.id} initialDone={done} loggedIn={!!u} />
      <BookmarkNotes lessonId={l.id} loggedIn={!!u} bookmarked={bookmarked} notes={notes} />
      <section className="lesson-sources"><h2>Nguồn tham khảo của bài</h2><ul>{l.sources.map(source => <li key={source.id}><a href={source.url}>{source.title}</a></li>)}</ul></section>
      <nav className="pager" aria-label="Bài trước và bài tiếp theo">{prev ? <a href={`/learn/${prev.slug}`}><small>← Bài trước</small>{prev.title}</a> : <span />}{next ? <a href={`/learn/${next.slug}`}><small>Bài tiếp theo →</small>{next.title}</a> : <span />}</nav>
    </div></div>
  </div>;
}
