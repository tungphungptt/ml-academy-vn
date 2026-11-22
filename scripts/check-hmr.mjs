// Explicit development-only browser check; never runs in the production E2E suite.
// The temporary text edit is restored byte-for-byte even if a browser check fails.
import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
import path from 'node:path';
const file=path.resolve('src/components/Landing.tsx');
const original=await fs.readFile(file),source=original.toString('utf8');
const needle='Bắt đầu từ điều bạn tò mò.',marker='Kiểm chứng HMR — tiếng Việt vẫn rõ.';
if(!source.includes(needle)||source.includes(marker))throw new Error('Expected original heading missing; refusing to alter source.');
const beforeHash=crypto.createHash('sha256').update(original).digest('hex');
const argument=(name,fallback)=>{const i=process.argv.indexOf(name);if(i<0)return fallback;if(!process.argv[i+1])throw new Error(`${name} requires a path`);return process.argv[i+1];};
const reportPath=argument('--report','docs/neuralclone-polish-hmr-browser.json');
const browser=await chromium.launch({channel:process.env.PLAYWRIGHT_CHANNEL||'chrome',headless:true});
const pages=[],report={checkedAt:new Date().toISOString(),cases:[],restored:false};
const evidence=argument('--screenshots','docs/screenshots/final-polish');await fs.mkdir(evidence,{recursive:true});
try{
 for(const origin of ['http://localhost:3000','https://neuralclone.site']){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const entry={origin,handshakes:[],frames:[],errors:[]};
  const cdp=await page.context().newCDPSession(page);await cdp.send('Network.enable');
  cdp.on('Network.webSocketHandshakeResponseReceived',e=>entry.handshakes.push({status:e.response.status,url:e.response.url}));
  page.on('websocket',socket=>{if(socket.url().includes('/_next/hmr'))socket.on('framereceived',e=>entry.frames.push(String(e.payload).slice(0,160)));});
  page.on('pageerror',e=>entry.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')entry.errors.push(m.text());});
  await page.goto(origin,{waitUntil:'networkidle'});
  await page.getByRole('heading',{name:needle,exact:true}).waitFor();
  await page.waitForFunction(()=>window.next?.version!==undefined);
  await page.evaluate(()=>{window.__neuralcloneHmrProof='retained-client-state';});
  pages.push(page);report.cases.push(entry);
 }
 if(!report.cases.every(c=>c.handshakes.some(h=>h.status===101)))throw new Error('Both development HMR sockets must connect before changing source.');
 await fs.writeFile(file,source.replace(needle,marker));
 for(let i=0;i<pages.length;i++){
  await pages[i].getByRole('heading',{name:marker,exact:true}).waitFor({timeout:45000});
  report.cases[i].changedWithoutNavigation=await pages[i].evaluate(()=>window.__neuralcloneHmrProof==='retained-client-state');
  await pages[i].getByRole('heading',{name:marker,exact:true}).screenshot({path:`${evidence}/hmr-${i?'live':'local'}-temporary.png`});
 }
}finally{
 await fs.writeFile(file,original);
 try{
  for(let i=0;i<pages.length;i++){
   await pages[i].getByRole('heading',{name:needle,exact:true}).waitFor({timeout:45000});
   report.cases[i].restoredWithoutNavigation=await pages[i].evaluate(()=>window.__neuralcloneHmrProof==='retained-client-state');
   await pages[i].getByRole('heading',{name:needle,exact:true}).screenshot({path:`${evidence}/hmr-${i?'live':'local'}-restored.png`});
  }
 }finally{
  report.restored=crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex')===beforeHash;
  await browser.close();await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
 }
}
const passed=report.restored&&report.cases.length===2&&report.cases.every(c=>c.changedWithoutNavigation&&c.restoredWithoutNavigation&&c.handshakes.some(h=>h.status===101)&&!c.errors.length);
console.log(JSON.stringify({passed,restored:report.restored,cases:report.cases.map(c=>({origin:c.origin,handshakes:c.handshakes,frames:c.frames.length,changed:c.changedWithoutNavigation,restored:c.restoredWithoutNavigation,errors:c.errors}))},null,2));
if(!passed)process.exitCode=1;
