import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const screens = [
  ["home", "/", "Học máy."], ["courses", "/courses", "Khóa học"],
  ["course", "/courses/ml-fundamentals", "Track B: Machine Learning căn bản"],
  ["lesson", "/learn/linear-regression", "Linear Regression"],
  ["lab", "/lab?lab=linear_regression", "Code Lab"], ["lab-cpu", "/lab?lab=cnn_cpu", "Code Lab"],
  ["search", "/search?q=dao+ham", "Tìm bài học"], ["search-empty", "/search?q=zzzznomatchfixture", "Tìm bài học"],
  ["projects", "/projects", "Dự án thực hành"], ["datasets", "/datasets", "Thư viện dữ liệu"],
  ["resources", "/resources", "Tài liệu tham khảo"], ["playground", "/playground", "Playground thuật toán"],
  ["login", "/login", "Đăng nhập"], ["register", "/register", "Đăng ký"],
  ["reset", "/reset", "Đặt lại mật khẩu"], ["admin-blocked", "/admin", "Không tìm thấy trang"], ["not-found", "/missing-ui-fixture", "Không tìm thấy trang"],
] as const;
const output = process.env.UI_SCREENSHOT_DIR;
const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
async function noOverflow(page: Page, name: string) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), name).toBe(true);
}

test("PCA projection connectors stay visible and axis labels match actual theme colors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/playground#pca");
  const demo = page.locator("#pca");
  await demo.getByRole("checkbox").check();
  for (const theme of ["light", "dark"]) {
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    const connectors = demo.locator('svg g line');
    await expect(connectors).toHaveCount(60);
    const strokes = await connectors.evaluateAll(lines => lines.map(line => ({ color: getComputedStyle(line).stroke, opacity: getComputedStyle(line).strokeOpacity })));
    expect(strokes.every(s => s.color !== "none" && s.opacity === "0.4")).toBe(true);
    const axes = await demo.locator('svg > line').evaluateAll(lines => lines.slice(-2).map(line => getComputedStyle(line).stroke));
    const labels = await demo.locator('.plot-legend span').evaluateAll(spans => spans.map(span => getComputedStyle(span).color));
    expect(axes).toEqual(labels);
    await noOverflow(page, `PCA projections/${theme}`);
    if (output) await demo.screenshot({ path: `${output}/pca-projections-${theme}.png` });
  }
});

test("all main screens have usable geometry, headings, and contrast across both themes and four widths", async ({ browser }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  for (const theme of ["light", "dark"] as const) for (const width of [375, 390, 768, 1440]) {
    const context = await browser.newContext({ baseURL, viewport: { width, height: 1000 }, colorScheme: theme, reducedMotion: "reduce" });
    await context.addInitScript(t => localStorage.setItem("theme", t), theme);
    const page = await context.newPage();
    page.on("pageerror", e => errors.push(`${theme}/${width}: ${e.message}`));
    page.on("console", m => { if (m.type() === "error" && /hydrat|server.*HTML/i.test(m.text())) errors.push(m.text()); });
    for (const [name, url, title] of screens) {
      await page.goto(url);
      await expect(page.locator("main h1")).toHaveCount(1);
      await expect(page.locator("main h1")).toContainText(title);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
      await noOverflow(page, `${name}/${theme}/${width}`);
      await expect(page.locator(".katex-error")).toHaveCount(0);
      expect(await page.locator("img:not([alt])").count()).toBe(0);
      const issues = await page.locator("main button,main input:not([type=hidden]),main select,main textarea").evaluateAll(els => els.filter(el => {
        const rect = el.getBoundingClientRect(), style = getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
      }).map(el => el.outerHTML.slice(0, 140)));
      expect(issues, `${name}: controls outside viewport`).toEqual([]);
      if (output) {
        fs.mkdirSync(output, { recursive: true });
        await page.screenshot({ path: `${output}/${name}-${theme}-${width}.png` });
      }
    }
    await page.goto("/courses"); await expect(page.locator(".course-card").first()).toBeVisible();
    const ratios = await page.evaluate(() => {
      const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d")!;
      function lum(color: string) {
        ctx.clearRect(0, 0, 1, 1); ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1);
        const channels = [...ctx.getImageData(0, 0, 1, 1).data].slice(0, 3).map(v => { const s = v/255; return s <= .04045 ? s/12.92 : ((s+.055)/1.055)**2.4; });
        return .2126*channels[0]+.7152*channels[1]+.0722*channels[2];
      }
      function ratio(a: string, b: string) { const x = lum(a), y = lum(b); return (Math.max(x, y)+.05)/(Math.min(x, y)+.05); }
      const body = getComputedStyle(document.body), muted = getComputedStyle(document.querySelector(".page-description")!), primary = getComputedStyle(document.querySelector("main .primary")!), input = getComputedStyle(document.querySelector('main input[name="q"]')!), badge = getComputedStyle(document.querySelector("main .badge")!);
      return { body: ratio(body.color, body.backgroundColor), muted: ratio(muted.color, body.backgroundColor), primary: ratio(primary.color, primary.backgroundColor), badge: ratio(badge.color, badge.backgroundColor), inputBorder: ratio(input.borderTopColor, input.backgroundColor) };
    });
    for (const [key, value] of Object.entries(ratios)) expect(value, `${theme}/${width}/${key}`).toBeGreaterThanOrEqual(key === "inputBorder" ? 3 : 4.5);
    await context.close();
  }
  expect(errors).toEqual([]);
});

test("keyboard navigation, mobile menu, TOC and reading focus remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/learn/linear-regression"); await expect(page.locator("main h1")).toBeVisible();
  await page.keyboard.press("Tab"); await expect(page.getByRole("link", { name: "Bỏ qua điều hướng" })).toBeFocused();
  await page.keyboard.press("Enter"); await expect(page.locator("main")).toBeFocused();
  const menu = page.getByRole("button", { name: "Mở hoặc đóng menu" });
  await menu.focus(); await page.keyboard.press("Enter"); await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape"); await expect(menu).toHaveAttribute("aria-expanded", "false"); await expect(menu).toBeFocused();
  await menu.click(); await page.getByRole("navigation", { name: "Điều hướng chính" }).getByRole("link", { name: "Lộ trình", exact: true }).click();
  await expect(page.locator("main h1")).toHaveText("Khóa học");
  await expect(page.getByRole("button", { name: "Mở hoặc đóng menu" })).toHaveAttribute("aria-expanded", "false");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/learn/linear-regression");
  const toc = page.getByRole("navigation", { name: "Mục lục", exact: true });
  await toc.getByRole("link", { name: "Mô hình và công thức", exact: true }).click();
  await expect(page).toHaveURL(/#mo-hinh-va-cong-thuc$/);
  await expect(toc.locator('a[aria-current="location"]')).toHaveAttribute("href", "#mo-hinh-va-cong-thuc");
  await page.getByRole("button", { name: "Chế độ đọc tập trung", exact: true }).click();
  await expect(page.locator(".site-header")).toBeHidden(); await expect(page.locator(".lesson-toc")).toBeHidden();
  await noOverflow(page, "reading focus");
  await page.getByRole("button", { name: "Thoát chế độ đọc tập trung", exact: true }).click();
  await expect(page.locator(".site-header")).toBeVisible();
});

test("quiz pending/error/retry, notes, progress and dashboard use persisted user data", async ({ page, context }) => {
  expect(process.env.DATABASE_URL).toMatch(/^file:\/tmp\/ml-curriculum-e2e-/);
  const registration = await page.request.post("/api/register", { data: { email: `ui-${Date.now()}@example.invalid`, password: "ui-browser-fixture-password-42" } });
  expect(registration.ok()).toBe(true);
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto("/"); await expect(page.locator("main h1")).toHaveText("Tiến độ của bạn");
  await expect(page.locator(".metric-strip b").first()).toHaveText("0");
  await page.goto("/learn/linear-regression");
  const fields = page.locator("fieldset"); await expect(fields).toHaveCount(2);
  await expect(page.getByText("Đáp án đúng", { exact: true })).toHaveCount(0);
  await fields.nth(0).locator('label[data-option-index="0"]').getByRole("radio").check();
  await fields.nth(1).locator('label[data-option-index="1"]').getByRole("radio").check();
  await noOverflow(page, "selected quiz on mobile");
  await page.route("**/api/quiz", route => route.abort("failed"));
  await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
  await expect(page.locator(".quiz-panel").getByRole("alert")).toContainText("Chưa kết nối được");
  await expect(fields.nth(0).locator('label[data-option-index="0"] input')).toBeChecked();
  await expect(page.getByText("Điểm:", { exact: false })).toHaveCount(0);
  await page.unroute("**/api/quiz");
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route("**/api/quiz", async route => { await gate; await route.continue(); });
  try {
    await page.getByRole("button", { name: "Nộp bài", exact: true }).click();
    await expect(page.getByRole("button", { name: "Đang kiểm tra…" })).toBeDisabled();
    await expect(fields.first()).toHaveAttribute("disabled", "");
    for (const radio of await page.getByRole("radio").all()) await expect(radio).toBeDisabled();
    await expect(page.getByText("Đáp án đúng", { exact: true })).toHaveCount(0);
  } finally { release(); }
  await expect(page.getByText("Điểm: 1/2", { exact: true })).toBeVisible();
  await expect(fields.first().locator(".quiz-feedback")).toContainText("Chưa đúng");
  await expect(fields.first().locator(".opt.right .katex-html")).toBeVisible();
  await noOverflow(page, "graded quiz on mobile");
  if (output) {
    await page.locator(".quiz-panel").evaluate(el => el.scrollIntoView({ block: "start" }));
    await page.screenshot({ path: `${output}/quiz-result-mobile.png` });
  }
  await page.getByRole("button", { name: "Đánh dấu hoàn thành" }).click();
  await expect(page.getByRole("button", { name: /Đã hoàn thành/ })).toBeVisible();
  await page.getByLabel("Ghi chú mới").fill("Ghi chú kiểm thử UI: giữ quy ước MSE mean.");
  await page.getByRole("button", { name: "Lưu ghi chú" }).click();
  await expect(page.locator(".notes-list")).toContainText("giữ quy ước MSE mean");
  await page.getByRole("button", { name: "Bookmark bài này", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Đã đánh dấu bài này" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".notes-list")).toContainText("giữ quy ước MSE mean");
  await expect(page.getByRole("button", { name: /Đã hoàn thành/ })).toBeVisible();
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  const copy = page.locator("article .codeblock").first();
  await copy.getByRole("button", { name: "Sao chép code" }).click();
  await expect(copy.getByRole("button")).toContainText("Đã chép");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("def mse(w, b)");
  await page.goto("/");
  await expect(page.locator(".metric-strip b").first()).toHaveText("1");
  await expect(page.locator(".recent-list")).toContainText("Linear Regression");
  await expect(page.locator(".recent-list")).toContainText("1/2");
  for (const theme of ["light", "dark"]) {
    await page.evaluate(t => { localStorage.setItem("theme", t); document.documentElement.dataset.theme = t; }, theme);
    for (const width of [375, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await noOverflow(page, `persisted dashboard/${theme}/${width}`);
      await expect(page.locator(".metric-strip b").first()).toHaveText("1");
      if (output) await page.screenshot({ path: `${output}/dashboard-filled-${theme}-${width}.png` });
    }
  }
});

test("lab editing/focus/reset, CPU instructions and search resource links stay honest", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 1000 });
  await page.goto("/lab?lab=linear_regression");
  const editor = page.getByLabel("Code Python"), original = await editor.inputValue();
  await editor.focus();
  expect(await page.locator(".code-editor").evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe("none");
  await editor.fill('print("local edit $x_i$ {value}")');
  await page.getByRole("button", { name: "Reset Code", exact: true }).click();
  await expect(editor).toHaveValue(original);
  await expect(page.getByText("Hoàn tất.", { exact: true })).toHaveCount(0);
  await page.goto("/lab?lab=cnn_cpu");
  await expect(page.getByRole("button", { name: "▶ Run" })).toHaveCount(0);
  await expect(page.locator(".lab-guide")).toBeVisible();
  await expect(page.getByRole("link", { name: "Download Notebook (.ipynb)" })).toHaveAttribute("href", "/notebooks/cnn_cpu_library.ipynb");
  await page.goto("/search?q=linear+regression");
  const hit = page.locator(".search-result").filter({ has: page.locator('h2 a[href="/learn/linear-regression"]') });
  await expect(hit.locator("mark").first()).toBeVisible();
  await expect(hit.getByRole("link", { name: "Quiz trong bài" })).toHaveAttribute("href", "/learn/linear-regression#quiz");
  await expect(hit.getByRole("link", { name: "Code Lab: Linear Regression", exact: true })).toHaveAttribute("href", "/lab?lab=linear_regression");
  await expect(hit.getByRole("link", { name: "Notebook: Linear Regression", exact: true })).toHaveAttribute("href", "/notebooks/linear_regression_scratch.ipynb");
  await noOverflow(page, "search with resources");
  await hit.getByRole("link", { name: "Quiz trong bài" }).click();
  await expect(page).toHaveURL(/\/learn\/linear-regression#quiz$/);
  await expect(page.locator("#quiz").getByRole("heading", { name: "Quiz", exact: true })).toBeVisible();
  await expect(page.locator("#quiz").getByRole("link", { name: "Đăng nhập", exact: true })).toBeVisible();
});
