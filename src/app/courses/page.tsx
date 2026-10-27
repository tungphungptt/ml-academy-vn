import PageHeading from "@/components/PageHeading";
import CourseCard from "@/components/CourseCard";
import EmptyState from "@/components/EmptyState";
import { db } from "@/lib/db"; import { currentUser } from "@/lib/auth"; import { courseProgress } from "@/lib/progress";
import { normalizeSearch } from "@/lib/search";
export const dynamic = "force-dynamic";
type SP = { q?: string; level?: string; status?: string; sort?: string };
export default async function Courses({ searchParams: pendingSearchParams }: { searchParams: Promise<SP> }) {
  const searchParams = await pendingSearchParams;
  const q = normalizeSearch((searchParams.q ?? "").trim()), level = searchParams.level ?? "", status = searchParams.status ?? "";
  const u = await currentUser();
  const done = new Set(u ? (await db.lessonProgress.findMany({ where: { userId: u.id } })).map(p => p.lessonId) : []);
  const cs = await db.course.findMany({ where: { published: true }, orderBy: { order: "asc" }, include: { modules: { include: { lessons: true } } } });
  const rows = cs.map(c => {
    const ls = c.modules.flatMap(m => m.lessons); const p = courseProgress(ls.map(l => ({ id: l.id, slug: l.slug, title: l.title, hasContent: !!l.contentFile })), done);
    return { c, ls, p, full: ls.filter(l => l.contentFile).length };
  }).filter(({ c, ls, p }) =>
    (!q || [c.title, c.description, ...ls.flatMap(l => [l.title, l.slug])].some(t => normalizeSearch(t).includes(q))) &&
    (!level || c.level === level) &&
    (!status || !u || (status === "done" ? p.completed === p.total && p.total > 0 : status === "doing" ? p.completed > 0 && p.completed < p.total : p.completed === 0)));
  const sort = searchParams.sort ?? "curriculum";
  if (sort === "title") rows.sort((a, b) => a.c.title.localeCompare(b.c.title, "vi"));
  else if (sort === "progress" && u) rows.sort((a, b) => b.p.percent - a.p.percent);
  return <><PageHeading eyebrow="LỘ TRÌNH HỌC" title="Khóa học" description="Đi từ nền tảng toán và Python đến những mô hình bạn có thể tự giải thích, xây dựng và đánh giá." />
    <form method="get" className="filters" role="search">
      <label className="filter-field query">Chủ đề<input name="q" defaultValue={searchParams.q ?? ""} placeholder="Tên khóa học hoặc chủ đề bạn muốn học" aria-label="Tìm kiếm" /></label>
      <label className="filter-field">Trình độ<select name="level" defaultValue={level} aria-label="Trình độ"><option value="">Mọi trình độ</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      {u && <label className="filter-field">Tiến độ<select name="status" defaultValue={status} aria-label="Tình trạng"><option value="">Mọi tình trạng</option><option value="todo">Chưa học</option><option value="doing">Đang học</option><option value="done">Hoàn thành</option></select></label>}
      <label className="filter-field">Sắp xếp<select name="sort" defaultValue={sort} aria-label="Sắp xếp"><option value="curriculum">Thứ tự lộ trình</option><option value="title">Tên A–Z</option>{u && <option value="progress">Tiến độ cao nhất</option>}</select></label>
      <button className="primary">Lọc</button><a className="filter-reset" href="/courses">Xóa bộ lọc</a>
    </form>
    {rows.length === 0 ? <EmptyState title="Chưa tìm thấy lộ trình phù hợp" description="Thử một từ khóa khác hoặc bỏ bớt bộ lọc. Bạn có thể bắt đầu từ bất kỳ lộ trình đang xuất bản nào." href="/courses" action="Xem tất cả lộ trình" /> : <div className="course-grid">{rows.map(({ c, p, full }) => <CourseCard key={c.id} slug={c.slug} title={c.title} description={c.description} level={c.level} index={cs.findIndex(item => item.id === c.id)} lessons={full} modules={c.modules.length} progress={u ? p : undefined} />)}</div>}
  </>;
}
