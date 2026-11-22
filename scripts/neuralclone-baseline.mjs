import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const directory = 'docs/screenshots/before';
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const report = [];
try {
  for (const [name, origin] of [['local', 'http://localhost:3000'], ['live', 'https://neuralclone.site']]) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    try {
      const response = await page.goto(origin, { waitUntil: 'networkidle', timeout: 30000 });
      report.push({ name, status: response.status(), title: await page.title(), heading: await page.locator('h1').allTextContents() });
      for (const width of [375, 768, 1440, 1920]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.screenshot({ path: `${directory}/${name}-${width}.png`, fullPage: true });
      }
    } catch (error) { report.push({ name, error: error.message }); }
    await page.close();
  }
} finally { await browser.close(); }
await writeFile('docs/neuralclone-baseline.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
