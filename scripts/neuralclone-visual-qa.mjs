import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const origin = process.env.E2E_BASE_URL || 'http://localhost:3000';
const directory = process.env.UI_SCREENSHOT_DIR || 'docs/screenshots/after';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const results = [], errors = [], consoleErrors = [], failedResponses = [];
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) failedResponses.push({ url: response.url(), status: response.status() }); });
  for (const width of [375, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const [name, route] of [['home', '/'], ['playground', '/playground#pca'], ['lab', '/lab'], ['courses', '/courses']]) {
      const response = await page.goto(`${origin}${route}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => Promise.all([...document.images].map(async img => { img.loading = 'eager'; try { await img.decode(); } catch {} })));
      const info = await page.evaluate(() => ({ title: document.title, h1: document.querySelector('h1')?.textContent, theme: document.documentElement.dataset.theme, overflow: document.documentElement.scrollWidth > innerWidth + 1, bodyFont: getComputedStyle(document.body).fontFamily, headingFont: getComputedStyle(document.querySelector('h1')).fontFamily, fontReady: document.fonts.check('600 32px "Be Vietnam Pro"', 'Học máy Hiểu từ gốc Đường cong mất mát Trí tuệ nhân tạo Dữ liệu Lộ trình học Những điều cần biết'), brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src) }));
      results.push({ name, width, status: response.status(), ...info });
      await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
    }
  }
  // Raster export of our original SVG, suitable for social crawlers.
  await page.setViewportSize({ width: 1200, height: 630 });
  await page.goto(`${origin}/social-preview.svg`);
  await page.screenshot({ path: 'public/social-preview.png' });
} finally { await browser.close(); }
await writeFile(`${directory}/report.json`, JSON.stringify({ origin, results, errors, consoleErrors, failedResponses }, null, 2));
console.log(JSON.stringify({ pages: results.length, issues: results.filter(r => r.overflow || !r.fontReady || r.brokenImages.length), errors, consoleErrors: [...new Set(consoleErrors)], failedResponses }, null, 2));
if (results.some(r => r.overflow || !r.fontReady || r.brokenImages.length) || errors.length || consoleErrors.some(e => /hydrat/i.test(e))) process.exitCode = 1;
