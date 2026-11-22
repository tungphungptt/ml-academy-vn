import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { hashToken } from "../src/lib/resetToken";

function fixtureOnly() {
  expect(process.env.DATABASE_URL).toMatch(/^file:.*[/\\]ml-curriculum-e2e-[^/\\]+[/\\][^/\\]+\.db$/);
}
test("anonymous and cross-origin writes cannot reach private/admin operations", async ({ request }) => {
  for (const endpoint of ["course", "module", "lesson", "question", "resource", "dataset", "move", "reset-link"]) {
    expect((await request.post(`/api/admin/${endpoint}`, { data: {} })).status()).toBe(403);
  }
  expect((await request.put('/api/admin/content', { data: { file: '../escape.md', text: 'fixture' } })).status()).toBe(403);
  for (const endpoint of ["progress", "bookmark", "note", "quiz", "time"]) expect((await request.post(`/api/${endpoint}`, { data: {} })).status()).toBe(401);
  expect((await request.post('/api/register', { headers: { origin: 'https://untrusted.example' }, data: { email: 'blocked@example.invalid', password: 'fixture-password-42' } })).status()).toBe(403);
});
test("password reset is consumed atomically and revokes an existing session", async ({ request }) => {
  fixtureOnly();
  const db = new PrismaClient();
  try {
    const email = `reset-${Date.now()}@example.invalid`, password = 'original-fixture-password-42';
    const user = await db.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
    expect((await request.post('/api/login', { data: { email, password } })).ok()).toBe(true);
    const token = randomBytes(32).toString('hex');
    await db.passwordReset.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60000) } });
    const results = await Promise.all([1, 2].map(() => request.post('/api/reset', { data: { token, next: 'replacement-fixture-password-42' } })));
    expect(results.map(r => r.status()).sort()).toEqual([200, 400]);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).tokenVersion).toBe(1);
    expect((await request.post('/api/progress', { data: { lessonId: 'fixture', done: true } })).status()).toBe(401);
  } finally { await db.$disconnect(); }
});
test("nonexistent and unpublished lessons reject progress/bookmark/note writes", async ({ request }) => {
  fixtureOnly();
  const db = new PrismaClient();
  const course = await db.course.findUniqueOrThrow({ where: { slug: 'deep-learning' } });
  try {
    const email = `access-${Date.now()}@example.invalid`, password = 'access-fixture-password-42';
    await db.user.create({ data: { email, passwordHash: await bcrypt.hash(password, 12) } });
    expect((await request.post('/api/login', { data: { email, password } })).ok()).toBe(true);
    const lesson = await db.lesson.findUniqueOrThrow({ where: { slug: 'cnn-cpu' } });
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    for (const lessonId of ['nonexistent-fixture', lesson.id]) {
      for (const [endpoint, data] of [['progress', { done: true }], ['bookmark', { on: true }], ['note', { body: 'fixture note' }]] as const) {
        expect((await request.post(`/api/${endpoint}`, { data: { lessonId, ...data } })).status()).toBe(404);
      }
    }
  } finally { await db.course.update({ where: { id: course.id }, data: { published: course.published } }); await db.$disconnect(); }
});
