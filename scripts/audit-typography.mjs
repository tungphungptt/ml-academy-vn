import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const phase = process.argv.includes('--after') ? 'after' : 'before';
const option=(name,fallback)=>{const i=process.argv.indexOf(name);if(i<0)return fallback;if(!process.argv[i+1])throw new Error(`${name} requires a path`);return process.argv[i+1];};
const directory = option('--screenshots',`docs/screenshots/typography-${phase}`);
const reportPath=option('--report',`docs/neuralclone-typography-${phase}.json`);
await fs.mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const report = { phase, actual: [], specimens: [], errors: [] };
const samples = ['Bắt đầu từ điều bạn tò mò.', 'Học máy. Hiểu từ gốc.', 'Đường cong mất mát và tối ưu hóa.', 'Tiền xử lý dữ liệu.', 'Mạng nơ-ron nhân tạo.', 'Hồi quy tuyến tính và phân loại.', 'Khám phá trí tuệ nhân tạo.', 'Những điều cần biết trước khi bắt đầu.'];
try {
  for (const origin of ['http://localhost:3000', 'https://neuralclone.site']) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => report.errors.push(e.message));
    await page.goto(origin, { waitUntil: 'networkidle', timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    const session = await page.context().newCDPSession(page);
    await session.send('DOM.enable'); await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeIds } = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: 'main h1, main h2' });
    const fonts = [];
    for (const nodeId of nodeIds) fonts.push((await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts);
    const headings = await page.locator('main h1, main h2').evaluateAll(els => els.map(el => { const s = getComputedStyle(el), text = el.textContent; return { text, nfc: text === text.normalize('NFC'), codepoints: [...text].map(c => c.codePointAt(0).toString(16)), children: el.children.length, fontFamily: s.fontFamily, fontWeight: s.fontWeight, fontStyle: s.fontStyle, fontSize: s.fontSize, letterSpacing: s.letterSpacing, wordSpacing: s.wordSpacing, fontKerning: s.fontKerning, fontFeatureSettings: s.fontFeatureSettings, fontVariationSettings: s.fontVariationSettings }; }));
    report.actual.push({ origin, headings: headings.map((h, i) => ({ ...h, fonts: fonts[i] })) });
    await page.screenshot({ path: `${directory}/${origin.includes('localhost') ? 'local' : 'live'}-1440.png`, fullPage: true });
    await page.close();
  }
  for (const theme of ['light', 'dark']) for (const width of [375, 768, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, reducedMotion: 'reduce' });
    await page.addInitScript(t => localStorage.setItem('theme', t), theme);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const heading = page.getByRole('heading', { name: 'Bắt đầu từ điều bạn tò mò.', exact: true });
    await heading.screenshot({ path: `${directory}/heading-${theme}-${width}.png` });
    await page.screenshot({ path: `${directory}/home-${theme}-${width}.png`, fullPage: true });
    await page.evaluate(samples => {
      const main = document.querySelector('main'); main.replaceChildren();
      for (const size of [24, 36, 64]) for (const text of samples) for (const normalization of ['NFC', 'NFD']) {
        const p = document.createElement('p'); p.dataset.specimen = normalization; p.textContent = text.normalize(normalization);
        p.style.cssText = `font-family:var(--font-display);font-weight:600;font-size:${size}px;line-height:1.5;letter-spacing:-.04em;margin:16px 0`;
        main.append(p);
      }
    }, samples);
    await page.evaluate(() => document.fonts.ready);
    const session = await page.context().newCDPSession(page);
    await session.send('DOM.enable'); await session.send('CSS.enable');
    const { root } = await session.send('DOM.getDocument');
    const { nodeIds } = await session.send('DOM.querySelectorAll', { nodeId: root.nodeId, selector: '[data-specimen]' });
    const fonts = [];
    for (const nodeId of nodeIds) fonts.push((await session.send('CSS.getPlatformFontsForNode', { nodeId })).fonts);
    const metrics = await page.locator('[data-specimen]').evaluateAll(els => els.map(el => ({ text: el.textContent, normalization: el.dataset.specimen, width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height, size: getComputedStyle(el).fontSize })));
    report.specimens.push({ theme, width, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), metrics: metrics.map((m, i) => ({ ...m, fonts: fonts[i] })) });
    await page.locator('main').screenshot({ path: `${directory}/specimen-${theme}-${width}.png` });
    await page.close();
  }
} finally { await browser.close(); }
await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ phase, actual: report.actual.map(a => ({ origin: a.origin, headings: a.headings.map(h => ({ text: h.text, nfc: h.nfc, family: h.fontFamily, fonts: h.fonts })) })), mixedFontSpecimens: report.specimens.flatMap(s => s.metrics.filter(m => new Set(m.fonts.map(f => f.familyName)).size !== 1)).length, overflowScreens: report.specimens.filter(s => s.overflow).length, errors: report.errors }, null, 2));
