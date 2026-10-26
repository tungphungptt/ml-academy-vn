import { test, expect } from "@playwright/test";
import fs from "node:fs";

const routes = ["linear-regression", "gradient-descent", "backpropagation", "pca", "svm", "transformer-architecture", "loss-functions", "activations"];
const output = process.env.MATH_SCREENSHOT_DIR;
test("real lesson equations render visually and semantically in light/dark on desktop/mobile", async ({ page }) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && /hydrat|server.*HTML/i.test(m.text())) errors.push(m.text()); });
  for (const theme of ["light", "dark"]) for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await page.addInitScript(t => localStorage.setItem("theme", t), theme);
    for (const slug of routes) {
      await page.goto(`/learn/${slug}`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".page")).toHaveCSS("opacity", "1");
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await expect(page.locator(".katex-error")).toHaveCount(0);
      const displays = page.locator("article .katex-display");
      expect(await displays.count(), slug).toBeGreaterThan(0);
      await expect(displays.first().locator(".katex-html")).toBeVisible();
      expect(await displays.first().locator(".katex-html").evaluate(el => el.getBoundingClientRect().width)).toBeGreaterThan(20);
      expect(await page.locator("article math").count()).toBeGreaterThan(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${slug}/${theme}/${width}`).toBe(true);
      const dims = await displays.evaluateAll(els => els.map(el => ({ scroll: el.scrollWidth, client: el.clientWidth })));
      for (const d of dims) expect(d.client).toBeLessThan(width);
      if (slug === "activations" && width === 375) {
        expect(dims[0].scroll).toBeGreaterThan(dims[0].client);
        expect(await displays.first().evaluate(el => { el.scrollLeft = el.scrollWidth; return el.scrollLeft; })).toBeGreaterThan(0);
        await displays.first().evaluate(el => { el.scrollLeft = 0; });
      }
      if (output && ((width === 375 && theme === "dark") || (width === 1440 && theme === "light"))) {
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: `${output}/${slug}-${theme}-${width}.png`, fullPage: true });
      }
    }
  }
  expect(errors).toEqual([]);
});

test("math reaches quiz answers and lab descriptions without breaking code or navigation", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  page.on("console", m => { if (m.type() === "error" && /hydrat|server.*HTML/i.test(m.text())) errors.push(m.text()); });
  await page.goto("/register");
  await page.getByLabel("Email").fill(`math-${Date.now()}@example.invalid`);
  await page.getByLabel(/Mật khẩu/).fill("math-browser-fixture-42");
  await page.getByRole("button", { name: "Tạo tài khoản" }).click();
  await expect(page.getByRole("heading", { name: "Tiến độ của bạn" })).toBeVisible();
  await page.goto("/learn/linear-regression");
  const fields = page.locator("fieldset");
  await expect(fields.nth(1).locator("legend .katex-html")).toBeVisible();
  await fields.nth(0).locator('label[data-option-index="1"]').getByRole("radio").check();
  await fields.nth(1).locator('label[data-option-index="1"]').getByRole("radio").check();
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(fields.nth(0).locator("p .katex-html")).toBeVisible();
  await expect(page.getByText("Điểm: 2/2", { exact: true })).toBeVisible();
  const code = page.locator("article .codeblock pre");
  await expect(code).toContainText("mse(w+h,b)");
  await expect(code.locator(".katex")).toHaveCount(0);
  await expect(page.getByRole("complementary", { name: "Thực hành liên quan" }).getByRole("link")).toHaveAttribute("href", "/lab?lab=linear_regression");
  await page.goto("/lab?lab=linear_regression");
  await expect(page.locator(".lab-description .katex-html")).toHaveCount(3);
  await expect(page.locator('a[href="/learn/linear-regression"]').first()).toBeVisible();
  await page.goto("/search?q=dao+ham&tier=Core&kind=lesson");
  await expect(page.locator('a[href="/learn/derivatives"]').first()).toBeVisible();
  await page.goto("/courses?q=dai+so");
  await expect(page.locator('a[href="/courses/python-math"]')).toBeVisible();
  expect(errors).toEqual([]);
});
