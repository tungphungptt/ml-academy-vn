import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { seedDatabase } from "../prisma/seed-data";
import type { Catalog } from "../src/lib/content";

/** Add-only release import: no schema reset, admin creation or replacement of
 * existing lesson/module/quiz edits. Back up the authorized local DB first. */
async function update() {
  if (fs.existsSync(".env")) process.loadEnvFile(".env");
  const db = new PrismaClient();
  try {
    const files = await db.$queryRawUnsafe<{ name: string; file: string }[]>("PRAGMA database_list");
    const main = files.find(f => f.name === "main");
    if (!main?.file) throw new Error("Expected a local SQLite database.");
    const root = fs.realpathSync(process.cwd()), actual = fs.realpathSync(main.file), relative = path.relative(root, actual);
    if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error("Refusing to write a database outside the authorized project.");
    const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8")) as Catalog;
    const oldLessons = await db.lesson.findMany({ orderBy: { slug: "asc" } });
    const oldModules = await db.module.findMany({ orderBy: { id: "asc" } });
    const oldQuestions = await db.quizQuestion.findMany({ orderBy: { id: "asc" } });
    const counts = async () => ({ users: await db.user.count(), progress: await db.lessonProgress.count(), notes: await db.note.count(), attempts: await db.quizAttempt.count(), bookmarks: await db.bookmark.count() });
    const beforeCounts = await counts();
    const previous = new Set(oldLessons.map(l => l.slug));
    const missing = catalog.courses.flatMap(c => c.modules.flatMap(m => m.lessons)).filter(l => typeof l !== "string" && !previous.has(l.s));
    let backup: string | null = null;
    if (missing.length) {
      backup = path.resolve(".local", "backups", `neuralclone-content-${Date.now()}.db`);
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      await db.$executeRawUnsafe("VACUUM INTO ?", backup);
      await seedDatabase(db, {}, catalog);
    }
    // Add a newly reviewed reference without replacing old references or edits.
    const transformer = await db.lesson.findUnique({ where: { slug: "transformer-architecture" } });
    const url = "https://arxiv.org/abs/2104.09864";
    if (transformer && !(await db.sourceReference.findFirst({ where: { lessonId: transformer.id, url } }))) {
      if (!backup) {
        backup = path.resolve(".local", "backups", `neuralclone-content-${Date.now()}.db`);
        fs.mkdirSync(path.dirname(backup), { recursive: true });
        await db.$executeRawUnsafe("VACUUM INTO ?", backup);
      }
      await db.sourceReference.create({ data: { lessonId: transformer.id, title: "RoFormer: Rotary Position Embedding", url } });
    }
    assert.deepEqual(await db.lesson.findMany({ where: { id: { in: oldLessons.map(l => l.id) } }, orderBy: { slug: "asc" } }), oldLessons);
    assert.deepEqual(await db.module.findMany({ where: { id: { in: oldModules.map(m => m.id) } }, orderBy: { id: "asc" } }), oldModules);
    assert.deepEqual(await db.quizQuestion.findMany({ where: { id: { in: oldQuestions.map(q => q.id) } }, orderBy: { id: "asc" } }), oldQuestions);
    assert.deepEqual(await counts(), beforeCounts);
    const result = { checkedAt: new Date().toISOString(), added: missing.map(l => typeof l === "string" ? l : l.s), previousLessons: oldLessons.length, lessons: await db.lesson.count(), questions: await db.quizQuestion.count(), originalRowsPreserved: true, userDataCountsPreserved: true, userDataCounts: beforeCounts, backup: backup ? path.relative(root, backup) : null };
    fs.mkdirSync("docs", { recursive: true });
    fs.writeFileSync(`docs/neuralclone-content-${missing.length ? "import" : "idempotency"}.json`, JSON.stringify(result, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
  } finally { await db.$disconnect(); }
}
update().catch(error => { console.error(error); process.exitCode = 1; });
