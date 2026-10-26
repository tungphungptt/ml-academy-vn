import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { PrismaClient } from "@prisma/client";
import { seedDatabase } from "../prisma/seed-data";
import { getCatalog, getLessons, type Catalog } from "../src/lib/content";
import { getPublishedSearchDocs } from "../src/lib/publishedContent";
import { writeLesson } from "../src/lib/lessonFiles";

const before = JSON.parse(fs.readFileSync("docs/curriculum-inventory-before.json", "utf8")).lessons as { s: string; module: string; course: string }[];

test("curriculum keeps original slugs and orders every prerequisite before its dependent", () => {
  const lessons = getLessons(), index = new Map(lessons.map((l, i) => [l.s, i]));
  assert.equal(lessons.length, 59); assert.equal(index.size, 59);
  for (const old of before) assert.ok(index.has(old.s), `lost ${old.s}`);
  for (const l of lessons) {
    assert.ok(fs.existsSync(`content/lessons/${l.f}`));
    assert.ok(["Core", "Intermediate", "Advanced"].includes(l.tier!));
    for (const p of l.prerequisites!) assert.ok(index.has(p) && index.get(p)! < index.get(l.s)!, `${p} -> ${l.s}`);
  }
  const labs = JSON.parse(fs.readFileSync("content/labs.json", "utf8"));
  assert.equal(new Set(labs.map((l: { id: string }) => l.id)).size, labs.length);
  for (const l of labs) for (const v of l.variants) {
    assert.ok(l.expected[v], `${l.id}/${v} has no executed output`);
    assert.ok(fs.existsSync(`public${l.notebooks[v]}`));
  }
});

test("50-to-59 add-only reconciliation preserves admin edits, IDs, quizzes, attempts and progress", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ml-curriculum-regression-"));
  const file = path.join(dir, "fixture.db"), db = new PrismaClient({ datasources: { db: { url: `file:${file}` } } });
  const sql = new DatabaseSync(file);
  sql.exec(fs.readFileSync("prisma/migrations/20261026000000_initial/migration.sql", "utf8")); sql.close();
  const oldContentDir = process.env.LESSON_CONTENT_DIR;
  process.env.LESSON_CONTENT_DIR = path.join(dir, "overrides");
  try {
    const current = getCatalog();
    // Reconstruct the exact old grouping from the pre-edit inventory, not the new order.
    const old: Catalog = { courses: current.courses.map(c => ({ ...c, modules: [...new Set(before.filter(l => l.course === c.slug).map(l => l.module))].map(title => ({ title, lessons: before.filter(l => l.course === c.slug && l.module === title).map(l => getLessons().find(x => x.s === l.s)!) })) })) };
    await seedDatabase(db, {}, old); assert.equal(await db.lesson.count(), 50);
    const lesson = await db.lesson.findUniqueOrThrow({ where: { slug: "linear-regression" }, include: { quiz: { include: { questions: true } }, module: true } });
    await db.module.update({ where: { id: lesson.moduleId }, data: { title: "Admin renamed this module" } });
    await db.lesson.update({ where: { id: lesson.id }, data: { title: "AdminRegressionKeyword", minutes: 79, order: 99 } });
    const question = lesson.quiz!.questions[0];
    await db.quizQuestion.update({ where: { id: question.id }, data: { explanation: "Admin explanation retained" } });
    const user = await db.user.create({ data: { email: "curriculum-admin@example.invalid", passwordHash: "fixture-only-hash", role: "ADMIN", tokenVersion: 7 } });
    await db.lessonProgress.create({ data: { userId: user.id, lessonId: lesson.id } });
    await db.note.create({ data: { userId: user.id, lessonId: lesson.id, body: "Persistent personal note" } });
    await db.bookmark.create({ data: { userId: user.id, lessonId: lesson.id } });
    await db.quizAttempt.create({ data: { userId: user.id, quizId: lesson.quiz!.id, score: 1, total: 2 } });
    writeLesson(lesson.contentFile!, "# PersistentOverlayKeyword\nEdited by admin");
    const saved = await db.lesson.findMany({ orderBy: { slug: "asc" } });
    const modules = await db.module.findMany({ orderBy: { id: "asc" } });
    const users = await db.user.findMany(), questions = await db.quizQuestion.findMany({ orderBy: { id: "asc" } });
    await seedDatabase(db, { email: user.email, password: "a-different-test-password" });
    await seedDatabase(db);
    assert.equal(await db.lesson.count(), 59);
    assert.equal(await db.quizQuestion.count(), 133);
    assert.deepEqual(await db.lesson.findMany({ where: { slug: { in: before.map(l => l.s) } }, orderBy: { slug: "asc" } }), saved);
    for (const m of modules) assert.deepEqual(await db.module.findUniqueOrThrow({ where: { id: m.id } }), m);
    assert.deepEqual(await db.user.findMany(), users);
    assert.deepEqual(await db.quizQuestion.findMany({ where: { id: { in: questions.map(q => q.id) } }, orderBy: { id: "asc" } }), questions);
    assert.equal(await db.lessonProgress.count(), 1); assert.equal(await db.note.count(), 1);
    assert.equal(await db.bookmark.count(), 1); assert.equal(await db.quizAttempt.count(), 1);
    const lda = await db.lesson.findUniqueOrThrow({ where: { slug: "lda" }, include: { module: { include: { course: true } } } });
    assert.equal(lda.module.course.slug, "ml-fundamentals");
    const docs = await getPublishedSearchDocs(db);
    assert.ok(docs.some(d => d.title === "AdminRegressionKeyword" && d.text.includes("PersistentOverlayKeyword")));
    await db.course.update({ where: { id: lesson.module.courseId }, data: { published: false } });
    const hidden = await getPublishedSearchDocs(db);
    assert.ok(!hidden.some(d => d.slug === lesson.slug));
    assert.ok(hidden.some(d => d.slug === "cnn-cpu"));
  } finally {
    await db.$disconnect();
    if (oldContentDir === undefined) delete process.env.LESSON_CONTENT_DIR; else process.env.LESSON_CONTENT_DIR = oldContentDir;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});


test("downloadable lab notebooks contain current source, verified hashes and recorded stdout", () => {
  const labs = JSON.parse(fs.readFileSync("content/labs.json", "utf8"));
  for (const lab of labs) for (const variant of lab.variants) {
    const code = fs.readFileSync(`labs/${lab.id}/${variant}.py`, "utf8");
    const hash = createHash("sha256").update(code).digest("hex");
    assert.equal(lab.verification[variant].sha256, hash, `${lab.id}/${variant} has stale verification`);
    const notebook = JSON.parse(fs.readFileSync(`public${lab.notebooks[variant]}`, "utf8"));
    const cells = notebook.cells.filter((c: { cell_type: string }) => c.cell_type === "code");
    assert.equal(cells.length, 1);
    assert.equal(cells[0].source.join(""), code, `${lab.id}/${variant} has stale notebook source`);
    assert.equal(cells[0].execution_count, 1);
    const stdout = cells[0].outputs.filter((o: { output_type: string; name?: string }) => o.output_type === "stream" && o.name === "stdout").map((o: { text: string[] }) => o.text.join("")).join("").trim();
    assert.equal(stdout, lab.expected[variant]);
  }
});

test("fresh seed publishes every lesson in catalog order with all quiz prompts, options and keys", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ml-curriculum-fresh-"));
  const file = path.join(dir, "fixture.db"), sql = new DatabaseSync(file);
  sql.exec(fs.readFileSync("prisma/migrations/20261026000000_initial/migration.sql", "utf8")); sql.close();
  const db = new PrismaClient({ datasources: { db: { url: `file:${file}` } } });
  try {
    await seedDatabase(db);
    assert.equal(await db.user.count(), 0);
    assert.equal(await db.lesson.count(), 59);
    assert.equal(await db.quizQuestion.count(), 133);
    for (const c of getCatalog().courses) {
      const course = await db.course.findUniqueOrThrow({ where: { slug: c.slug }, include: { modules: { orderBy: { order: "asc" }, include: { lessons: { orderBy: { order: "asc" }, include: { quiz: { include: { questions: { orderBy: { order: "asc" } } } } } } } } } });
      assert.equal(course.published, true);
      assert.deepEqual(course.modules.flatMap(m => m.lessons.map(l => l.slug)), c.modules.flatMap(m => m.lessons.map(l => typeof l === "string" ? l : l.s)));
      for (const lesson of course.modules.flatMap(m => m.lessons)) {
        const meta = getLessons().find(l => l.s === lesson.slug)!;
        assert.equal(lesson.contentFile, meta.f); assert.equal(lesson.title, meta.t);
        const source = JSON.parse(fs.readFileSync(`content/quizzes/${lesson.slug}.json`, "utf8"));
        assert.deepEqual(lesson.quiz!.questions.map(q => ({ prompt: q.prompt, options: JSON.parse(q.optionsJson), correct: q.correctIndex, explanation: q.explanation })), source);
      }
    }
  } finally { await db.$disconnect(); fs.rmSync(dir, { recursive: true, force: true }); }
});
