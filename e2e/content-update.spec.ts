import { test, expect } from '@playwright/test';
const topics=['gradient-boosting','imbalanced-learning','mlops-reproducibility','responsible-ai','llm-foundations','efficient-finetuning','rag-vector-search','llm-evaluation-security'];
test('eight new lessons have content, prerequisites, math, quiz login and sitemap/search entries',async({page,request})=>{
  const sitemap=await(await request.get('/sitemap.xml')).text();
  for(const slug of topics){
    const response=await page.goto(`/learn/${slug}`);expect(response!.status()).toBe(200);
    await expect(page.locator('main h1')).toHaveCount(1);
    const preparation = page.getByRole('navigation',{name:'Kiến thức tiên quyết'});
    await preparation.locator('summary').click();
    await expect(preparation.locator('.lesson-introduction')).toBeVisible();
    await expect(preparation.locator('.lesson-introduction')).toContainText('Mục tiêu');
    await expect(page.locator('article.lesson')).toContainText('Đáp án và tiêu chí chấm');
    await expect(page.getByRole('navigation',{name:'Kiến thức tiên quyết'})).toBeVisible();
    await expect(page.locator('.katex-error')).toHaveCount(0);
    await expect(page.locator('#quiz').getByRole('link',{name:'Đăng nhập',exact:true})).toBeVisible();
    expect(sitemap).toContain(`/learn/${slug}`);
  }
  for(const [query,slug] of [['LoRA','efficient-finetuning'],['RAG','rag-vector-search'],['calibration','imbalanced-learning'],['fairness','responsible-ai']]){
    await page.goto(`/search?q=${query}`);await expect(page.locator(`h2 a[href="/learn/${slug}"]`)).toBeVisible();
  }
});
test('threshold demo uses the same verified counts as the lesson and Python lab',async({page})=>{
  await page.setViewportSize({width:375,height:1000});await page.goto('/playground#threshold');
  const demo=page.locator('#threshold');await expect(demo.locator('[data-metric=cost]')).toHaveText('6');
  await demo.getByRole('slider', {name:'Ngưỡng quyết định',exact:true}).fill('0.3');
  await expect(demo.locator('[data-metric=tp]')).toHaveText('3');
  await expect(demo.locator('[data-metric=fn]')).toHaveText('0');
  await expect(demo.locator('[data-metric=cost]')).toHaveText('3');
  await demo.getByLabel('Chi phí false positive').fill('2');
  await expect(demo.locator('[data-metric=cost]')).toHaveText('6');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test('two new labs expose real code, expected output and exact-source notebooks',async({page,request})=>{
  for(const id of ['threshold_cost','rag_retrieval']){
    await page.goto(`/lab?lab=${id}`);await expect(page.getByLabel('Bài thực hành:')).toHaveValue(id);
    await expect(page.getByRole('button',{name:'▶ Run'})).toBeVisible();
    const url=await page.getByRole('link',{name:'Download Notebook (.ipynb)'}).getAttribute('href');
    const response=await request.get(url!);expect(response.ok()).toBe(true);
    const nb=await response.json();const code=nb.cells.find((c:{cell_type:string})=>c.cell_type==='code');
    expect(code.source.join('')).toBe(await page.getByLabel('Code Python').inputValue());
    expect(code.execution_count).toBe(1);
  }
});
