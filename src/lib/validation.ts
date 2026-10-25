export const RESOURCE_KINDS = ["book", "course", "docs", "paper", "repo"] as const;
export type ResourceInput = { title: string; description: string; topic: string; kind: (typeof RESOURCE_KINDS)[number]; url: string };
export function validateResource(x: unknown): { ok: true; data: ResourceInput } | { ok: false; errors: string[] } {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>, errors: string[] = [];
  const str = (k: string, max: number) => { const v = typeof o[k] === "string" ? (o[k] as string).trim() : ""; if (!v || v.length > max) errors.push(`${k} phải có 1-${max} ký tự`); return v; };
  const title = str("title", 200), description = str("description", 500), topic = str("topic", 100);
  const kind = o.kind as ResourceInput["kind"]; if (!RESOURCE_KINDS.includes(kind)) errors.push("kind không hợp lệ");
  const url = typeof o.url === "string" ? o.url.trim() : "";
  try { if (new URL(url).protocol !== "https:") errors.push("url phải dùng https"); } catch { errors.push("url không hợp lệ"); }
  return errors.length ? { ok: false, errors } : { ok: true, data: { title, description, topic, kind, url } };
}
export type DatasetInput = { slug: string; name: string; description: string; task: string; rows: number; features: number; url: string; license: string; loadCode: string; baseline: string };
export function validateDataset(x: unknown): { ok: true; data: DatasetInput } | { ok: false; errors: string[] } {
  const o = (x && typeof x === "object" ? x : {}) as Record<string, unknown>, errors: string[] = [];
  const str = (k: string, max: number) => { const v = typeof o[k] === "string" ? (o[k] as string).trim() : ""; if (!v || v.length > max) errors.push(`${k} phải có 1-${max} ký tự`); return v; };
  const slug = str("slug", 60); if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) errors.push("slug chỉ gồm chữ thường, số và dấu gạch ngang");
  const name = str("name", 120), description = str("description", 600), task = str("task", 80), license = str("license", 300), loadCode = str("loadCode", 2000), baseline = str("baseline", 300);
  const int = (k: string) => { const v = o[k]; if (typeof v !== "number" || !Number.isInteger(v) || v < 1 || v > 1e9) errors.push(`${k} phải là số nguyên dương`); return v as number; };
  const rows = int("rows"), features = int("features");
  const url = typeof o.url === "string" ? o.url.trim() : "";
  try { if (new URL(url).protocol !== "https:") errors.push("url phải dùng https"); } catch { errors.push("url không hợp lệ"); }
  return errors.length ? { ok: false, errors } : { ok: true, data: { slug, name, description, task, rows, features, url, license, loadCode, baseline } };
}
type R<T> = { ok: true; data: T } | { ok: false; errors: string[] };
const obj = (x: unknown) => (x && typeof x === "object" ? x : {}) as Record<string, unknown>;
const mk = (errors: string[]) => (k: string, o: Record<string, unknown>, max: number, optional = false) => {
  const v = typeof o[k] === "string" ? (o[k] as string).trim() : ""; if ((!v && !optional) || v.length > max) errors.push(`${k} phải có ${optional ? 0 : 1}-${max} ký tự`); return v;
};
export function validateModule(x: unknown): R<{ courseId: string; title: string }> {
  const o = obj(x), e: string[] = [], s = mk(e); const courseId = s("courseId", o, 100), title = s("title", o, 120);
  return e.length ? { ok: false, errors: e } : { ok: true, data: { courseId, title } };
}
export const LEVELS = ["Beginner", "Intermediate", "Advanced"];
export function validateLesson(x: unknown): R<{ moduleId: string; slug: string; title: string; level: string; minutes: number; contentFile: string | null }> {
  const o = obj(x), e: string[] = [], s = mk(e);
  const moduleId = s("moduleId", o, 100), slug = s("slug", o, 80), title = s("title", o, 160), file = s("contentFile", o, 100, true);
  if (slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) e.push("slug chỉ gồm chữ thường, số và dấu gạch ngang");
  if (file && !/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(file)) e.push("contentFile phải có dạng ten-bai.md (không chứa đường dẫn)");
  const level = o.level as string; if (!LEVELS.includes(level)) e.push("level không hợp lệ");
  const minutes = o.minutes as number; if (typeof minutes !== "number" || !Number.isInteger(minutes) || minutes < 1 || minutes > 600) e.push("minutes phải là số nguyên 1-600");
  return e.length ? { ok: false, errors: e } : { ok: true, data: { moduleId, slug, title, level, minutes, contentFile: file || null } };
}
export function validateQuestion(x: unknown): R<{ lessonId: string; prompt: string; options: string[]; correct: number; explanation: string }> {
  const o = obj(x), e: string[] = [], s = mk(e); const lessonId = s("lessonId", o, 100), prompt = s("prompt", o, 500), explanation = s("explanation", o, 500);
  const options = Array.isArray(o.options) ? (o.options as unknown[]).map(v => (typeof v === "string" ? v.trim() : "")) : [];
  if (options.length < 2 || options.length > 6 || options.some(v => !v || v.length > 200)) e.push("cần 2-6 lựa chọn, mỗi lựa chọn 1-200 ký tự");
  if (new Set(options).size !== options.length) e.push("các lựa chọn không được trùng nhau");
  const correct = o.correct as number; if (typeof correct !== "number" || !Number.isInteger(correct) || correct < 0 || correct >= options.length) e.push("đáp án đúng nằm ngoài danh sách lựa chọn");
  return e.length ? { ok: false, errors: e } : { ok: true, data: { lessonId, prompt, options, correct, explanation } };
}
export function validateStudyPing(x: unknown): R<{ lessonId: string; seconds: number }> {
  const o = obj(x), e: string[] = [], s = mk(e); const lessonId = s("lessonId", o, 100), seconds = o.seconds as number;
  if (typeof seconds !== "number" || !Number.isInteger(seconds) || seconds < 1 || seconds > 120) e.push("seconds phải là số nguyên 1-120");
  return e.length ? { ok: false, errors: e } : { ok: true, data: { lessonId, seconds } };
}
export function validatePasswordChange(x: unknown): R<{ current: string; next: string }> {
  const o = obj(x), e: string[] = []; const current = typeof o.current === "string" ? o.current : "", next = typeof o.next === "string" ? o.next : "";
  if (!current || current.length > 100) e.push("cần nhập mật khẩu hiện tại");
  if (next.length < 8 || next.length > 100) e.push("mật khẩu mới phải có 8-100 ký tự");
  if (next && next === current) e.push("mật khẩu mới phải khác mật khẩu hiện tại");
  return e.length ? { ok: false, errors: e } : { ok: true, data: { current, next } };
}
export function validateMove(x: unknown): R<{ kind: "module" | "lesson"; id: string; dir: "up" | "down" }> {
  const o = obj(x), e: string[] = [];
  if (o.kind !== "module" && o.kind !== "lesson") e.push("kind không hợp lệ");
  if (o.dir !== "up" && o.dir !== "down") e.push("dir không hợp lệ");
  if (typeof o.id !== "string" || !o.id || o.id.length > 100) e.push("id không hợp lệ");
  return e.length ? { ok: false, errors: e } : { ok: true, data: { kind: o.kind as "module" | "lesson", id: o.id as string, dir: o.dir as "up" | "down" } };
}
export function validateEmailOnly(x: unknown): R<{ email: string }> {
  const o = obj(x); const email = typeof o.email === "string" ? o.email.trim() : "";
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 200 ? { ok: true, data: { email } } : { ok: false, errors: ["email không hợp lệ"] };
}
export function validateReset(x: unknown): R<{ token: string; next: string }> {
  const o = obj(x), e: string[] = []; const token = typeof o.token === "string" ? o.token : "", next = typeof o.next === "string" ? o.next : "";
  if (!/^[a-f0-9]{64}$/.test(token)) e.push("liên kết không hợp lệ");
  if (next.length < 8 || next.length > 100) e.push("mật khẩu mới phải có 8-100 ký tự");
  return e.length ? { ok: false, errors: e } : { ok: true, data: { token, next } };
}
export function validateContentFile(x: unknown): R<{ file: string }> {
  return typeof x === "string" && x.length <= 100 && /^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(x) ? { ok: true, data: { file: x } } : { ok: false, errors: ["tên file phải dạng ten-bai.md (không chứa đường dẫn)"] };
}
