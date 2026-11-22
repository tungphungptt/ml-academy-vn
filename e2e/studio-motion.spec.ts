import {test,expect} from '@playwright/test';import fs from 'node:fs';
test('data-flow motion pauses at its presentation value, steps, stops offscreen and respects reduced motion',async({browser},info)=>{
 test.setTimeout(120000);fs.mkdirSync('docs/traces',{recursive:true});
 const context=await browser.newContext({baseURL:process.env.E2E_BASE_URL,viewport:{width:960,height:900},reducedMotion:'no-preference',...(info.project.name==='chrome'?{recordVideo:{dir:'docs/videos/refinement',size:{width:960,height:720}}}:{})});
 if(info.project.name==='chrome')await context.tracing.start({screenshots:true,snapshots:true,sources:true});
 const page=await context.newPage(),errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 try{
  await page.goto('/');const flow=page.locator('.knowledge-flow');await expect(flow).toBeVisible();
  // Numeric labels remain readable while a processing stage is inactive.
  await expect(flow.locator('.flow-node').last()).toHaveCSS('opacity','1');
  await page.waitForFunction(()=>[...document.querySelectorAll('[data-packet]')].flatMap(e=>e.getAnimations()).some(a=>Number(a.currentTime)>40&&Number(a.currentTime)<300));
  await page.getByRole('button',{name:'Tạm dừng minh họa',exact:true}).click();
  const current=()=>flow.locator('[data-packet]').evaluateAll(es=>es.flatMap(e=>e.getAnimations()).map(a=>({time:Number(a.currentTime),state:a.playState})));
  const paused=await current();expect(paused.length).toBeGreaterThan(0);expect(paused.every(a=>a.state==='paused')).toBe(true);
  await page.waitForTimeout(220);expect((await current()).map(a=>a.time)).toEqual(paused.map(a=>a.time));
  await page.getByRole('button',{name:'Phát minh họa',exact:true}).click();
  await expect.poll(async()=>Math.max(...(await current()).map(a=>a.time))).toBeGreaterThan(Math.max(...paused.map(a=>a.time))+50);
  await page.getByRole('button',{name:'Từng bước',exact:true}).click();await expect(flow).toHaveAttribute('data-flow-step','2');
  await page.getByRole('button',{name:'Từng bước',exact:true}).click();await expect(flow).toHaveAttribute('data-flow-step','3');
  await page.getByRole('button',{name:'Phát minh họa',exact:true}).click();await page.locator('.studio-invitation').scrollIntoViewIfNeeded();
  await expect(flow).toHaveAttribute('data-animating','false');const offscreen=await flow.getAttribute('data-flow-step');await page.waitForTimeout(1600);await expect(flow).toHaveAttribute('data-flow-step',offscreen!);
  await flow.scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'reduce'});await expect(flow).toHaveAttribute('data-animating','false');
  await expect(page.getByRole('button',{name:'Từng bước',exact:true})).toBeVisible();await expect(flow.locator('.flow-play')).toBeHidden();
  await page.getByRole('button',{name:'Từng bước',exact:true}).click();await page.locator('.flow-calculation summary').click();await expect(flow.locator('.flow-calculation')).toContainText('0.6470');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);expect(errors).toEqual([]);
  fs.writeFileSync(`docs/neuralclone-refinement-${info.project.name}-motion.json`,JSON.stringify({checkedAt:new Date().toISOString(),browser:info.project.name,version:browser.version(),video:await page.video()?.path(),pausedSamples:paused,offscreenStep:offscreen,errors,scope:'Windows desktop engine, no physical device test'},null,2)+'\n');
 }finally{if(info.project.name==='chrome')await context.tracing.stop({path:'docs/traces/neuralclone-refinement-chrome.zip'});await context.close();}
});
