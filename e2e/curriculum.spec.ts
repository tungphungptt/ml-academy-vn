import { test, expect } from "@playwright/test";
import fs from "node:fs";
import { PrismaClient } from "@prisma/client";
import type { Catalog, Lesson } from "../src/lib/content";

const catalog = JSON.parse(fs.readFileSync("content/catalog.json", "utf8")) as Catalog;
const lessons = catalog.courses.flatMap(c => c.modules.flatMap(m => m.lessons as Lesson[]));

test("all 59 lessons render content, math, quiz, prerequisites and adjacent navigation", async ({ page, request }) => {
  test.setTimeout(180_000);
  for (const c of catalog.courses) {
    const route = await request.get(`/courses/${c.slug}`); expect(route.status()).toBe(200);
    const html = await route.text();
    for (const m of c.modules) for (const l of m.lessons as Lesson[]) expect(html).toContain(`/learn/${l.s}`);
  }
  expect(process.env.DATABASE_URL).toMatch(/^file:\/tmp\/ml-curriculum-e2e-/);
  await page.goto("/register");
  await page.getByLabel("Email").fill(`curriculum-${Date.now()}@example.invalid`);
  await page.getByLabel(/Mật khẩu/).fill("curriculum-browser-fixture-42");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page.getByRole("heading", { name: "Tiến độ của bạn" })).toBeVisible();
  for (const l of lessons) {
    const response = await page.goto(`/learn/${l.s}`); expect(response?.status(), l.s).toBe(200);
    await expect(page.getByRole("heading", { name: l.t, exact: true, level: 1 })).toBeVisible();
    await expect(page.locator("article.lesson")).toContainText("Đáp án và tiêu chí chấm");
    await expect(page.locator(".katex-error")).toHaveCount(0);
    const html = await page.content();
    for (const p of l.prerequisites!) expect(html, `${l.s} prerequisite ${p}`).toContain(`/learn/${p}`);
    const questions = JSON.parse(fs.readFileSync(`content/quizzes/${l.s}.json`, "utf8")) as { prompt: string; options: string[]; correct: number; explanation: string }[];
    const fields = page.locator("fieldset");
    await expect(fields).toHaveCount(questions.length);
    for (const [i, q] of questions.entries()) {
      await expect(fields.nth(i).locator("legend")).toContainText(q.prompt);
      for (const option of q.options) await expect(fields.nth(i).getByRole("radio", { name: option, exact: true })).toBeVisible();
      await fields.nth(i).getByRole("radio", { name: q.options[q.correct], exact: true }).check();
    }
    await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
    await expect(page.getByText(`Điểm: ${questions.length}/${questions.length}`, { exact: true })).toBeVisible();
    for (const [i, q] of questions.entries()) await expect(fields.nth(i)).toContainText(q.explanation);
    if (l.s === "cnn-cpu") {
      await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
      await page.reload();
      await expect(page.getByRole("button", { name: /Đã hoàn thành/ })).toBeVisible();
    }
  }
  await page.goto("/learn/linear-algebra-decompositions");
  await expect(page.getByRole("navigation", { name: "Kiến thức tiên quyết" })).toContainText("Vector và ma trận");
  const course = catalog.courses[0], ordered = course.modules.flatMap(m => m.lessons as Lesson[]), i = ordered.findIndex(l => l.s === "linear-algebra-decompositions");
  const pager = page.locator(".pager");
  await expect(pager.locator(`a[href='/learn/${ordered[i-1].s}']`)).toBeVisible();
  await expect(pager.locator(`a[href='/learn/${ordered[i+1].s}']`)).toBeVisible();
});

test("new chapters are searchable and course filters retain them", async ({ page }) => {
  await page.goto("/search?q=LDA");
  await expect(page.locator('a[href="/learn/lda"]').first()).toBeVisible();
  await page.goto("/courses?q=LDA&level=Intermediate");
  await expect(page.locator('a[href="/courses/ml-fundamentals"]')).toBeVisible();
  await page.goto("/courses/deep-learning");
  await expect(page.locator('a[href="/learn/cnn-cpu"]')).toBeVisible();
  await expect(page.locator('a[href="/learn/neural-recommendation"]')).toBeVisible();
});

test("lab deep links select a real CPU lab without a simulated Run button", async ({ page }) => {
  await page.goto("/lab?lab=cnn_cpu");
  await expect(page.getByLabel("Bài thực hành:")).toHaveValue("cnn_cpu");
  await expect(page.getByRole("button", { name: "▶ Run" })).toHaveCount(0);
  const download = page.getByRole("link", { name: "Download Notebook (.ipynb)" });
  const response = await page.request.get((await download.getAttribute("href"))!);
  expect(response.status()).toBe(200);
  const nb = await response.json(); expect(nb.cells.some((c: { execution_count?: number }) => c.execution_count === 1)).toBe(true);
  await page.goto("/lab?lab=softmax_regression");
  await expect(page.getByLabel("Bài thực hành:")).toHaveValue("softmax_regression");
  await expect(page.getByRole("button", { name: "▶ Run" })).toBeVisible();
});

test("hiding a course removes it from search and blocks direct lesson routes", async ({ request }) => {
  // Only run this fixture mutation against the explicitly isolated E2E database.
  expect(process.env.DATABASE_URL).toMatch(/\/tmp\/ml-curriculum-e2e-/);
  const db = new PrismaClient();
  const course = await db.course.findUniqueOrThrow({ where: { slug: "deep-learning" } });
  try {
    const registration = await request.post("/api/register", { data: { email: `hidden-quiz-${Date.now()}@example.invalid`, password: "hidden-quiz-fixture-42" } });
    expect(registration.status()).toBe(200);
    const lesson = await db.lesson.findUniqueOrThrow({ where: { slug: "cnn-cpu" }, include: { quiz: true } });
    const attempts = await db.quizAttempt.count();
    await db.course.update({ where: { id: course.id }, data: { published: false } });
    const hiddenQuiz = await request.post("/api/quiz", { data: { quizId: lesson.quiz!.id, answers: {} } });
    expect(hiddenQuiz.status()).toBe(404);
    expect(await hiddenQuiz.json()).not.toHaveProperty("results");
    const missingQuiz = await request.post("/api/quiz", { data: { quizId: "nonexistent-curriculum-fixture", answers: {} } });
    expect(missingQuiz.status()).toBe(404);
    expect(await db.quizAttempt.count()).toBe(attempts);
    const lessonResponse = await request.get("/learn/cnn-cpu");
    // Next app/loading.tsx streams a 200 shell before notFound resolves.
    expect([200, 404]).toContain(lessonResponse.status());
    const lessonHtml = await lessonResponse.text();
    expect(lessonHtml).toContain("Không tìm thấy trang");
    expect(lessonHtml).not.toContain("360 mẫu test");
    expect(lessonHtml).not.toContain("Đáp án và tiêu chí chấm");
    const search = await (await request.get("/search?q=CNN")).text();
    expect(search).not.toContain('href="/learn/cnn-cpu"');
    const courseResponse = await request.get("/courses/deep-learning");
    expect([200, 404]).toContain(courseResponse.status());
    const courseHtml = await courseResponse.text();
    expect(courseHtml).toContain("Không tìm thấy trang");
    expect(courseHtml).not.toContain('href="/learn/cnn-cpu"');
  } finally {
    await db.course.update({ where: { id: course.id }, data: { published: course.published } }); await db.$disconnect();
  }
});
