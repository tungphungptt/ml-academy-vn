"use client";
import { useRouter } from "next/navigation"; import { useState } from "react";
type Mod = { id: string; courseId: string; title: string; label: string };
type Les = { id: string; moduleId: string; slug: string; title: string; level: string; minutes: number; contentFile: string | null; label: string };
type Q = { id: string; lessonId: string; prompt: string; options: string[]; correct: number; explanation: string; lesson: string };
const J = { "Content-Type": "application/json" };
export default function AdminContent({ courses, modules, lessons, questions }: { courses: { id: string; title: string }[]; modules: Mod[]; lessons: Les[]; questions: Q[] }) {
  const router = useRouter(); const [msg, setMsg] = useState("");
  async function send(method: string, url: string, body: unknown, reset?: HTMLFormElement) {
    setMsg(""); const r = await fetch(url, { method, headers: J, body: JSON.stringify(body) });
    if (r.ok) { reset?.reset(); setMsg("Đã lưu."); router.refresh(); } else setMsg((await r.json().catch(() => ({}))).error ?? "Thao tác thất bại");
  }
  const fd = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); return { f: e.currentTarget, d: Object.fromEntries(new FormData(e.currentTarget)) as Record<string, any> }; };
  const del = (url: string, id: string, what: string) => { if (confirm(`Xóa ${what}? Thao tác này không hoàn tác được.`)) send("DELETE", url, { id }); };
  const move = (kind: "module" | "lesson", id: string, dir: "up" | "down") => send("POST", "/api/admin/move", { kind, id, dir });
  const ask = (label: string, cur: string) => window.prompt(label, cur)?.trim() || null;
  const editModule = (m: Mod) => { const title = ask("Tên module mới:", m.title); if (title) send("PATCH", "/api/admin/module", { id: m.id, courseId: m.courseId, title }); };
  const editLesson = (l: Les) => { const title = ask("Tên bài:", l.title); if (!title) return; const mins = ask("Số phút (1-600):", String(l.minutes)); if (!mins) return; send("PATCH", "/api/admin/lesson", { id: l.id, moduleId: l.moduleId, slug: l.slug, title, level: l.level, minutes: Number(mins), contentFile: l.contentFile ?? "" }); };
  const editQuestion = (q: Q) => { const prompt = ask("Câu hỏi:", q.prompt); if (!prompt) return; const explanation = ask("Giải thích:", q.explanation); if (!explanation) return; send("PATCH", "/api/admin/question", { id: q.id, lessonId: q.lessonId, prompt, options: q.options, correct: q.correct, explanation }); };
  const grid = { display: "grid", gap: ".5rem", maxWidth: 520 } as const; const bar = (up: () => void, dn: () => void, ed: () => void, rm: () => void) => <> <button onClick={up} aria-label="Lên">↑</button><button onClick={dn} aria-label="Xuống">↓</button><button onClick={ed}>Sửa</button><button onClick={rm}>Xóa</button></>;
  return <section><h2>Nội dung khóa học</h2>{msg && <p role="status">{msg}</p>}
    <h3>Module</h3><ul>{modules.map(m => <li key={m.id}>{m.label}{bar(() => move("module", m.id, "up"), () => move("module", m.id, "down"), () => editModule(m), () => del("/api/admin/module", m.id, "module (kèm toàn bộ bài học)"))}</li>)}</ul>
    <form style={grid} onSubmit={e => { const { f, d } = fd(e); send("POST", "/api/admin/module", d, f); }}>
      <select name="courseId" required>{courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}</select><input name="title" placeholder="Tên module" required /><button>Thêm module</button></form>
    <h3>Bài học</h3><ul>{lessons.map(l => <li key={l.id}>{l.label}{bar(() => move("lesson", l.id, "up"), () => move("lesson", l.id, "down"), () => editLesson(l), () => del("/api/admin/lesson", l.id, "bài học"))}</li>)}</ul>
    <form style={grid} onSubmit={e => { const { f, d } = fd(e); d.minutes = Number(d.minutes); send("POST", "/api/admin/lesson", d, f); }}>
      <select name="moduleId" required>{modules.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}</select>
      <input name="slug" placeholder="slug (vd: bai-moi)" required /><input name="title" placeholder="Tên bài" required />
      <select name="level" defaultValue="Beginner"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select>
      <input name="minutes" type="number" min={1} max={600} defaultValue={30} required /><input name="contentFile" placeholder="file trong content/lessons (vd: bai-moi.md), có thể để trống" />
      <button>Thêm bài học</button></form>
    <h3>Câu hỏi quiz</h3><ul>{questions.map(q => <li key={q.id}>[{q.lesson}] {q.prompt} <button onClick={() => editQuestion(q)}>Sửa</button><button onClick={() => del("/api/admin/question", q.id, "câu hỏi")}>Xóa</button></li>)}</ul>
    <form style={grid} onSubmit={e => { const { f, d } = fd(e); send("POST", "/api/admin/question", { lessonId: d.lessonId, prompt: d.prompt, explanation: d.explanation, options: String(d.options).split("\n").map(s => s.trim()).filter(Boolean), correct: Number(d.correct) - 1 }, f); }}>
      <select name="lessonId" required>{lessons.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}</select><textarea name="prompt" placeholder="Câu hỏi" rows={2} required />
      <textarea name="options" placeholder={"Mỗi lựa chọn một dòng (2-6 dòng)"} rows={4} required /><input name="correct" type="number" min={1} max={6} placeholder="Số thứ tự đáp án đúng (1, 2, ...)" required />
      <textarea name="explanation" placeholder="Giải thích" rows={2} required /><button>Thêm câu hỏi</button></form></section>;
}
