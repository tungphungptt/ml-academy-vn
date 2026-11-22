import {test,expect} from '@playwright/test';
import {createSessionFixture} from './fixtures';
test('exhibition remains accessible after login without replacing personal progress',async({page,context})=>{
 await createSessionFixture(context,'exhibition','Exhibition-fixture-2026!');
 await page.goto('/');await expect(page.locator('h1')).toHaveText('Tiến độ của bạn');
 await page.getByRole('link',{name:'Triển lãm AI',exact:true}).click();
 await expect(page).toHaveURL(/\/explore$/);await expect(page.locator('h1')).toContainText('Hiểu AI.');
 await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href','https://neuralclone.site/explore');
 await page.locator('.brand').first().click();await expect(page.locator('h1')).toHaveText('Tiến độ của bạn');
});
test('sculpture responds to selection, rotation, interrupted motion and real scroll chapters',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setViewportSize({width:1440,height:1000});await page.goto('/');
 const art=page.locator('.neural-sculpture').first(),canvas=art.locator('canvas');await expect(canvas).toHaveAttribute('data-rendered','true');
 const regions=art.getByRole('group',{name:'Khám phá khối neural'});
 await regions.getByRole('button',{name:/Lớp biểu diễn/}).click();await expect(art.locator('figcaption strong')).toHaveText('Lớp biểu diễn');
 const before=await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL());
 await art.getByRole('button',{name:'Xoay khối sang phải'}).click();await art.getByRole('button',{name:'Xoay khối sang trái'}).click();
 await expect.poll(()=>canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL())).not.toBe(before);
 await art.getByRole('button',{name:'Dừng chuyển động',exact:true}).click();await expect(canvas).toHaveAttribute('data-animating','false',{timeout:5000});
 const paused=await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL());await page.waitForTimeout(200);expect(await canvas.evaluate(c=>(c as HTMLCanvasElement).toDataURL())).toBe(paused);
 await art.getByRole('button',{name:'Tiếp tục chuyển động',exact:true}).click();await expect(canvas).toHaveAttribute('data-animating','true');
 for(const [id,stage]of [['journey-model','1'],['journey-learning','2'],['journey-prediction','3']]){await page.locator(`.journey-index a[href="#${id}"]`).click();await expect(art).toHaveAttribute('data-stage',stage);}
 await page.locator('.site-footer').scrollIntoViewIfNeeded();await expect(canvas).toHaveAttribute('data-animating','false');
 expect(errors).toEqual([]);
});
test('static fallback, reduced motion and mobile chapter controls preserve access to the artwork',async({browser})=>{
 for(const fallback of [false,true]){
  const context=await browser.newContext({viewport:{width:375,height:1000},reducedMotion:'reduce'});
  if(fallback)await context.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,...args:Parameters<typeof original>){if(args[0]==='2d')return null;return original.apply(this,args);} as typeof original;});
  const page=await context.newPage();await page.goto('/');
  const art=page.locator('.neural-sculpture').first();await art.scrollIntoViewIfNeeded();
  await art.getByRole('button',{name:/Những kết nối/}).click();await expect(art.locator('figcaption strong')).toHaveText('Những kết nối');
  await page.getByLabel('Cấu trúc đang xem').selectOption('3');await expect(art).toHaveAttribute('data-stage','3');
  await page.evaluate(()=>new Promise<void>(resolve=>{scrollBy(0,15);requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()));}));await expect(page.getByLabel('Cấu trúc đang xem')).toHaveValue('3');
  if(fallback){await expect(art.locator('.sculpture-fallback')).toBeVisible();await expect(art.locator('figcaption')).toContainText('Chế độ hình tĩnh');}
  else{await expect(art.locator('canvas')).toHaveAttribute('data-rendered','true');await expect(art.locator('canvas')).toHaveAttribute('data-animating','false');}
  await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  await context.close();
 }
});
