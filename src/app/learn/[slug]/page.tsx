import Icon from "@/components/Icon";
import CourseArtwork,{courseArtworkVariant} from '@/components/CourseArtwork';
import { notFound } from "next/navigation"; import { lessonExists, readLesson } from "@/lib/lessonFiles";
import { cache } from "react";
import { getLessons, getLabLinks } from "@/lib/content";
import LessonBody from "@/components/LessonBody";
import LessonPreparation from '@/components/LessonPreparation';
import MarkdownContent from '@/components/MarkdownContent';
import { readingMinutes } from "@/lib/reading";
import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/metadata";
import { authHref } from "@/lib/returnPath";
import { ReadingProgress, Toc, FocusToggle, StudyTimer } from "@/components/LessonTools"; import { slugifyHeading } from "@/lib/search"; import BookmarkNotes from "@/components/BookmarkNotes"; import LessonActions from "@/components/LessonActions"; import QuizForm from "@/components/QuizForm";
export const dynamic = "force-dynamic";
const getLesson = cache((slug: string) => db.lesson.findFirst({
  where: { slug, contentFile: { not: null }, module: { course: { published: true } } },
  include: { sources: true, module: { include: { course: true } }, quiz: { include: { questions: { orderBy: { order: "asc" } } } } },
}));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = await getLesson(slug);
  if (!lesson?.contentFile || !lessonExists(lesson.contentFile)) notFound();
  return pageMetadata(lesson.title, `Hiểu ${lesson.title} từ trực giác đến công thức, ví dụ và Python. Bài học tiếng Việt trên NeuralClone.`, `/learn/${slug}`);
}
export default async function Lesson({ params: pendingParams }: { params: Promise<{ slug: string }> }) {
  const params = await pendingParams;
  const [l, u] = await Promise.all([getLesson(params.slug), currentUser()]);
  if (!l?.contentFile || !lessonExists(l.contentFile)) notFound();
  const meta = getLessons().find(item => item.s === l.slug);
  const [required, progress, bookmark, notes, modules] = await Promise.all([
    meta?.prerequisites?.length ? db.lesson.findMany({ where: { slug: { in: meta.prerequisites }, contentFile: { not: null }, module: { course: { published: true } } }, select: { id: true, slug: true, title: true } }) : [],
    u ? db.lessonProgress.findUnique({ where: { userId_lessonId: { userId: u.id, lessonId: l.id } } }) : null,
    u ? db.bookmark.findUnique({ where: { userId_lessonId: { userId: u.id, lessonId: l.id } } }) : null,
    u ? db.note.findMany({ where: { userId: u.id, lessonId: l.id }, orderBy: { id: "asc" }, select: { id: true, body: true } }) : [],
    db.module.findMany({ where: { courseId: l.module.courseId }, orderBy: { order: "asc" }, include: { lessons: { where: { contentFile: { not: null } }, orderBy: { order: "asc" } } } }),
  ]);
  const prerequisiteOrder = meta?.prerequisites ?? [];
  const prerequisites = required.sort((a, b) => prerequisiteOrder.indexOf(a.slug) - prerequisiteOrder.indexOf(b.slug));
  const done = !!progress, bookmarked = !!bookmark;
  const md = readLesson(l.contentFile);
  const introduction = md.match(/^(\*\*Cấp độ:\*\*[\s\S]*?)\r?\n[ \t]*\r?\n/);
  const lessonText = introduction ? md.slice(introduction[0].length) : md;
  const labs = getLabLinks().filter(lab => lab.lessonSlugs?.includes(l.slug));
  const qs = l.quiz?.questions.map(q => ({ id: q.id, prompt: q.prompt, options: JSON.parse(q.optionsJson) as string[] })) ?? [];
  const heads = md.split("\n").filter(x => x.startsWith("## ")).map(x => x.slice(3).trim()).map(t => ({ id: slugifyHeading(t), text: t }));
  const siblings = modules.flatMap(m => m.lessons);
  const i = siblings.findIndex(x => x.id === l.id), prev = siblings[i - 1], next = siblings[i + 1];
  return <div className="reading-page"><ReadingProgress />{u && <StudyTimer lessonId={l.id} />}
    <nav className="breadcrumb" aria-label="Đường dẫn bài học"><a href="/courses">Lộ trình</a><Icon name="chevron" /><a href={`/courses/${l.module.course.slug}`}>{l.module.course.title}</a><Icon name="chevron" /><span>{l.module.title}</span></nav>
    <header className="reading-header"><div className="reading-cover-copy"><div className="reading-position"><span>Bài {String(i + 1).padStart(2, "0")} / {siblings.length}</span><span>{l.module.title}</span></div><h1>{l.title}</h1><div className="reading-meta"><span className="badge">{l.level}</span>{meta?.tier && <span className="badge neutral">{meta.tier}</span>}<span><Icon name="clock" />{l.minutes} phút theo lộ trình</span>{l.quiz && qs.length > 0 && <a href="#quiz">Tự kiểm tra<Icon name="arrow" /></a>}<FocusToggle /></div><p className="reading-estimate">Khoảng {readingMinutes(md)} phút đọc ở 180 từ/phút, chưa gồm suy luận và thực hành.</p></div><div className="reading-cover-art"><CourseArtwork variant={courseArtworkVariant(l.module.course.slug)}/><small>Đồ họa nhận diện lộ trình</small></div></header>
    <div className={`reading-layout${heads.length < 3 ? " without-toc" : ""}`}><Toc items={heads} /><div className="reading-body">
      {(prerequisites.length > 0 || introduction) && <nav className="prerequisites" aria-label="Kiến thức tiên quyết"><LessonPreparation description={prerequisites.length ? `${prerequisites.length} bài nền tảng` : l.level}><div>{prerequisites.map(item => <a key={item.id} href={`/learn/${item.slug}`}>{item.title}<Icon name="external" /></a>)}</div>{introduction && <div className="lesson-introduction"><MarkdownContent>{introduction[1]}</MarkdownContent></div>}</LessonPreparation></nav>}
      <article className="lesson"><LessonBody text={lessonText}/></article>

      {labs.length > 0 && <aside className="related-practice" aria-label="Thực hành liên quan"><h2>Đến lượt bạn kiểm chứng</h2><p>Đối chiếu công thức với code, kết quả tham khảo và notebook có thể tải về.</p><div className="actions">{labs.map(lab => <a key={lab.id} className="btn" href={`/lab?lab=${lab.id}`}><Icon name="code" />{lab.title}<Icon name="arrow" /></a>)}</div></aside>}
      {l.quiz && qs.length > 0 && <QuizForm quizId={l.quiz.id} questions={qs} loggedIn={!!u} loginHref={authHref("login", `/learn/${l.slug}#quiz`)} />}
      <LessonActions lessonId={l.id} initialDone={done} loggedIn={!!u} loginHref={authHref("login", `/learn/${l.slug}`)} />
      <BookmarkNotes lessonId={l.id} loggedIn={!!u} bookmarked={bookmarked} notes={notes} />
      <section className="lesson-sources"><h2>Nguồn tham khảo của bài</h2><ul>{l.sources.map(source => <li key={source.id}><a href={source.url}>{source.title}</a></li>)}</ul></section>
      <nav className="pager" aria-label="Bài trước và bài tiếp theo">{prev ? <a href={`/learn/${prev.slug}`}><small>← Bài trước</small>{prev.title}</a> : <span />}{next ? <a href={`/learn/${next.slug}`}><small>Bài tiếp theo →</small>{next.title}</a> : <a href="/courses"><small>Đã đến cuối khóa học</small>Khám phá lộ trình tiếp theo →</a>}</nav>
    </div></div>
  </div>;
}
