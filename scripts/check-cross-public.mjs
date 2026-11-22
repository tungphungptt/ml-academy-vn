// Anonymous checks only; no registration, auth writes or personal DB mutations.
import {firefox,webkit} from '@playwright/test';
import fs from 'node:fs/promises';
const mathOnly=process.argv.includes('--math-only');
const argument=(name,fallback)=>{const i=process.argv.indexOf(name);if(i<0)return fallback;if(!process.argv[i+1])throw new Error(`${name} requires a path`);return process.argv[i+1];};
const reportPath=argument('--report',mathOnly?'docs/neuralclone-cross-public-math.json':'docs/neuralclone-cross-public.json');
const screenshotDir=argument('--screenshots','docs/screenshots/cross-browser');
const engineFilter=argument('--engine','all');
if(!['all','firefox','webkit'].includes(engineFilter))throw new Error('Unsupported engine');
const report={checkedAt:new Date().toISOString(),engines:[]};
for(const type of [firefox,webkit].filter(type=>engineFilter==='all'||type.name()===engineFilter)){
 const entry={engine:type.name(),version:null,cases:[],errors:[],requests:[],websocketFrames:0,websocketErrors:[]};
 let browser;
 try{
  browser=await type.launch({headless:true});entry.version=browser.version();
  for(const origin of ['http://localhost:3000','https://neuralclone.site'])for(const [theme,width] of [['dark',375],['light',1440]]){
   const context=await browser.newContext({viewport:{width,height:1000},colorScheme:theme,reducedMotion:'reduce',...(type.name()==='webkit'&&width===375?{isMobile:true,hasTouch:true,deviceScaleFactor:2}:{})});
   await context.addInitScript(t=>localStorage.setItem('theme',t),theme);
   const page=await context.newPage();
   page.on('pageerror',e=>entry.errors.push({origin,message:e.message}));
   page.on('console',m=>{if(m.type()==='error')entry.errors.push({origin,message:m.text()});});
   page.on('requestfailed',r=>{const error=r.failure()?.errorText??'';if(!/ERR_ABORTED|NS_BINDING_ABORTED|cancelled|canceled/i.test(error))entry.requests.push({origin,path:new URL(r.url()).pathname,error});});
   page.on('websocket',s=>{if(s.url().includes('/_next/hmr')){s.on('framereceived',()=>entry.websocketFrames++);s.on('socketerror',e=>entry.websocketErrors.push({origin,error:String(e)}));}});
   for(const route of mathOnly?['/learn/llm-foundations']:['/','/learn/llm-foundations','/lab?lab=threshold_cost','/playground#threshold']){
    console.log(`${type.name()} ${origin} ${theme}/${width} ${route}`);
    const response=await page.goto(origin+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
    if(response?.status()!==200){entry.cases.push({origin,route,theme,width,status:response?.status()});throw new Error(`HTTP ${response?.status()} for ${origin+route}`);}
    const data=await page.evaluate(()=>({title:document.querySelector('main h1')?.textContent,theme:document.documentElement.dataset.theme,overflow:document.documentElement.scrollWidth>innerWidth+1,mathErrors:document.querySelectorAll('.katex-error').length}));
    if(mathOnly){
     const formula=page.locator('.katex-display').first();
     if(await formula.getAttribute('tabindex')!=='0')throw new Error('Formula missing keyboard access');
     await formula.focus();await page.keyboard.press('ArrowRight');
     if(width===375)await page.waitForFunction(()=>document.querySelector('.katex-display').scrollLeft>0);
     data.formula=await formula.evaluate(el=>({tabIndex:el.tabIndex,role:el.getAttribute('role'),scrollLeft:el.scrollLeft,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth}));
     await formula.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
    }
    if(route.includes('/lab')&&origin.startsWith('https')){
     await page.bringToFront();await page.getByRole('button',{name:'▶ Run',exact:true}).click();
     const deadline=Date.now()+390000,states=[];let terminal=false;
     while(Date.now()<deadline){
      const state=await page.evaluate(()=>({status:document.querySelector('.lab-status')?.textContent??'',visibility:document.visibilityState}));
      if(states.at(-1)?.status!==state.status){states.push({...state,at:new Date().toISOString()});console.log(type.name(),state.status);}
      if(/Hoàn tất\.|Lỗi\.|Đã dừng\./.test(state.status)){terminal=true;break;}
      // Read from Node at a bounded interval; do not depend on background RAF.
      await new Promise(resolve=>setTimeout(resolve,500));
     }
     data.pyodideStates=states;
     if(!terminal)throw new Error('Pyodide timeout; last observed state: '+JSON.stringify(states.at(-1)));
     if(!(await page.locator('.lab-status').innerText()).includes('Hoàn tất.'))throw new Error((await page.locator('.lab-side [role=alert]').allTextContents()).join('\n'));
     data.pyodideOutput=await page.locator('.lab-output').innerText();
     if(!data.pyodideOutput.includes('threshold=0.5 TP=2 FP=2 FN=1 cost=6'))throw new Error('Public Pyodide output mismatch');
    }
    entry.cases.push({origin,route,theme,width,status:response.status(),emulation:type.name()==='webkit'&&width===375?'WebKit desktop with touch/viewport emulation; not physical iOS':'Desktop engine with viewport size',...data});
   }
   await fs.mkdir(screenshotDir,{recursive:true});
   await page.screenshot({path:`${screenshotDir}/public-${mathOnly?'math-':''}${type.name()}-${origin.startsWith('https')?'live':'local'}-${theme}-${width}.png`});
   await context.close();
  }
 }catch(error){entry.failure=String(error);}
 finally{await browser?.close();report.engines.push(entry);}
}
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report.engines.map(e=>({engine:e.engine,version:e.version,cases:e.cases.length,errors:e.errors,requests:e.requests,frames:e.websocketFrames,websocketErrors:e.websocketErrors,failure:e.failure})),null,2));
if(report.engines.some(e=>e.failure||e.errors.length||e.requests.length||e.websocketErrors.length||e.websocketFrames===0||e.cases.some(c=>c.status!==200||c.overflow||c.mathErrors)))process.exitCode=1;
