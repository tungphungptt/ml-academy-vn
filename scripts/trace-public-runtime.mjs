// Four planned observations: local/public × cold/reload. No hidden retries.
import {webkit} from '@playwright/test';import fs from 'node:fs';import os from 'node:os';
const out=process.argv[process.argv.indexOf('--report')+1];if(!process.argv.includes('--report')||!out)throw new Error('--report required to preserve historical evidence');
const expected=JSON.parse(fs.readFileSync('content/labs.json')).find(l=>l.id==='threshold_cost').expected.scratch;
const browser=await webkit.launch(),report={startedAt:new Date().toISOString(),browser:'WebKit',version:browser.version(),observationLimitMs:120000,applicationLoadingLimitMs:300000,applicationExecutionLimitMs:90000,cases:[]};
for(const origin of ['http://localhost:3000','https://neuralclone.site']){
 const context=await browser.newContext({viewport:{width:375,height:1000},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage();let entry;
 page.on('console',m=>{if(m.type()==='error'&&entry)entry.console.push(m.text());});page.on('pageerror',e=>entry?.console.push(e.message));
 page.on('response',r=>{if(entry&&(r.status()>=400||r.url().includes('pyodide')))entry.responses.push({at:new Date().toISOString(),path:new URL(r.url()).pathname,status:r.status(),server:r.headers().server});});
 page.on('requestfailed',r=>entry?.failedRequests.push({at:new Date().toISOString(),path:new URL(r.url()).pathname,error:r.failure()?.errorText}));
 page.on('requestfinished',r=>{if(entry&&r.url().includes('pyodide'))entry.downloads.push({path:new URL(r.url()).pathname,timing:r.timing()});});
 page.on('websocket',s=>{if(s.url().includes('/_next/hmr')){s.on('framereceived',()=>{if(entry)entry.hmrFrames++;});s.on('socketerror',e=>entry?.socketErrors.push(String(e)));}});
 for(const mode of ['cold','reload']){
  entry={origin,mode,startedAt:new Date().toISOString(),freeMemoryAtStart:os.freemem(),totalMemory:os.totalmem(),console:[],responses:[],failedRequests:[],downloads:[],states:[],hmrFrames:0,socketErrors:[]};console.log(origin,mode,'begin');const started=Date.now();
  try{
   const parallelHTTP=Promise.all([origin,'http://localhost:3000'].map(async base=>{try{const t=Date.now(),r=await fetch(base+'/api/health',{signal:AbortSignal.timeout(15000)});return{origin:base,status:r.status,elapsedMs:Date.now()-t,server:r.headers.get('server'),ray:r.headers.get('cf-ray')};}catch(e){return{origin:base,error:String(e)};}}));
   const response=mode==='cold'?await page.goto(origin+'/lab?lab=threshold_cost',{waitUntil:'networkidle',timeout:30000}):await page.reload({waitUntil:'networkidle',timeout:30000});entry.http={status:response.status(),server:response.headers().server,ray:response.headers()['cf-ray']};entry.health=await parallelHTTP;
   if(response.status()!==200){entry.classification='HTTP document failure';continue;}
   await page.bringToFront();await page.getByRole('button',{name:'▶ Run',exact:true}).click();const deadline=Date.now()+120000;let terminal=false;
   while(Date.now()<deadline){const state=await page.evaluate(()=>({status:document.querySelector('.lab-status')?.textContent??'',visibility:document.visibilityState}));if(entry.states.at(-1)?.status!==state.status){entry.states.push({...state,at:new Date().toISOString()});console.log(origin,mode,state.status);}if(/Hoàn tất\.|Lỗi\.|Đã dừng\./.test(state.status)){terminal=true;break;}await new Promise(r=>setTimeout(r,500));}
   entry.stdout=(await page.locator('.lab-output').innerText()).trim();entry.matchesExpected=entry.stdout===expected;
   entry.classification=terminal?(entry.matchesExpected?'Completed with exact output':'Application terminal error/output mismatch'):'Tool observation limit; not an application timeout';
   if(!terminal){const stop=page.getByRole('button',{name:'■ Stop',exact:true});if(await stop.count())await stop.click();}
  }catch(e){entry.classification='Browser/automation exception';entry.error=String(e);}
  finally{entry.endedAt=new Date().toISOString();entry.elapsedMs=Date.now()-started;entry.freeMemoryAtEnd=os.freemem();report.cases.push(entry);fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');console.log(origin,mode,entry.classification);}
 }
 await context.close();
}
await browser.close();console.log(JSON.stringify(report.cases.map(c=>({origin:c.origin,mode:c.mode,http:c.http,classification:c.classification,elapsedMs:c.elapsedMs,hmrFrames:c.hmrFrames}))));
