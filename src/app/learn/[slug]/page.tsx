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
  return <><p className="breadcrumb"><a href="/courses">Khóa học</a><span aria-hidden="true"> / </span><a href={`/courses/${l.module.course.slug}`}>{l.module.course.title}</a><span aria-hidden="true"> / </span><span>{l.module.title}</span></p>
    <ReadingProgress />{u && <StudyTimer lessonId={l.id} />}<div className="row2"><h1>{l.title}</h1><FocusToggle /></div><p><span className="badge">{l.level}</span><span className="badge">{l.minutes} phút</span><span className="badge">{l.module.title}</span></p>
    <p className="mut reading-estimate">Khoảng {readingMinutes(md)} phút đọc ở 180 từ/phút, chưa gồm suy luận và thực hành. Thời lượng lộ trình ở trên dành cho cả buổi học.</p>
    {meta?.tier && <p><span className="badge">{meta.tier}</span></p>}
    {prerequisites.length > 0 && <nav aria-label="Kiến thức tiên quyết"><p>Nên học trước: {prerequisites.map((item, index) => <span key={item.id}>{index > 0 && " · "}<a href={`/learn/${item.slug}`}>{item.title}</a></span>)}</p></nav>}
    <Toc items={heads} /><article className="lesson"><MarkdownContent>{md}</MarkdownContent></article>
    {labs.length > 0 && <aside className="card" aria-label="Thực hành liên quan"><h2>Thử bằng code</h2><p>Đối chiếu công thức với một lần chạy thực tế. Mỗi lab có code, kết quả tham khảo và notebook tải về.</p>{labs.map(lab => <a key={lab.id} className="btn" href={`/lab?lab=${lab.id}`}>{lab.title} →</a>)}</aside>}
    {l.quiz && qs.length > 0 && <QuizForm quizId={l.quiz.id} questions={qs} loggedIn={!!u} />}
    <LessonActions lessonId={l.id} initialDone={done} loggedIn={!!u} />
    <BookmarkNotes lessonId={l.id} loggedIn={!!u} bookmarked={bookmarked} notes={notes} />
    <h2>Nguồn tham khảo</h2><ul>{l.sources.map(s => <li key={s.id}><a href={s.url}>{s.title}</a></li>)}</ul>
    <div className="pager">{prev ? <a className="btn" href={`/learn/${prev.slug}`}>← {prev.title}</a> : <span />}{next ? <a className="btn primary" href={`/learn/${next.slug}`}>{next.title} →</a> : <span />}</div></>;
}
