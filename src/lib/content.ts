import fs from "fs"; import path from "path";
import { readLesson } from "./lessonFiles";
export type Lesson = { s: string; t: string; f: string; src: { title: string; url: string }[]; level?: string; tier?: "Core" | "Intermediate" | "Advanced"; prerequisites?: string[]; minutes?: number; kind?: "lesson" | "practice" };
export type Catalog = { courses: { slug: string; title: string; description: string; level: string; modules: { key?: string; title: string; lessons: (string | Lesson)[] }[] }[] };
const ttl = () => (process.env.NODE_ENV === "production" ? Infinity : 5000); // production: đọc một lần; dev: làm mới sau 5 giây
const resets: (() => void)[] = [];
export const clearContentCache = () => resets.forEach(r => r());
function memo<T>(f: () => T): () => T { let c: { at: number; v: T } | null = null; resets.push(() => { c = null; }); return () => { if (!c || Date.now() - c.at > ttl()) c = { at: Date.now(), v: f() }; return c.v; }; }
const read = (...p: string[]) => fs.readFileSync(path.join(process.cwd(), ...p), "utf8");
export const getCatalog = memo(() => JSON.parse(read("content/catalog.json")) as Catalog);
export const getLessons = (): Lesson[] => getCatalog().courses.flatMap(c => c.modules.flatMap(m => m.lessons.filter((l): l is Lesson => typeof l !== "string")));
export const getSearchDocs = memo(() => getLessons().map(l => ({ slug: l.s, title: l.t, text: readLesson(l.f).replace(/[#*`$\\]|!\[[^\]]*\]\([^)]*\)/g, " ") })));
export const getStats = memo(() => ({ lessons: getLessons().length, images: fs.readdirSync(path.join(process.cwd(), "public/img")).filter(f => f.endsWith(".svg")).length, labs: (JSON.parse(read("content/labs.json")) as unknown[]).length }));
