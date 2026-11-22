// Read-only review against the current dev server and public domain.
import {chromium,webkit,firefox} from '@playwright/test';
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
const report={checkedAt:new Date().toISOString(),pages:[],errors:[],failedRequests:[],websockets:[],touch:[],available:{chrome:true,webkit:existsSync(webkit.executablePath()),firefox:existsSync(firefox.executablePath())}};
const routes=['/','/courses','/learn/imbalanced-learning','/learn/llm-foundations','/learn/responsible-ai','/learn/rag-vector-search','/learn/transfer-learning','/learn/transformer-architecture','/playground#threshold','/lab?lab=threshold_cost','/lab?lab=cnn_cpu','/lab?lab=rag_retrieval','/search?q=calibration','/login?next=%2Flearn%2Fimbalanced-learning%23quiz'];
const browser=await chromium.launch({channel:'chrome',headless:true});
try{
 for(const origin of ['http://localhost:3000','https://neuralclone.site']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  page.on('pageerror',e=>report.errors.push({origin,type:'page',message:e.message}));
  page.on('console',m=>{if(m.type()==='error')report.errors.push({origin,type:'console',message:m.text()});});
  page.on('requestfailed',r=>{if(r.failure()?.errorText!=='net::ERR_ABORTED')report.failedRequests.push({origin,path:new URL(r.url()).pathname,error:r.failure()?.errorText});});
  const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');
  cdp.on('Network.webSocketHandshakeResponseReceived',e=>report.websockets.push({origin,status:e.response.status}));
  for(const route of routes){
   const response=await page.goto(origin+route,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
   const data=await page.evaluate(()=>({title:document.querySelector('main h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1,mathErrors:document.querySelectorAll('.katex-error').length}));
   report.pages.push({origin,route,status:response.status(),...data});
  }
  await page.close();
  const context=await browser.newContext({viewport:{width:375,height:812},isMobile:true,hasTouch:true,deviceScaleFactor:2});
  const mobile=await context.newPage();await mobile.goto(origin,{waitUntil:'networkidle'});
  const toggle=mobile.getByRole('button',{name:'Mở hoặc đóng menu',exact:true});
  await toggle.tap();await mobile.locator('#menu a[href="/courses"]').tap();await mobile.waitForURL('**/courses');
  const box=await toggle.boundingBox();
  report.touch.push({origin,engine:'Chromium; touch/viewport emulation, no physical device',menuNavigation:await mobile.locator('main h1').innerText(),menuTarget:box,overflow:await mobile.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)});
  await context.close();
 }
 for(const url of ['https://pytorch.org/get-started/locally/','https://github.com/tungphungptt/ml-academy-vn/blob/main/docs/curriculum-practice.md']){
  try{const r=await fetch(url,{signal:AbortSignal.timeout(20000)});report.pages.push({url,status:r.status,purpose:url.includes('github')?'old external CPU guide':'new official installation reference'});}catch(e){report.pages.push({url,error:e.message});}
 }
}finally{await browser.close();}
await fs.writeFile('docs/neuralclone-polish-browser.json',JSON.stringify(report,null,2)+'\n');
const pageFailures=report.pages.filter(p=>p.origin&&(p.status!==200||p.overflow||p.mathErrors));
console.log(JSON.stringify({pages:report.pages.length,errors:report.errors,failedRequests:report.failedRequests,handshakes:report.websockets.map(w=>w.status),pageFailures,touch:report.touch,available:report.available},null,2));
if(report.errors.length||report.failedRequests.length||pageFailures.length)process.exitCode=1;
