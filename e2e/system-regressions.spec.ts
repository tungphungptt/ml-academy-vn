import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { createSessionFixture } from './fixtures';
import { hashToken } from '../src/lib/resetToken';

test('repeated search/filter parameters render instead of throwing a server error', async ({ page }) => {
  for (const route of ['/search', '/courses', '/datasets', '/projects', '/resources']) {
    const response = await page.goto(`${route}?q=ai&q=ml&level=Beginner&level=Advanced`);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator('input[name="q"]')).toHaveValue('ai');
  }
  expect((await page.goto('/lab?lab=rag_retrieval&lab=unknown'))?.status()).toBe(200);
  expect((await page.goto('/reset?token=invalid&token=invalid'))?.status()).toBe(200);
});

test('admin editor binds drafts to filenames and recovers from a failed save', async ({ page, context }) => {
  const fixture = await createSessionFixture(context, 'editor', 'editor-fixture-password-42');
  const db = new PrismaClient();
  const override = path.join(process.env.LESSON_CONTENT_DIR!, 'linear-regression.md');
  try {
    await db.user.update({ where: { email: fixture.email }, data: { role: 'ADMIN' } });
    await page.goto('/admin');
    const file = page.getByRole('combobox', { name: 'Tên file', exact: true });
    const body = page.getByRole('textbox', { name: 'Nội dung Markdown' });
    const save = page.getByRole('button', { name: 'Lưu', exact: true });
    await file.fill('linear-regression.md');
    await page.getByRole('button', { name: 'Tải', exact: true }).click();
    await expect(body).toBeEnabled();
    const original = await body.inputValue();
    const marker = 'SystemAuditOverlayMarker';
    await body.fill(`${original}\n\n${marker}`);
    await file.fill('probability.md');
    await expect(save).toBeDisabled();
    await expect(body).toBeDisabled();
    await file.fill('linear-regression.md');
    await expect(body).toHaveValue(`${original}\n\n${marker}`);
    await page.route('**/api/admin/content', route => route.abort(), { times: 1 });
    await save.click();
    await expect(page.getByText('Không kết nối được. Nội dung đang soạn vẫn được giữ lại.')).toBeVisible();
    await expect(save).toBeEnabled();
    await save.click();
    await expect(page.getByText('Đã lưu bài học.', { exact: true })).toBeVisible();
    await page.goto('/learn/linear-regression');
    await expect(page.locator('article.lesson')).toContainText(marker);
    await page.goto(`/search?q=${marker}`);
    await expect(page.locator('.search-result h2 a')).toHaveAttribute('href', '/learn/linear-regression');
    fs.unlinkSync(override);
    await page.goto(`/search?q=${marker}`);
    await expect(page.locator('.search-result')).toHaveCount(0);
  } finally {
    fs.rmSync(override, { force: true });
    await db.$disconnect();
  }
});

test('new quiz questions append after gaps and hidden courses stay off the dashboard', async ({ page, context }) => {
  const fixture = await createSessionFixture(context, 'order', 'order-fixture-password-42');
  const db = new PrismaClient();
  let moduleId: string | undefined;
  const course = await db.course.findUniqueOrThrow({ where: { slug: 'deep-learning' } });
  try {
    const user = await db.user.update({ where: { email: fixture.email }, data: { role: 'ADMIN' } });
    const module = await db.module.create({ data: { courseId: course.id, title: 'Audit fixture', order: 999 } });
    moduleId = module.id;
    const lesson = await db.lesson.create({ data: { moduleId, slug: `audit-${Date.now()}`, title: 'HiddenAuditLesson', level: 'Beginner', minutes: 5, order: 0, contentFile: 'ml-intro.md' } });
    const quiz = await db.quiz.create({ data: { lessonId: lesson.id, questions: { create: [0, 2].map(order => ({ order, prompt: `Question ${order}`, optionsJson: '["A","B"]', correctIndex: 0, explanation: 'Fixture' })) } } });
    const response = await context.request.post('/api/admin/question', { data: { lessonId: lesson.id, prompt: 'New question', options: ['A', 'B'], correct: 0, explanation: 'Fixture' } });
    expect(response.ok()).toBe(true);
    expect((await response.json()).order).toBe(3);
    await db.lessonProgress.create({ data: { userId: user.id, lessonId: lesson.id } });
    await db.studyTime.create({ data: { userId: user.id, lessonId: lesson.id, seconds: 120 } });
    await db.quizAttempt.create({ data: { userId: user.id, quizId: quiz.id, score: 1, total: 2 } });
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    await page.goto('/');
    await expect(page.locator('.metric-strip b')).toHaveText(['0', '0', '0']);
    await expect(page.locator('.recent-list')).toHaveCount(0);
  } finally {
    await db.course.update({ where: { id: course.id }, data: { published: course.published } });
    if (moduleId) await db.module.delete({ where: { id: moduleId } });
    await db.$disconnect();
  }
});

test('changing a password invalidates previously issued reset links', async ({ context }) => {
  const password = 'current-fixture-password-42';
  const fixture = await createSessionFixture(context, 'password', password);
  const db = new PrismaClient();
  try {
    const user = await db.user.findUniqueOrThrow({ where: { email: fixture.email } });
    const token = randomBytes(32).toString('hex');
    await db.passwordReset.create({ data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60000) } });
    expect((await context.request.post('/api/account/password', { data: { current: password, next: 'changed-fixture-password-42' } })).status()).toBe(200);
    expect((await context.request.post('/api/reset', { data: { token, next: 'stale-link-password-42' } })).status()).toBe(400);
    expect((await db.user.findUniqueOrThrow({ where: { id: user.id } })).tokenVersion).toBe(1);
    expect((await context.request.get('/account')).status()).toBe(200);
  } finally { await db.$disconnect(); }
});
