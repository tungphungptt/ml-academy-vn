import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';

test('neural controls wait for hydration and keep the first selection after delayed scripts',async({page})=>{
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/_next/static/**/*.js',async route=>{await gate;await route.continue();});
 try{
  await page.goto('/',{waitUntil:'commit'});
  const stage=page.getByRole('group',{name:'Các bước tính của mạng neural'}).getByRole('button',{name:/Sigmoid/});
  await expect(stage).toBeVisible();await expect(stage).toBeDisabled();
  await expect(page.locator('.knowledge-flow')).toHaveAttribute('aria-busy','true');
  release();await expect(stage).toBeEnabled();await stage.click();
  await expect(stage).toHaveAttribute('aria-pressed','true');await expect(page.locator('.knowledge-flow')).toHaveAttribute('data-flow-step','2');
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});

test('workspace rail and neural steps remain usable with keyboard, reduced motion and enlarged Vietnamese',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/');
 await expect(page.locator('h1')).toContainText('Hiểu AI.');
 const stages=page.getByRole('group',{name:'Các bước tính của mạng neural'});
 for(const [i,label] of ['Đầu vào','Lớp ẩn','Sigmoid','Kết quả'].entries()){
  const button=stages.getByRole('button',{name:new RegExp(label)});
  await expect(button).toBeEnabled();
  await button.focus();await page.keyboard.press('Enter');
  await expect(button).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('.knowledge-flow')).toHaveAttribute('data-flow-step',String(i));
  await expect(page.locator('.knowledge-flow')).toHaveAttribute('data-animating','false');
 }
 await page.setViewportSize({width:375,height:1000});
 const menu=page.getByRole('button',{name:'Mở hoặc đóng menu',exact:true});
 await menu.click();await expect(menu).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');await expect(menu).toBeFocused();await expect(page.locator('#menu')).toHaveAttribute('inert','');
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await expect(stages.getByRole('button',{name:/Kết quả/})).toBeVisible();
 await page.goto('/learn/linear-regression');
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');
 await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 const copy='Trí tuệ nhân tạo · Học có giám sát · Lan truyền ngược · Ngưỡng quyết định';
 const widths=await page.evaluate(text=>{
  const result:number[]=[];
  for(const normalization of ['NFC','NFD'] as const){const element=document.createElement('span');element.textContent=text.normalize(normalization);element.style.cssText='position:fixed;visibility:hidden;white-space:nowrap;font-family:var(--font-body);font-size:24px;font-weight:700';document.body.append(element);result.push(element.getBoundingClientRect().width);element.remove();}
  return result;
 },copy);
 expect(Math.abs(widths[0]-widths[1])).toBeLessThan(.1);
 const math=page.locator('.katex-display').first();await math.scrollIntoViewIfNeeded();await math.focus();await expect(math).toBeFocused();
 if(await math.evaluate(e=>e.scrollWidth>e.clientWidth)){await page.keyboard.press('ArrowRight');await expect.poll(()=>math.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);}
});

test('registration and login return to quiz while real Pyodide output follows the current editor',async({page,context})=>{
 test.setTimeout(180000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 const cached:string[]=[];
 await context.route('https://cdn.jsdelivr.net/pyodide/**',async route=>{
  const url=route.request().url(),file=path.resolve('.local/expansion-cdn',createHash('sha256').update(url).digest('hex'));
  if(!fs.existsSync(file)){await route.abort();return;}
  cached.push(url);await route.fulfill({status:200,body:fs.readFileSync(file),contentType:url.endsWith('.js')?'application/javascript':url.endsWith('.json')?'application/json':url.endsWith('.wasm')?'application/wasm':'application/octet-stream'});
 });
 await page.setViewportSize({width:375,height:1000});
 await page.goto('/learn/linear-regression#quiz');
 await page.locator('#quiz').getByRole('link',{name:'Đăng nhập',exact:true}).click();
 await page.locator('.auth-switch a').click();
 const email=`workspace-${randomUUID()}@example.invalid`,password='Workspace-test-2026!';
 await page.getByLabel('Email').fill(email);await page.getByLabel(/Mật khẩu/).fill(password);
 await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
 await expect(page).toHaveURL(/\/learn\/linear-regression#quiz$/);
 const questions=JSON.parse(fs.readFileSync('content/quizzes/linear-regression.json','utf8')) as {correct:number}[];
 for(const [i,q]of questions.entries())await page.locator('#quiz fieldset').nth(i).locator(`label[data-option-index="${q.correct}"] input`).check();
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await expect(page.locator('.quiz-result')).toContainText(`Điểm: ${questions.length}/${questions.length}`);
 if(process.env.WORKSPACE_VISUAL_CAPTURE==='1')await page.locator('#quiz').screenshot({path:`.local/workspace-quiz-${test.info().project.name}.png`,caret:'initial'});
 await page.request.post('/api/logout');
 await page.goto('/login?next='+encodeURIComponent('/learn/linear-regression#quiz'));
 await page.getByLabel('Email').fill(email);await page.getByLabel('Mật khẩu',{exact:true}).fill(password);
 const loginResponse=page.waitForResponse(response=>response.url().endsWith('/api/login')&&response.request().method()==='POST');
 const loginStarted=Date.now();await page.getByRole('button',{name:'Đăng nhập',exact:true}).click();expect((await loginResponse).ok()).toBe(true);console.log(`Login response: ${Date.now()-loginStarted}ms`);
 await expect(page).toHaveURL(/\/learn\/linear-regression#quiz$/);
 await page.goto('/lab?lab=linear_regression');
 await page.getByRole('button',{name:'Library-based',exact:true}).click();await expect(page.getByRole('button',{name:'Library-based',exact:true})).toHaveAttribute('aria-pressed','true');
 const editor=page.getByLabel('Code Python');
 await editor.fill('print(sum(x*x for x in [1,2,3]))');
 await page.getByRole('button',{name:'▶ Run',exact:true}).click();
 await expect(page.locator('#lab-output')).toHaveAttribute('data-state','success',{timeout:90000});
 await expect(page.locator('.lab-output')).toHaveText('14\n');expect(cached.length).toBeGreaterThan(0);
 await editor.fill('print(15)');await expect(page.locator('#lab-output')).toHaveAttribute('data-state','stale');
 await page.getByRole('button',{name:'▶ Run',exact:true}).click();await expect(page.locator('#lab-output')).toHaveAttribute('data-state','success');await expect(page.locator('.lab-output')).toHaveText('15\n');
 await page.getByLabel('Bài thực hành:').selectOption('threshold_cost');await expect(page).toHaveURL(/lab=threshold_cost/);
 await page.reload();await expect(page.getByLabel('Bài thực hành:')).toHaveValue('threshold_cost');
 expect(errors).toEqual([]);
});
