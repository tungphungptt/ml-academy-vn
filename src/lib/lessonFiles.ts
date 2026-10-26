import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { validateContentFile } from "./validation";

const bundledDir = () => path.join(process.cwd(), "content/lessons");
const overrideDir = () => path.resolve(process.env.LESSON_CONTENT_DIR || ".local/lesson-overrides");

function filename(file: string) {
  if (!validateContentFile(file).ok) throw new Error("Invalid lesson filename");
  return file;
}

// Only edited lessons live on the disk. New bundled lessons stay visible.
export function lessonPath(file: string) {
  const name = filename(file), override = path.join(overrideDir(), name);
  return fs.existsSync(override) ? override : path.join(bundledDir(), name);
}

export const lessonExists = (file: string) => fs.existsSync(lessonPath(file));
export const readLesson = (file: string) => fs.readFileSync(lessonPath(file), "utf8");
export function listLessonFiles() {
  const files = [bundledDir(), overrideDir()].flatMap(dir => fs.existsSync(dir) ? fs.readdirSync(dir) : []);
  return [...new Set(files.filter(file => validateContentFile(file).ok))].sort();
}

export function writeLesson(file: string, text: string) {
  const name = filename(file), dir = overrideDir();
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, name), tmp = path.join(dir, `.${name}.${randomUUID()}.tmp`);
  try {
    fs.writeFileSync(tmp, text, { encoding: "utf8", flag: "wx", mode: 0o600 });
    fs.renameSync(tmp, target);
  } finally {
    fs.rmSync(tmp, { force: true });
  }
}

// Explicit import from a backup: preflight conflicts and never replace edits.
export function importLegacyLessons(source: string) {
  const dir = overrideDir();
  if (path.resolve(source) === dir) throw new Error("Import source is already the override directory");
  const pending: string[] = [];
  for (const file of fs.readdirSync(source)) {
    if (!validateContentFile(file).ok) continue;
    const src = path.join(source, file);
    if (!fs.lstatSync(src).isFile()) throw new Error(`Not a regular lesson file: ${file}`);
    const text = fs.readFileSync(src, "utf8"), target = path.join(dir, file);
    if (fs.existsSync(target)) {
      if (fs.readFileSync(target, "utf8") !== text) throw new Error(`Existing override conflicts: ${file}`);
      continue;
    }
    const bundled = path.join(bundledDir(), file);
    if (fs.existsSync(bundled) && fs.readFileSync(bundled, "utf8") === text) continue;
    pending.push(file);
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const file of pending) fs.copyFileSync(path.join(source, file), path.join(dir, file), fs.constants.COPYFILE_EXCL);
  return pending.length;
}
