import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { spawnSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { inspectDatabase, prepareDatabase, sqlitePath } from "../scripts/prepare-db.mjs";
import { seedDatabase } from "../prisma/seed-data";
import { importLegacyLessons, listLessonFiles, readLesson, writeLesson } from "../src/lib/lessonFiles";
import { clearContentCache, getSearchDocs } from "../src/lib/content";

test("SQLite initialization, seed and restarts preserve edited content and user data", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ml-db-regression-"));
  const url = `file:${dir}/app.db`;
  const oldEmail = process.env.ADMIN_EMAIL, oldPassword = process.env.ADMIN_PASSWORD;
  process.env.ADMIN_EMAIL = ""; process.env.ADMIN_PASSWORD = "";
  const db = new PrismaClient({ datasources: { db: { url } } });
  try {
    prepareDatabase(url);
    assert.equal(inspectDatabase(url).state, "ready");
    assert.equal(await db.user.count(), 0, "bootstrap must not create a default admin");
    assert.equal(await db.lesson.count(), 50);
    const dataset = await db.dataset.findFirstOrThrow();
    const resource = await db.resource.findFirstOrThrow();
    const project = await db.project.findFirstOrThrow();
    const lesson = await db.lesson.findFirstOrThrow();
    const course = await db.course.findFirstOrThrow();
    await db.dataset.update({ where: { id: dataset.id }, data: { name: "Dataset edited by admin" } });
    await db.resource.update({ where: { id: resource.id }, data: { title: "Resource edited by admin" } });
    await db.project.update({ where: { id: project.id }, data: { title: "Project edited by admin" } });
    await db.lesson.update({ where: { id: lesson.id }, data: { title: "Lesson edited by admin" } });
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    const user = await db.user.create({ data: { email: "regression@example.invalid", passwordHash: "test-only-hash", role: "ADMIN", tokenVersion: 3 } });
    await db.lessonProgress.create({ data: { userId: user.id, lessonId: lesson.id } });
    await db.note.create({ data: { userId: user.id, lessonId: lesson.id, body: "My note" } });
    // Supplying new credentials must not change an existing account's hash/role.
    await seedDatabase(db, { email: user.email, password: "test-only-new-password" });
    const learner = await db.user.create({ data: { email: "learner@example.invalid", passwordHash: "learner-test-hash" } });
    await seedDatabase(db, { email: learner.email, password: "test-only-admin-password" });
    assert.deepEqual(await db.user.findUniqueOrThrow({ where: { id: learner.id } }), learner, "seed must not promote an existing learner");
    await seedDatabase(db);
    assert.equal((await db.dataset.findUniqueOrThrow({ where: { id: dataset.id } })).name, "Dataset edited by admin");
    assert.equal((await db.resource.findUniqueOrThrow({ where: { id: resource.id } })).title, "Resource edited by admin");
    assert.equal((await db.project.findUniqueOrThrow({ where: { id: project.id } })).title, "Project edited by admin");
    assert.equal((await db.lesson.findUniqueOrThrow({ where: { id: lesson.id } })).title, "Lesson edited by admin");
    assert.equal((await db.course.findUniqueOrThrow({ where: { id: course.id } })).published, false);
    assert.equal(await db.lesson.count(), 50);
    const before = fs.readFileSync(sqlitePath(url));
    prepareDatabase(url);
    prepareDatabase(url);
    assert.deepEqual(fs.readFileSync(sqlitePath(url)), before, "restart must not write the database");
    assert.deepEqual(await db.user.findUniqueOrThrow({ where: { id: user.id } }), user);
    assert.equal(await db.lessonProgress.count(), 1);
    assert.equal((await db.note.findFirstOrThrow()).body, "My note");
    fs.writeFileSync(`${sqlitePath(url)}.bootstrap-pending`, "simulated interruption after seed");
    assert.throws(() => prepareDatabase(url), /Incomplete initial setup/);
    prepareDatabase(url, true);
    assert.equal(fs.existsSync(`${sqlitePath(url)}.bootstrap-pending`), false);
    assert.deepEqual(await db.user.findUniqueOrThrow({ where: { id: user.id } }), user);
    assert.equal(sqlitePath("file:./dev.db"), path.resolve("prisma/dev.db"));
  } finally {
    await db.$disconnect();
    if (oldEmail === undefined) delete process.env.ADMIN_EMAIL; else process.env.ADMIN_EMAIL = oldEmail;
    if (oldPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = oldPassword;
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("startup refuses legacy databases, pending migrations and incomplete bootstrap without changes", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ml-migration-guard-"));
  const file = path.join(dir, "legacy.db"), url = `file:${file}`;
  const db = new DatabaseSync(file);
  try {
    db.exec("CREATE TABLE User (id TEXT PRIMARY KEY); INSERT INTO User VALUES ('keep-me')");
    assert.throws(() => prepareDatabase(url), /no migration history/);
    assert.equal(db.prepare("SELECT id FROM User").get()!.id, "keep-me");
    db.exec("CREATE TABLE _prisma_migrations (migration_name TEXT, finished_at DATETIME, rolled_back_at DATETIME)");
    const before = fs.readFileSync(file);
    assert.throws(() => prepareDatabase(url), /migrations differ/);
    assert.deepEqual(fs.readFileSync(file), before);
    fs.writeFileSync(`${file}.bootstrap-pending`, "unfinished");
    assert.throws(() => prepareDatabase(url), /Incomplete initial setup/);
    assert.deepEqual(fs.readFileSync(file), before);
    assert.throws(() => sqlitePath("postgresql://invalid"), /SQLite/);
  } finally {
    db.close(); fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("a reviewed legacy database copy can be baselined without resetting or seeding its users", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ml-baseline-copy-"));
  const file = path.join(dir, "copy.db"), url = `file:${file}`;
  const db = new DatabaseSync(file);
  try {
    db.exec(fs.readFileSync("prisma/migrations/20261026000000_initial/migration.sql", "utf8"));
    db.exec("INSERT INTO User (id,email,passwordHash,role) VALUES ('legacy','legacy@example.invalid','keep-this-hash','ADMIN')");
    assert.throws(() => prepareDatabase(url), /no migration history/);
    const run = (args: string[]) => {
      const result = spawnSync(process.execPath, ["node_modules/prisma/build/index.js", ...args], { env: { ...process.env, DATABASE_URL: url }, encoding: "utf8" });
      assert.equal(result.status, 0, result.stdout + result.stderr);
    };
    run(["migrate", "diff", "--from-url", url, "--to-schema-datamodel", "prisma/schema.prisma", "--exit-code"]);
    run(["migrate", "resolve", "--applied", "20261026000000_initial"]);
    prepareDatabase(url);
    assert.equal(db.prepare("SELECT passwordHash FROM User WHERE id='legacy'").get()!.passwordHash, "keep-this-hash");
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM Course").get()!.n, 0, "startup must not seed an existing baseline");
  } finally {
    db.close(); fs.rmSync(dir, { recursive: true, force: true });
  }
});

test("lesson overrides survive reloads; bundled content remains visible and imports do not overwrite", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "ml-lessons-"));
  const old = process.env.LESSON_CONTENT_DIR;
  process.env.LESSON_CONTENT_DIR = path.join(dir, "overrides");
  try {
    const file = "gradient-descent.md", original = readLesson(file);
    writeLesson(file, "# Edited\nPersistentRegressionKeyword");
    clearContentCache();
    assert.equal(readLesson(file), "# Edited\nPersistentRegressionKeyword");
    assert.ok(getSearchDocs().find(d => d.slug === "gradient-descent")!.text.includes("PersistentRegressionKeyword"));
    assert.equal(fs.readFileSync(`content/lessons/${file}`, "utf8"), original);
    assert.ok(listLessonFiles().includes("linear-regression.md"));
    assert.throws(() => writeLesson("../outside.md", "escape"), /Invalid/);
    const backup = path.join(dir, "backup"); fs.mkdirSync(backup);
    fs.writeFileSync(path.join(backup, "legacy-edited.md"), "# Backed up edit");
    assert.equal(importLegacyLessons(backup), 1);
    assert.equal(importLegacyLessons(backup), 0);
    assert.equal(readLesson("legacy-edited.md"), "# Backed up edit");
    fs.writeFileSync(path.join(backup, "legacy-edited.md"), "Conflicting backup");
    assert.throws(() => importLegacyLessons(backup), /conflicts/);
    assert.equal(readLesson("legacy-edited.md"), "# Backed up edit");
  } finally {
    if (old === undefined) delete process.env.LESSON_CONTENT_DIR; else process.env.LESSON_CONTENT_DIR = old;
    clearContentCache(); fs.rmSync(dir, { recursive: true, force: true });
  }
});
