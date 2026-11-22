import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createUserFixture} from './fixtures';
const password='Final-polish-fixture-2026!';
test('learner returns from registration to quiz, runs real Python, and continues the lesson path',async({page})=>{
  test.setTimeout(150000);
  await page.goto('/search?q=calibration');
  await page.locator('h2 a[href="/learn/imbalanced-learning"]').click();
  await page.locator('#quiz').getByRole('link',{name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL(/\/login\?next=/);
  await page.locator('.auth-switch').getByRole('link',{name:'Đăng ký',exact:true}).click();
  await page.getByLabel('Email').fill(`polish-path-${Date.now()}@example.invalid`);
  await page.getByLabel(/Mật khẩu/).fill(password);
  await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
  await expect(page).toHaveURL(/\/learn\/imbalanced-learning#quiz$/);
  const quiz=JSON.parse(fs.readFileSync('content/quizzes/imbalanced-learning.json','utf8')) as {correct:number}[];
  for(const [i,q] of quiz.entries())await page.locator('fieldset').nth(i).locator(`label[data-option-index="${q.correct}"] input`).check();
  await page.getByRole('button',{name:'Nộp bài',exact:true}).click();
  await expect(page.getByText('Điểm: 3/3',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Đánh dấu hoàn thành',exact:true}).click();
  await expect(page.getByRole('button',{name:/Đã hoàn thành/})).toBeVisible();
  await page.locator('.related-practice a[href="/lab?lab=threshold_cost"]').click();
  await page.getByRole('button',{name:'▶ Run',exact:true}).click();
  await expect(page.locator('.lab-status')).toContainText('Hoàn tất.',{timeout:100000});
  await expect(page.locator('.lab-output')).toContainText('threshold=0.5 TP=2 FP=2 FN=1 cost=6');
  await page.locator('.lab-related a[href="/learn/imbalanced-learning"]').click();
  await expect(page.getByRole('button',{name:/Đã hoàn thành/})).toBeVisible();
  await page.locator('.pager a[href="/learn/mlops-reproducibility"]').click();
  await expect(page.locator('main h1')).toContainText('MLOps');
});
test('login retains a quiz destination and untrusted next URLs cannot escape the app',async({page})=>{
  const {email}=await createUserFixture('polish-login',password);
  const destination='/learn/llm-foundations#quiz';
  await page.goto('/login?next='+encodeURIComponent(destination));
  await page.getByLabel('Email').fill(email);await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();
  await expect(page).toHaveURL(new RegExp('/learn/llm-foundations#quiz$'));
  await expect(page.locator('#quiz fieldset')).toHaveCount(3);
  const cdp=await page.context().newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  for(const theme of ['light','dark'])for(const width of [375,768,1440,1920]){
    await page.setViewportSize({width,height:1000});
    await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
    const selectors=['main h1','article.lesson p','.quiz-panel legend > span:last-child','.option-copy','.quiz-actions button'];
    for(const selector of selectors){
      await page.locator(selector).first().evaluate(el=>{
        const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=walker.nextNode()))n.nodeValue=n.nodeValue!.normalize('NFD');
      });
      await page.evaluate(()=>document.fonts.ready);
      const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector});
      const {fonts}=await cdp.send('CSS.getPlatformFontsForNode',{nodeId});
      const expected=selector==='main h1'?'Lora':'BeVietnamPro';
      expect(fonts.length).toBeGreaterThan(0);expect(fonts.every((f:{isCustomFont:boolean;postScriptName:string})=>f.isCustomFont&&f.postScriptName.startsWith(expected))).toBe(true);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  await page.goto('/login?next='+encodeURIComponent('//untrusted.example/'));
  await expect(page.locator('.auth-switch a')).toHaveAttribute('href','/register');
  await page.goto('/learn/llm-evaluation-security');
  await expect(page.locator('.pager a[href="/courses"]')).toContainText('Khám phá lộ trình tiếp theo');
});
test('lab selection survives reload and edited code remains when switching labs',async({page})=>{
  await page.goto('/lab?lab=threshold_cost');
  await page.getByLabel('Bài thực hành:').selectOption('rag_retrieval');
  await expect(page).toHaveURL(/lab=rag_retrieval/);await page.reload();
  await expect(page.getByLabel('Bài thực hành:')).toHaveValue('rag_retrieval');
  await page.getByLabel('Code Python').fill('print("Giữ code khi đổi lab")');
  await page.getByLabel('Bài thực hành:').selectOption('threshold_cost');
  await page.getByLabel('Bài thực hành:').selectOption('rag_retrieval');
  await expect(page.getByLabel('Code Python')).toHaveValue('print("Giữ code khi đổi lab")');
  await page.getByRole('button',{name:'Reset Code',exact:true}).click();
  expect(await page.getByLabel('Code Python').inputValue()).toContain('TF-IDF');
});
test('threshold boundaries, plot, table and zero-cost explanation agree in both themes at all widths',async({page})=>{
  for(const theme of ['light','dark'])for(const width of [375,768,1440,1920]){
    await page.setViewportSize({width,height:1000});await page.goto('/playground#threshold');
    await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
    const demo=page.locator('#threshold'),slider=demo.getByRole('slider',{name:'Ngưỡng quyết định',exact:true});
    await demo.getByRole('slider',{name:'Chi phí false positive',exact:true}).fill('1');
    await demo.getByRole('slider',{name:'Chi phí false negative',exact:true}).fill('4');
    await slider.focus();await page.keyboard.press('Home');
    await expect(demo.locator('[data-metric=tp]')).toHaveText('3');await expect(demo.locator('[data-metric=fp]')).toHaveText('5');
    await expect(demo.locator('circle[data-predicted=positive]')).toHaveCount(8);
    await page.keyboard.press('End');
    await expect(demo.locator('[data-metric=tn]')).toHaveText('5');await expect(demo.locator('[data-metric=fn]')).toHaveText('3');
    await expect(demo.locator('[data-metric=cost]')).toHaveText('12');
    await expect(demo).toContainText('Precision: Không xác định');await expect(demo.locator('circle[data-predicted=negative]')).toHaveCount(8);
    if(!(await demo.locator('.threshold-table tbody').isVisible()))await demo.locator('.threshold-table summary').click();
    await expect(demo.locator('.threshold-table tbody tr')).toHaveCount(8);
    expect(await demo.locator('.threshold-table tbody tr td:last-child').allTextContents()).toEqual(Array(8).fill('−'));
    await slider.fill('0.35');await expect(demo.locator('[data-metric=tp]')).toHaveText('3');
    await expect(demo.locator('[data-metric=cost]')).toHaveText('3');
    await demo.getByRole('slider',{name:'Chi phí false positive',exact:true}).fill('0');
    await demo.getByRole('slider',{name:'Chi phí false negative',exact:true}).fill('0');
    await expect(demo.getByRole('status',{name:'Chi phí bằng 0'})).toContainText('mọi ngưỡng');await expect(demo.locator('[data-metric=cost]')).toHaveText('0');
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    if(process.env.UI_SCREENSHOT_DIR)await demo.screenshot({path:`${process.env.UI_SCREENSHOT_DIR}/threshold-${theme}-${width}.png`});
  }
});
