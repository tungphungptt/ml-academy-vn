import {test,expect,type Page,type TestInfo,type Browser} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {randomUUID} from 'node:crypto';
import {createSessionFixture} from './fixtures';
const password='Cross-browser-review-2026!';
const samples=['Bắt đầu từ điều bạn tò mò.','Học máy. Hiểu từ gốc.','Đường cong mất mát và tối ưu hóa.','Tiền xử lý dữ liệu.','Mạng nơ-ron nhân tạo.','Hồi quy tuyến tính và phân loại.','Khám phá trí tuệ nhân tạo.','Những điều cần biết trước khi bắt đầu.'];
function review(page:Page,browser:Browser,info:TestInfo,kind:string){
  const errors:string[]=[],failedRequests:{path:string;error:string}[]=[],cancelled:string[]=[];
  page.on('pageerror',e=>errors.push(`page: ${e.message}`));
  page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});
  page.on('requestfailed',r=>{const error=r.failure()?.errorText??'unknown',url=new URL(r.url()).pathname;
    if(/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i.test(error))cancelled.push(url);else failedRequests.push({path:url,error});});
  page.on('response',r=>{if(r.status()>=500)errors.push(`HTTP ${r.status()}: ${new URL(r.url()).pathname}`);});
  const dir=path.join(process.env.CROSS_SCREENSHOT_DIR??'docs/screenshots/cross-browser',info.project.name);fs.mkdirSync(dir,{recursive:true});
  return {dir,finish(extra:Record<string,unknown>={}){
    fs.writeFileSync(`docs/${process.env.CROSS_REPORT_PREFIX??'neuralclone-cross'}-${info.project.name}-${kind}.json`,JSON.stringify({checkedAt:new Date().toISOString(),browser:info.project.name,version:browser.version(),platform:process.platform,kind,errors,failedRequests,cancelled,...extra},null,2)+'\n');
    expect(errors).toEqual([]);expect(failedRequests).toEqual([]);
  }};
}
async function noOverflow(page:Page,label:string){
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),label).toBe(true);
  await expect(page.locator('.katex-error')).toHaveCount(0);
}
async function completedPython(page:Page){
  await page.waitForFunction(()=>/Hoàn tất\.|Lỗi\.|Đã dừng\./.test(document.querySelector('.lab-status')?.textContent??''),{},{timeout:390000});
  await expect(page.locator('.lab-status')).toContainText('Hoàn tất.');
}
test('quiz waits for delayed hydration, then records the first pointer and keyboard selections',async({page,browser},info)=>{
  test.setTimeout(90000);const evidence=review(page,browser,info,'hydration');
  await createSessionFixture(page.context(),`cross-hydration-${info.project.name}`,password);
  let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/_next/static/**/*.js',async route=>{await gate;await route.continue();});
  try{
    await page.goto('/learn/imbalanced-learning#quiz',{waitUntil:'commit'});
    const first=page.locator('#quiz input[type=radio]').first();
    await expect(first).toBeVisible();await expect(first).toBeDisabled();
    release();await expect(first).toBeEnabled();await first.check();
    await expect(first).toBeChecked();await expect(page.locator('#quiz .opt.selected')).toHaveCount(1);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator('#quiz input:checked')).toHaveCount(1);
    await expect(page.locator('#quiz .quiz-progress')).toContainText('Đã trả lời 1/3 câu');
    await page.locator('#quiz').screenshot({path:`${evidence.dir}/quiz-delayed-hydration.png`});
  }finally{release();await page.unrouteAll({behavior:'wait'});evidence.finish();}
});

test('registration/login return to quiz; lab navigation and real stdlib Python preserve the learning path',async({page,browser},info)=>{
  test.setTimeout(480000);const evidence=review(page,browser,info,'learning');
  try{
    await page.setViewportSize({width:375,height:1000});await page.goto('/search?q=calibration');
    await page.locator('h2 a[href="/learn/imbalanced-learning"]').click();
    await page.locator('#quiz').getByRole('link',{name:'Đăng nhập',exact:true}).click();
    await page.locator('.auth-switch a').click();
    const email=`cross-${info.project.name}-${randomUUID()}@example.invalid`;
    await page.getByLabel('Email').fill(email);await page.getByLabel(/Mật khẩu/).fill(password);
    await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
    await expect(page).toHaveURL(/\/learn\/imbalanced-learning#quiz$/);
    const questions=JSON.parse(fs.readFileSync('content/quizzes/imbalanced-learning.json','utf8')) as {correct:number}[];
    for(const [i,q] of questions.entries())await page.locator('fieldset').nth(i).locator(`label[data-option-index="${q.correct}"] input`).check();
    await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await expect(page.getByText('Điểm: 3/3',{exact:true})).toBeVisible();
    await page.locator('#quiz').screenshot({path:`${evidence.dir}/quiz-mobile.png`});
    await page.getByRole('button',{name:'Đánh dấu hoàn thành',exact:true}).click();
    await expect(page.getByRole('button',{name:/Đã hoàn thành/})).toBeVisible();
    await page.locator('.related-practice a[href="/lab?lab=threshold_cost"]').click();
    await page.getByRole('button',{name:'▶ Run',exact:true}).click();
    await completedPython(page);
    await expect(page.locator('.lab-output')).toContainText('threshold=0.5 TP=2 FP=2 FN=1 cost=6');
    await page.getByLabel('Bài thực hành:').selectOption('rag_retrieval');await expect(page).toHaveURL(/lab=rag_retrieval/);
    await page.reload();await expect(page.getByLabel('Bài thực hành:')).toHaveValue('rag_retrieval');
    await page.getByRole('button',{name:'▶ Run',exact:true}).click();
    await completedPython(page);
    await expect(page.locator('.lab-output')).toContainText('unknown_query=abstain acl_check=passed');
    await page.goto('/learn/imbalanced-learning');await expect(page.getByRole('button',{name:/Đã hoàn thành/})).toBeVisible();
    await page.locator('.pager a[href="/learn/mlops-reproducibility"]').click();await expect(page.locator('main h1')).toContainText('MLOps');
    await page.request.post('/api/logout');
    await page.goto('/login?next='+encodeURIComponent('/learn/imbalanced-learning#quiz'));
    await page.getByLabel('Email').fill(email);await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
    await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();await expect(page).toHaveURL(/\/learn\/imbalanced-learning#quiz$/);
    await noOverflow(page,'registered quiz and login return');
  }finally{evidence.finish();}
});

test('both themes and four widths preserve Vietnamese NFC/NFD, formulas, SVG, code, focus and mobile navigation',async({page,browser},info)=>{
  test.setTimeout(300000);const evidence=review(page,browser,info,'visual');
  await createSessionFixture(page.context(),`cross-font-${info.project.name}`,password);
  const cases:Record<string,unknown>[]=[],specimens:Record<string,unknown>[]=[];
  try{
    await page.goto('/');
    const previousTheme=await page.locator('html').getAttribute('data-theme');
    await page.getByRole('button',{name:'Đổi giao diện sáng/tối',exact:true}).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme',previousTheme==='light'?'dark':'light');
    for(const theme of ['dark','light'])for(const width of [375,768,1440,1920]){
      await page.setViewportSize({width,height:1000});
      await page.evaluate(t=>{localStorage.setItem('theme',t);document.documentElement.dataset.theme=t;},theme);
      for(const [name,url] of [['home','/'],['courses','/courses'],['lesson','/learn/llm-foundations'],['cpu','/lab?lab=cnn_cpu'],['lab','/lab?lab=rag_retrieval'],['threshold','/playground#threshold']]){
        const response=await page.goto(url);expect(response?.status()).toBe(200);
        expect(response?.headers()['content-security-policy']).toContain("object-src 'none'");
        expect(response?.headers()['content-security-policy-report-only']).toBeUndefined();
        await page.evaluate(()=>document.fonts.ready);
        await expect(page.locator('html')).toHaveAttribute('data-theme',theme);await noOverflow(page,`${name}/${theme}/${width}`);
        expect(await page.locator('img:not([alt])').count()).toBe(0);
        for(const img of await page.locator('main img').all())expect(await img.evaluate(el=>(el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>0)).toBe(true);
        if(name==='lesson'){
          await expect(page.locator('.katex')).not.toHaveCount(0);await expect(page.locator('#quiz fieldset')).toHaveCount(3);
          await page.locator('#quiz input[type=radio]').first().check();
          await expect(page.locator('#quiz .opt.selected')).toHaveCount(1);
          const label=page.locator('#quiz .option-copy').first();
          await label.evaluate(el=>{const walk=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;while((n=walk.nextNode()))n.nodeValue=n.nodeValue!.normalize('NFD');});
          await label.screenshot({path:`${evidence.dir}/quiz-option-nfd-${theme}-${width}.png`});
          await page.locator('.katex-display').first().screenshot({path:`${evidence.dir}/formula-${theme}-${width}.png`});
          if(width===375){
            const formula=page.locator('.katex-display').first();
            await expect(formula).toHaveAttribute('tabindex','0');await formula.focus();await expect(formula).toBeFocused();
            const overflowing=await formula.evaluate(el=>el.scrollWidth>el.clientWidth);
            expect(overflowing).toBe(true);await page.keyboard.press('ArrowRight');
            await expect.poll(()=>formula.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
            await formula.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
            await formula.screenshot({path:`${evidence.dir}/formula-scroll-end-${theme}-${width}.png`});
          }
        }
        if(name==='threshold'){
          await expect(page.locator('#threshold h2')).toHaveText('Ngưỡng quyết định và chi phí sai lầm');
          await expect(page.locator('.playground-nav a[aria-current=location]')).toHaveAttribute('href','#threshold');
          await page.locator('#threshold').screenshot({path:`${evidence.dir}/threshold-demo-${theme}-${width}.png`});
        }
        if(width===375&&name==='home'){
          const toggle=page.getByRole('button',{name:'Mở hoặc đóng menu',exact:true});await toggle.click();
          await expect(toggle).toHaveAttribute('aria-expanded','true');await page.keyboard.press('Escape');
          await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');
        }
        await page.screenshot({path:`${evidence.dir}/${name}-${theme}-${width}.png`});cases.push({name,theme,width});
      }
      // A same-origin intercepted HTML fixture isolates font shaping from React
      // hydration. It uses the exact repository @font-face CSS/assets.
      const colors=await page.evaluate(()=>({bg:getComputedStyle(document.body).backgroundColor,fg:getComputedStyle(document.body).color,font:getComputedStyle(document.body).fontFamily}));
      const css=fs.readFileSync('src/app/fonts.css','utf8');
      await page.route('**/__font-review',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="vi"><meta charset="utf-8"><style>${css}*{box-sizing:border-box}body{margin:0;color:${colors.fg};background:${colors.bg}}main{padding:16px}</style><main></main></html>`}));
      await page.goto('/__font-review');
      await page.unroute('**/__font-review');
      await page.evaluate(({samples,font})=>{
        const section=document.createElement('section');section.dataset.fontReview='';section.style.padding='16px';
        for(const size of [24,36,64])for(const text of samples)for(const form of ['NFC','NFD'] as const){
          const p=document.createElement('p');p.dataset.form=form;p.textContent=text.normalize(form);p.style.cssText=`font:600 ${size}px/1.5 ${font};letter-spacing:-.015em;margin:16px 0`;section.append(p);
        }
        document.querySelector('main')!.replaceChildren(section);
      },{samples,font:colors.font});
      await page.evaluate(()=>document.fonts.ready);
      const metrics=await page.locator('[data-form]').evaluateAll(els=>els.map(el=>{const r=document.createRange();r.selectNodeContents(el);return {form:(el as HTMLElement).dataset.form,width:r.getBoundingClientRect().width,font:getComputedStyle(el).fontFamily};}));
      for(let i=0;i<metrics.length;i+=2)expect(Math.abs(metrics[i].width-metrics[i+1].width),`${theme}/${width}/pair${i/2}`).toBeLessThan(.15);
      expect(await page.evaluate(()=>document.fonts.check('600 36px "Be Vietnam Pro"'))).toBe(true);
      await noOverflow(page,`specimens/${theme}/${width}`);
      await page.locator('[data-font-review]').screenshot({path:`${evidence.dir}/font-specimens-${theme}-${width}.png`});
      for(const form of ['NFC','NFD'])await page.locator(`[data-form=${form}]`).nth(16).screenshot({path:`${evidence.dir}/font-detail-${form}-${theme}-${width}.png`});
      specimens.push({theme,width,count:metrics.length,metrics});
    }
  }finally{evidence.finish({cases,specimens,fontVerification:'FontFaceSet, computed CSS, NFC/NFD geometry and screenshots; no claim of Chromium CDP actual-font APIs in other engines.'});}
});

test('Pyodide NumPy/sklearn, stop/reset/error recovery and threshold boundaries execute correctly',async({page,browser},info)=>{
  test.setTimeout(480000);const evidence=review(page,browser,info,'compute');
  try{
    await page.goto('/lab?lab=linear_regression');await page.getByRole('button',{name:'▶ Run',exact:true}).click();
    await completedPython(page);
    await expect(page.locator('.lab-output')).toContainText('w=1.999 b=0.002');
    await page.getByRole('button',{name:'Library-based',exact:true}).click();await page.getByRole('button',{name:'▶ Run',exact:true}).click();
    await completedPython(page);await expect(page.locator('.lab-output')).toContainText('w=2.000 b=0.000');
    await page.getByLabel('Code Python').fill('raise ValueError("Kiểm tra lỗi tiếng Việt")');await page.getByRole('button',{name:'▶ Run',exact:true}).click();
    await expect(page.locator('.lab-side [role=alert]')).toContainText('Kiểm tra lỗi tiếng Việt');
    await page.locator('.lab-side [role=alert]').screenshot({path:`${evidence.dir}/python-error-vietnamese.png`});
    await page.getByRole('button',{name:'Reset Code',exact:true}).click();await expect(page.locator('.lab-side [role=alert]')).toHaveCount(0);
    await page.getByLabel('Code Python').fill('while True:\n    pass');await page.getByRole('button',{name:'▶ Run',exact:true}).click();await page.getByRole('button',{name:'■ Stop',exact:true}).click();
    await expect(page.locator('.lab-status')).toContainText('Đã dừng.');
    await page.goto('/playground#threshold');const demo=page.locator('#threshold'),slider=demo.getByRole('slider',{name:'Ngưỡng quyết định',exact:true});
    await slider.focus();await page.keyboard.press('Home');await expect(demo.locator('[data-metric=tp]')).toHaveText('3');await expect(demo.locator('[data-metric=fp]')).toHaveText('5');
    await page.keyboard.press('End');await expect(demo.locator('[data-metric=cost]')).toHaveText('12');await expect(demo).toContainText('Precision: Không xác định');
    await demo.locator('.threshold-table summary').click();expect(await demo.locator('.threshold-table tbody td:last-child').allTextContents()).toEqual(Array(8).fill('−'));
    await slider.fill('0.35');await expect(demo.locator('[data-metric=cost]')).toHaveText('3');
    await demo.getByRole('slider',{name:'Chi phí false positive',exact:true}).fill('0');await demo.getByRole('slider',{name:'Chi phí false negative',exact:true}).fill('0');
    await expect(demo.getByRole('status',{name:'Chi phí bằng 0'})).toContainText('mọi ngưỡng');await noOverflow(page,'threshold boundary');
  }finally{evidence.finish();}
});
