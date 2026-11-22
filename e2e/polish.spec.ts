import {test,expect} from '@playwright/test';
import {navigationLinks} from '../src/lib/navigation';

test('theme bootstrap precedes hydration and persisted themes survive navigation',async({browser})=>{
 for(const theme of ['light','dark']){
  const context=await browser.newContext({baseURL:process.env.E2E_BASE_URL,viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  await context.addInitScript(initial=>{
   if(localStorage.getItem('theme')===null)localStorage.setItem('theme',initial);
   const frames:string[]=[];(window as unknown as {themeFrames:string[]}).themeFrames=frames;
   const sample=()=>{if(document.querySelector('main h1'))frames.push(document.documentElement.dataset.theme??'missing');if(frames.length<6)requestAnimationFrame(sample);};requestAnimationFrame(sample);
  },theme);
  const page=await context.newPage(),errors:string[]=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('pageerror',e=>errors.push(e.message));
  let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/_next/static/**/*.js',async route=>{await gate;await route.continue();});
  try{
   await page.goto('/explore',{waitUntil:'commit'});await expect(page.locator('main h1')).toBeVisible();
   await expect(page.locator('html')).toHaveAttribute('data-scroll-behavior','smooth');
   await expect(page.locator('head #neuralclone-theme-bootstrap')).toHaveCount(1);
   await expect.poll(()=>page.evaluate(()=>(window as unknown as {themeFrames:string[]}).themeFrames.length)).toBe(6);
   expect(await page.evaluate(()=>(window as unknown as {themeFrames:string[]}).themeFrames)).toEqual(Array(6).fill(theme));
   await expect(page.locator(theme==='light'?'.theme-icon-moon':'.theme-icon-sun')).toBeVisible();
   release();await page.unrouteAll({behavior:'wait'});
   const themeButton=page.getByRole('button',{name:'Đổi giao diện sáng/tối'});await themeButton.click();
   const next=theme==='light'?'dark':'light';await expect(page.locator('html')).toHaveAttribute('data-theme',next);
   await page.getByRole('navigation',{name:'Điều hướng chính'}).getByRole('link',{name:'Lộ trình',exact:true}).click();await expect(page.locator('html')).toHaveAttribute('data-theme',next);
   expect(await page.evaluate(()=>localStorage.getItem('theme'))).toBe(next);
   expect(await page.locator('.nav-links>a').evaluateAll(nodes=>nodes.slice(1).map(e=>e.getAttribute('href')))).toEqual(navigationLinks.map(link=>link.href));
   expect(errors).toEqual([]);
  }finally{release();await context.close();}
 }
});

test('intentional hydration recovery never recreates the theme script on the client',async({page})=>{
 const errors:string[]=[];page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 page.on('pageerror',error=>errors.push(error.message));
 await page.addInitScript(()=>{
  const created:string[]=[];(window as unknown as {clientThemeScripts:string[]}).clientThemeScripts=created;
  const append=Node.prototype.appendChild,insert=Node.prototype.insertBefore;
  const record=(node:Node)=>{if(node instanceof HTMLScriptElement&&node.textContent?.startsWith('try{var t=localStorage.getItem("theme")'))created.push(node.textContent);};
  Node.prototype.appendChild=function<T extends Node>(node:T):T{record(node);return append.call(this,node) as T;};
  Node.prototype.insertBefore=function<T extends Node>(node:T,reference:Node|null):T{record(node);return insert.call(this,node,reference) as T;};
 });
 await page.route('**/explore',async route=>{
  const response=await route.fetch(),html=await response.text();
  const start=html.indexOf('<div class="nav-links">'),end=html.indexOf('</div>',start);expect(start).toBeGreaterThan(0);
  const menu=html.slice(start,end),changed=menu.replace(/<a\b[^>]*href="\/explore"[\s\S]*?<\/a>/,'');expect(changed).not.toBe(menu);
  await route.fulfill({response,body:html.slice(0,start)+changed+html.slice(end)});
 });
 await page.goto('/explore');await page.getByRole('button',{name:'Đổi giao diện sáng/tối'}).click();
 await expect.poll(()=>errors.some(message=>/hydrat|#418|errors\/418/i.test(message))).toBe(true);
 expect(errors.filter(message=>/Encountered a script tag/i.test(message))).toEqual([]);
 expect(await page.evaluate(()=>(window as unknown as {clientThemeScripts:string[]}).clientThemeScripts)).toEqual([]);
 await expect(page.locator('.nav-links>a[href="/explore"]')).toHaveCount(1);
});

test('repeated code copies retain the most recent feedback and cancel it when leaving',async({page})=>{
 await page.clock.install();
 await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{}},configurable:true}));
 await page.goto('/learn/linear-regression');
 const button=page.locator('article .codeblock').first().getByRole('button',{name:'Sao chép code'});
 await button.click();await expect(button).toContainText('Đã chép');await page.clock.runFor(1000);
 await button.click();await page.clock.runFor(750);await expect(button).toContainText('Đã chép');
 await page.clock.runFor(900);await expect(button).toContainText('Sao chép');
 await button.click();await page.goto('/courses');await page.clock.runFor(2000);await expect(page.locator('main h1')).toBeVisible();
});

test('loss legend follows actual curve colors and dash patterns',async({page})=>{
 await page.goto('/learn/loss-functions');await page.getByRole('button',{name:'Mở thí nghiệm',exact:true}).click();
 const legend=page.getByRole('list',{name:'Chú giải đường cong'});await expect(legend.locator('li')).toHaveCount(3);
 const curves=page.locator('.experiment-plot-scroll svg polyline'),keys=legend.locator('svg line');
 for(let index=0;index<3;index++){
  expect(await keys.nth(index).getAttribute('stroke')).toBe(await curves.nth(index).getAttribute('stroke'));
  expect(await keys.nth(index).getAttribute('stroke-dasharray')).toBe(await curves.nth(index).getAttribute('stroke-dasharray'));
 }
});

test('lab waits for hydration and distinguishes empty success, stale results and errors',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.route('**/pyodide-worker.js',route=>route.fulfill({contentType:'application/javascript',body:`self.onmessage=({data:{code}})=>{self.postMessage({type:'status',phase:'running'});self.postMessage(code==='pass'?{type:'done',out:''}:code==='raise ValueError("acceptance-error")'?{type:'error',out:'',message:'ValueError: acceptance-error'}:{type:'done',out:code});};`}));
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/_next/static/**/*.js',async route=>{await gate;await route.continue();});
 try{
  await page.goto('/lab?lab=linear_regression',{waitUntil:'commit'});
  const editor=page.getByLabel('Code Python'),run=page.getByRole('button',{name:'▶ Run',exact:true});
  await expect(editor).toBeVisible();await expect(editor).toBeDisabled();await expect(run).toBeDisabled();await expect(page.locator('.lab-picker select')).toBeDisabled();await expect(page.locator('.lab-frame')).toHaveAttribute('aria-busy','true');
  release();await page.unroute('**/_next/static/**/*.js');await expect(editor).toBeEditable();await expect(page.locator('.lab-frame')).toHaveAttribute('aria-busy','false');
  await editor.fill('print(14)');await run.click();await expect(page.locator('.lab-output')).toHaveText('print(14)');
  await editor.fill('pass');await expect(page.locator('#lab-output')).toHaveAttribute('data-state','stale');await run.click();await expect(page.locator('#lab-output')).toHaveAttribute('data-state','success');await expect(page.locator('.lab-output')).toHaveText('Code đã chạy xong; không có nội dung được in ra.');
  await editor.fill('raise ValueError("acceptance-error")');await expect(page.locator('#lab-output')).toHaveAttribute('data-state','stale');await run.click();await expect(page.locator('#lab-output')).toHaveAttribute('data-state','error');await expect(page.locator('.lab-side [role=alert]')).toContainText('acceptance-error');
  await page.getByRole('button',{name:'Reset Code',exact:true}).click();await expect(page.locator('#lab-output')).toHaveAttribute('data-state','idle');await expect(page.locator('.lab-side [role=alert]')).toHaveCount(0);expect(errors).toEqual([]);
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});

test('editorial lesson keeps learning objectives and prerequisites accessible before its first explanation',async({page})=>{
 const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/_next/static/**/*.js',async route=>{await gate;await route.continue();});
 await page.setViewportSize({width:375,height:1000});
 try{
 await page.goto('/learn/linear-regression',{waitUntil:'commit'});
 const context=page.locator('.prerequisites'),preparation=context.locator('details');
 await expect(context.locator('summary')).toBeVisible();await expect(preparation).toHaveAttribute('inert','');
 const box=(await context.locator('summary').boundingBox())!;await page.mouse.click(box.x+box.width/2,box.y+box.height/2);await expect(preparation).not.toHaveAttribute('open','');
 release();await page.unrouteAll({behavior:'wait'});await expect(preparation).not.toHaveAttribute('inert','');
 await context.locator('summary').click();await expect(context).toContainText('Mục tiêu:');await expect(context).toContainText('hàm mất mát MSE');await expect(context.locator('a[href="/learn/derivatives"]')).toBeVisible();
 await context.locator('summary').click();await expect(page.locator('article.lesson h2').first()).toHaveText('Vấn đề thực tế');
 const focus=page.locator('.focus-toggle');await expect(focus).toHaveAccessibleName('Chế độ đọc tập trung');await focus.click();await expect(focus).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Thoát chế độ đọc tập trung',exact:true}).click();
 await page.goto('/courses');await page.getByLabel('Tìm kiếm',{exact:true}).fill('Nền tảng Toán');await page.getByRole('button',{name:'Lọc',exact:true}).click();await expect(page.locator('.course-card')).toHaveCount(1);await page.locator('.course-card h2 a').click();await expect(page.locator('main h1')).toContainText('Python');
 expect(errors).toEqual([]);
 }finally{release();await page.unrouteAll({behavior:'wait'});}
});
