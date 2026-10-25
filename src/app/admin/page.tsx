import { notFound } from "next/navigation"; import { requireAdmin } from "@/lib/auth"; import { db } from "@/lib/db"; import AdminToggle from "@/components/AdminToggle"; import AdminResources from "@/components/AdminResources"; import AdminDatasets from "@/components/AdminDatasets"; import AdminContent from "@/components/AdminContent"; import { AdminReset, AdminEditor } from "@/components/AdminTools"; import fs from "fs"; import path from "path";
export const dynamic = "force-dynamic";
export default async function Admin() {
  if (!(await requireAdmin())) notFound();
  const cs = await db.course.findMany({ orderBy: { order: "asc" }, include: { _count: { select: { modules: true } } } });
  const rs = (await db.resource.findMany({ orderBy: { title: "asc" } })).map(r => ({ id: r.id, title: r.title, url: r.url, kind: r.kind }));
  const ds = (await db.dataset.findMany({ orderBy: { name: "asc" } })).map(d => ({ id: d.id, slug: d.slug, name: d.name }));
  const tree = await db.course.findMany({ orderBy: { order: "asc" }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" } } } } } });
  const mods = tree.flatMap(c => c.modules.map(m => ({ id: m.id, courseId: c.id, title: m.title, label: `${c.title} › ${m.title}` })));
  const les = tree.flatMap(c => c.modules.flatMap(m => m.lessons.map(l => ({ id: l.id, moduleId: m.id, slug: l.slug, title: l.title, level: l.level, minutes: l.minutes, contentFile: l.contentFile, label: `${m.title} › ${l.title}` }))));
  const qs = (await db.quizQuestion.findMany({ include: { quiz: { include: { lesson: true } } }, orderBy: { id: "asc" } })).map(q => ({ id: q.id, lessonId: q.quiz.lessonId, prompt: q.prompt, options: JSON.parse(q.optionsJson) as string[], correct: q.correctIndex, explanation: q.explanation, lesson: q.quiz.lesson.title }));
  const files = fs.readdirSync(path.join(process.cwd(), "content/lessons")).filter(f => f.endsWith(".md")).sort();
  return <><h1>Quản trị</h1><p>Hỗ trợ xuất bản/ẩn khóa học và thêm/xóa module, bài học, câu hỏi quiz, tài nguyên và dataset.</p>
    <ul>{cs.map(c => <li key={c.id}>{c.title} ({c._count.modules} module) · {c.published ? "đang hiển thị" : "đang ẩn"} <AdminToggle id={c.id} published={c.published} /></li>)}</ul><AdminContent courses={tree.map(c => ({ id: c.id, title: c.title }))} modules={mods} lessons={les} questions={qs} /><AdminEditor files={files} /><AdminReset /><AdminResources resources={rs} /><AdminDatasets datasets={ds} /></>;
}
