import {test,expect} from '@playwright/test';
import {createSessionFixture} from './fixtures';
import fs from 'node:fs';
const phase=process.env.APPLE_DESIGN_PHASE==='before'?'before':'after';
test('interruptible navigation, mobile TOC, keyboard math and enlarged text remain usable',async({page,browser},info)=>{
 test.skip(phase==='before','Baseline capture only');test.setTimeout(180000);
 const errors:string[]=[],checks:Record<string,unknown>[]=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setViewportSize({width:375,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/learn/linear-regression');
 const toggle=page.getByRole('button',{name:'Mở hoặc đóng menu',exact:true});
 await toggle.click();await page.waitForFunction(()=>{const x=Number(document.getElementById('menu')?.style.getPropertyValue('--disclosure-progress'));return x>.02&&x<.98;});
 const live=await page.locator('#menu').evaluate(el=>Number((el as HTMLElement).style.getPropertyValue('--disclosure-progress')));
 await toggle.click();await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');
 await expect.poll(()=>page.locator('#menu').evaluate(el=>Number((el as HTMLElement).style.getPropertyValue('--disclosure-progress')))).toBe(1);
 await page.keyboard.press('Escape');await expect(toggle).toBeFocused();await expect(toggle).toHaveAttribute('aria-expanded','false');
 await expect(page.locator('#menu')).toBeHidden();await expect(page.locator('#menu')).toHaveAttribute('inert','');
 checks.push({springInterrupted:true,observedIntermediatePosition:live});
 await page.emulateMedia({reducedMotion:'reduce'});await toggle.click();await expect.poll(()=>page.locator('#menu').evaluate(el=>el.style.getPropertyValue('--disclosure-progress'))).toBe('1');
 await expect(page.locator('#menu')).toHaveCSS('transform','none');await page.keyboard.press('Escape');
 const summary=page.locator('.toc-inline summary');await summary.click();await page.keyboard.press('Escape');await expect(summary).toBeFocused();
 await summary.click();await page.getByRole('navigation',{name:'Mục lục trên màn hình nhỏ'}).getByRole('link',{name:'Mô hình và công thức',exact:true}).click();
 await expect(page).toHaveURL(/#mo-hinh-va-cong-thuc$/);await expect(page.locator('.toc-inline')).not.toHaveAttribute('open','');
 await expect(page.locator('#mo-hinh-va-cong-thuc')).toBeFocused();
 expect(await page.locator('#mo-hinh-va-cong-thuc').evaluate(el=>el.getBoundingClientRect().top)).toBeGreaterThanOrEqual(64);
 await page.goto('/learn/llm-foundations');const formula=page.locator('.katex-display').first();await formula.scrollIntoViewIfNeeded();await formula.focus();await expect(formula).toBeFocused();await page.keyboard.press('ArrowRight');await expect.poll(()=>formula.evaluate(el=>el.scrollLeft)).toBeGreaterThan(0);
 await page.goto('/learn/imbalanced-learning#quiz');await page.locator('#quiz').scrollIntoViewIfNeeded();await expect(page.locator('.lesson-toc')).toBeHidden();
 for(const route of ['/courses','/learn/llm-foundations','/lab?lab=cnn_cpu','/playground#threshold','/login']){
  await page.goto(route,{waitUntil:'domcontentloaded',timeout:30000});if(route.includes('playground'))await expect(page.locator('#threshold h2')).toBeVisible();
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`200% text: ${route}`).toBe(true);
  checks.push({route,textScale:'200%',overflow:false});
 }
 if(info.project.name==='chrome'){
  await page.evaluate(()=>document.documentElement.style.fontSize='');
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'reduce'},{name:'prefers-contrast',value:'more'}]});
  await expect(page.locator('.site-header')).toHaveCSS('backdrop-filter','none');
  checks.push({reducedTransparencyAndIncreasedContrast:'Chromium CDP emulation; not OS hardware preference test'});
 }
 fs.writeFileSync(`docs/${process.env.DESIGN_REPORT_PREFIX??'neuralclone-apple'}-${info.project.name}-interactions.json`,JSON.stringify({checkedAt:new Date().toISOString(),engine:info.project.name,version:browser.version(),platform:process.platform,checks,errors},null,2)+'\n');
 expect(errors).toEqual([]);
});
test('representative learning screens in both themes and four widths',async({browser},info)=>{
 test.setTimeout(360000);const errors:string[]=[],failed:{url:string;error:string}[]=[],cases:Record<string,unknown>[]=[];let currentCase:Record<string,unknown>|undefined;
 const folder=`${process.env.DESIGN_SCREENSHOT_PREFIX??'docs/screenshots/apple'}-${phase}/${info.project.name}`;fs.mkdirSync(folder,{recursive:true});
 const context=await browser.newContext({baseURL:process.env.E2E_BASE_URL,reducedMotion:'reduce'}),anonymous=await browser.newContext({baseURL:process.env.E2E_BASE_URL,reducedMotion:'reduce'});
 await createSessionFixture(context,`apple-visual-${info.project.name}`,'Apple-review-fixture-2026!');
 const page=await context.newPage(),anon=await anonymous.newPage();
 const observePage=(p:typeof page)=>{
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  p.on('requestfailed',r=>{const e=r.failure()?.errorText??'';if(!/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i.test(e))failed.push({url:new URL(r.url()).pathname,error:e});});
 };for(const p of [page,anon])observePage(p);
 try{
  await page.goto('/');await anon.goto('/');
  for(const theme of ['dark','light'])for(const width of [375,768,1440,1920]){
   for(const p of [page,anon]){await p.setViewportSize({width,height:1000});await p.evaluate(t=>{localStorage.setItem('theme',t);document.documentElement.dataset.theme=t;},theme);}
   for(const [name,url,guest] of [
    ['home','/',true],['dashboard','/',false],['courses','/courses',false],['lesson','/learn/llm-foundations',false],
    ['quiz','/learn/imbalanced-learning#quiz',false],['lab','/lab?lab=linear_regression',false],['cpu','/lab?lab=cnn_cpu',false],
    ['threshold','/playground#threshold',false],['login','/login?next=%2Flearn%2Fllm-foundations%23quiz',true],['register','/register',true],['account','/account',false],
   ] as const){
    // WebKit's utility-world document.fonts.ready can stall after repeated
    // document replacements. Isolate each visual capture without bypassing
    // Playwright's font wait or any of our font/layout assertions.
    const isolated=info.project.name==='webkit';
    const p=isolated?await (guest?anonymous:context).newPage():guest?anon:page;
    if(isolated){observePage(p);await p.setViewportSize({width,height:1000});}
    currentCase={name,url,theme,width,phase:'navigation',isolated};await p.bringToFront();
    const response=await p.goto(url,{waitUntil:'domcontentloaded',timeout:30000});expect(response?.status()).toBe(200);currentCase.phase='fonts';
    await p.waitForFunction(()=>document.fonts.status==='loaded',{},{polling:100,timeout:20000});currentCase.phase='assertions';
    await expect(p.locator('main h1')).toHaveCount(1);await expect(p.locator('html')).toHaveAttribute('data-theme',theme);
    if(name==='lesson'||name==='quiz')await expect(p.locator('#quiz input').first()).toBeEnabled();
    if(name==='quiz'){await p.locator('#quiz').scrollIntoViewIfNeeded();await p.locator('#quiz input').first().check();}
    if(name==='threshold'){await expect(p.locator('#threshold h2')).toContainText('Ngưỡng quyết định');await p.locator('#threshold').scrollIntoViewIfNeeded();}
    if(name==='lesson')await p.evaluate(()=>scrollTo(0,0));
    await expect(p.locator('.katex-error')).toHaveCount(0);
    expect(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${name}/${theme}/${width}`).toBe(true);
    currentCase.phase='screenshot';await p.screenshot({path:`${folder}/${name}-${theme}-${width}.png`,timeout:20000,caret:'initial'});
    if(name==='threshold')await p.locator('#threshold').screenshot({path:`${folder}/threshold-detail-${theme}-${width}.png`,caret:'initial'});
    cases.push({name,theme,width,url});
    if(isolated)await p.close();
   }
  }
 }finally{
  fs.writeFileSync(`docs/${process.env.DESIGN_REPORT_PREFIX??'neuralclone-apple'}-${phase}-${info.project.name}-visual.json`,JSON.stringify({checkedAt:new Date().toISOString(),phase,browser:info.project.name,version:browser.version(),platform:process.platform,cases,currentCase,errors,failed},null,2)+'\n');
  await context.close();await anonymous.close();
 }
 expect(errors).toEqual([]);expect(failed).toEqual([]);
});
