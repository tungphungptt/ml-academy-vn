import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validateContentFile } from "./validation";

const bundledDir = () => path.join(process.cwd(), "content/lessons");
// Mutable runtime storage is mounted/provisioned separately from bundled
// lessons. Tracing it would package the whole project, including local data.
export const overrideDir = () => path.resolve(/* turbopackIgnore: true */ process.env.LESSON_CONTENT_DIR || ".local/lesson-overrides");

function filename(file: string) {
  if (!validateContentFile(file).ok) throw new Error("Invalid lesson filename");
  return file;
}

// Only edited lessons live on the disk. New bundled lessons stay visible.
export function lessonPath(file: string) {
  const name = filename(file), override = path.join(/* turbopackIgnore: true */ overrideDir(), name);
  return fs.existsSync(override) ? override : path.join(process.cwd(), "content", "lessons", name);
}

export const lessonExists = (file: string) => fs.existsSync(lessonPath(file));
// Bound memory while avoiding a full disk read of every lesson on each search.
// Check the resolved file each time so external edits/removals are visible too.
const textCache = new Map<string, { version: string; text: string }>();
export function readLesson(file: string) {
  const resolved = lessonPath(file), stat = fs.statSync(resolved, { bigint: true });
  const version = `${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`;
  const cached = textCache.get(resolved);
  if (cached?.version === version) return cached.text;
  const text = fs.readFileSync(resolved, "utf8");
  if (textCache.size >= 128) textCache.delete(textCache.keys().next().value!);
  textCache.set(resolved, { version, text });
  return text;
}
export function listLessonFiles() {
  const files = [bundledDir(), overrideDir()].flatMap(dir => fs.existsSync(dir) ? fs.readdirSync(dir) : []);
  return [...new Set(files.filter(file => validateContentFile(file).ok))].sort();
}

export function writeLesson(file: string, text: string) {
  const name = filename(file), dir = overrideDir();
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(/* turbopackIgnore: true */ dir, name), tmp = path.join(/* turbopackIgnore: true */ dir, `.${name}.${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(tmp, text, { encoding: "utf8", flag: "wx", mode: 0o600 });
    fs.renameSync(tmp, target);
    textCache.delete(target);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}
