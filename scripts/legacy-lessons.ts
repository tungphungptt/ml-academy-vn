import fs from "node:fs";
import path from "node:path";
import { overrideDir } from "../src/lib/lessonFiles";
import { validateContentFile } from "../src/lib/validation";

// Operator-only backup import, outside the web module graph.
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
    const bundled = path.join(process.cwd(), "content/lessons", file);
    if (fs.existsSync(bundled) && fs.readFileSync(bundled, "utf8") === text) continue;
    pending.push(file);
  }
  fs.mkdirSync(dir, { recursive: true });
  for (const file of pending) fs.copyFileSync(path.join(source, file), path.join(dir, file), fs.constants.COPYFILE_EXCL);
  return pending.length;
}
