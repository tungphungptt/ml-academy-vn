import type { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import { seedExtra } from "./seed-extra";
import type { Catalog } from "../src/lib/content";

type AdminCredentials = { email?: string; password?: string };
export async function seedDatabase(db: PrismaClient, admin: AdminCredentials = {}, catalog: Catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8"))) {
  if (Boolean(admin.email) !== Boolean(admin.password)) throw new Error("Set both ADMIN_EMAIL and ADMIN_PASSWORD, or neither");
  if (admin.password && admin.password.length < 12) throw new Error("New admin passwords require at least 12 characters");
  await db.$transaction(tx => seedCatalog(tx, admin, catalog), { timeout: 60_000 });
}

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
type Q = { prompt: string; options: string[]; correct: number; explanation: string };
async function seedCatalog(db: Prisma.TransactionClient, admin: AdminCredentials, cat: Catalog) {
  let ci = 0;
  for (const c of cat.courses) {
    const course = await db.course.upsert({ where: { slug: c.slug }, update: {}, create: { slug: c.slug, title: c.title, description: c.description, level: c.level, order: ci++ } });
    const modules = await db.module.findMany({ where: { courseId: course.id }, orderBy: { order: "asc" }, include: { lessons: true } });
    let nextModuleOrder = Math.max(-1, ...modules.map(m => m.order)) + 1;
    for (const m of c.modules) {
      const slugs = new Set(m.lessons.map(l => typeof l === "string" ? slugify(l) : l.s));
      const managedId = `catalog:${c.slug}:${m.key ?? slugify(m.title)}`;
      // Existing lesson anchors also survive an admin renaming a module.
      const anchored = modules.map(mod => ({ mod, n: mod.lessons.filter(l => slugs.has(l.slug)).length })).sort((a, b) => b.n - a.n);
      const mod = modules.find(mod => mod.id === managedId) ?? anchored.find(x => x.n > 0)?.mod ?? modules.find(mod => mod.title === m.title)
        ?? await db.module.create({ data: { id: managedId, courseId: course.id, title: m.title, order: nextModuleOrder++ } });
      const last = await db.lesson.aggregate({ where: { moduleId: mod.id }, _max: { order: true } });
      let li = (last._max.order ?? -1) + 1;
      for (const l of m.lessons) {
        const t = typeof l === "string" ? l : l.t, slug = typeof l === "string" ? slugify(t) : l.s;
        if (await db.lesson.findUnique({ where: { slug } })) continue;
        const lesson = await db.lesson.create({ data: { slug, moduleId: mod.id, title: t, level: typeof l === "string" ? c.level : l.level ?? c.level, minutes: typeof l === "string" ? 30 : l.minutes ?? 30, order: li++, contentFile: typeof l === "string" ? null : l.f } });
        if (typeof l === "string") continue;
        for (const s of l.src ?? []) await db.sourceReference.create({ data: { lessonId: lesson.id, title: s.title, url: s.url } });
        const qf = `content/quizzes/${slug}.json`;
        if (fs.existsSync(qf)) {
          const qs: Q[] = JSON.parse(fs.readFileSync(qf, "utf8"));
          const quiz = await db.quiz.create({ data: { lessonId: lesson.id } });
          let o = 0; for (const q of qs) await db.quizQuestion.create({ data: { quizId: quiz.id, order: o++, prompt: q.prompt, optionsJson: JSON.stringify(q.options), correctIndex: q.correct, explanation: q.explanation } });
        }
      }
    }
  }
  await seedExtra(db);
  const email = admin.email, pw = admin.password;
  if (email && pw && !(await db.user.findUnique({ where: { email } }))) await db.user.create({ data: { email, passwordHash: await bcrypt.hash(pw, 12), role: "ADMIN" } });
}
