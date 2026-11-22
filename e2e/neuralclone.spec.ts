import { test, expect } from '@playwright/test';

test('NeuralClone identity, canonical and social metadata are specific to each public page', async ({ page, request }) => {
  for (const route of ['/', '/courses', '/projects', '/datasets', '/resources', '/playground', '/lab', '/learn/pca']) {
    await page.goto(route);
    await expect(page).toHaveTitle(/\| NeuralClone$/);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(new URL(canonical!).href).toBe(new URL(route, 'https://neuralclone.site').href);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://neuralclone.site/social-preview.png');
    await expect(page.locator('body')).not.toContainText(/ML Academy|ML ACADEMY/);
  }
  expect((await request.get('/social-preview.png')).headers()['content-type']).toContain('image/png');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('https://neuralclone.site/learn/pca');
  expect(sitemap).not.toContain('/account');
  await page.goto('/reset');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
});
test('hero experiment computes real learning updates without hydration errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error' && /hydrat/i.test(m.text())) errors.push(m.text()); });
  await page.goto('/');
  const slider = page.getByLabel('Số bước học');
  await slider.fill('0');
  const initial = Number(await page.locator('.experiment-results strong').innerText());
  await slider.fill('240');
  await expect(page.locator('.experiment-controls output')).toHaveText('240');
  const final = Number(await page.locator('.experiment-results strong').innerText());
  expect(final).toBeLessThan(initial / 20);
  await slider.focus(); await page.keyboard.press('ArrowLeft');
  await expect(page.locator('.experiment-controls output')).toHaveText('230');
  expect(errors).toEqual([]);
});
test('all six lazy-loaded experiments respond to parameters and retain deep links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/playground');
  for (const id of ['linreg', 'knn', 'kmeans', 'tree', 'pca', 'nn']) {
    await page.locator(`.playground-nav a[href="#${id}"]`).click();
    const demo = page.locator(`#${id}`);
    await expect(demo.getByRole('heading', { level: 2 })).toBeVisible();
    await expect(page.locator('.demo')).toHaveCount(1);
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    const slider = demo.getByRole('slider').first();
    await slider.focus(); await page.keyboard.press('ArrowRight');
    if (id === 'kmeans') { await demo.getByRole('button', { name: 'Chạy 1 bước' }).click(); await expect(demo).toContainText('Bước 1'); }
    if (id === 'pca') await demo.getByRole('checkbox').check();
    await expect(demo).not.toHaveAttribute('aria-busy', 'true');
    expect(await demo.locator('svg').evaluateAll(svgs => svgs.every(svg => !/NaN|Infinity/.test(svg.outerHTML)))).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.reload(); await expect(page.locator('#nn h2')).toBeVisible();
  expect(errors).toEqual([]);
});
test('library filters and project dataset links lead to matching content and useful empty states', async ({ page }) => {
  for (const [route, card, placeholder] of [['/datasets', '.data-card', 'Tên dataset hoặc nội dung dữ liệu'], ['/projects', '.project-card', 'Bài toán hoặc chủ đề bạn muốn thực hành'], ['/resources', '.resource-card', 'Tên, tác giả hoặc chủ đề']] as const) {
    await page.goto(route);
    expect(await page.locator(card).count()).toBeGreaterThan(0);
    await page.getByPlaceholder(placeholder).fill('zzzz-neuralclone-no-match');
    await page.locator('main form button').click();
    await expect(page.locator(card)).toHaveCount(0);
    await expect(page.locator('.empty-state')).toBeVisible();
    await page.locator('.filter-reset').click();
    expect(await page.locator(card).count()).toBeGreaterThan(0);
  }
  await page.goto('/projects');
  const dataset = page.locator('.project-card a[href^="/datasets#"]').first();
  const destination = await dataset.getAttribute('href');
  await dataset.click();
  await expect(page.locator(destination!.split('/datasets')[1])).toBeVisible();
});
