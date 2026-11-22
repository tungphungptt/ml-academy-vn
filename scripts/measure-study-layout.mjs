// Read-only Chromium measurement; fresh contexts, no synthetic Lighthouse score.
import {chromium} from '@playwright/test';
import fs from 'node:fs';
const base=process.env.STUDY_BASE_URL||'http://localhost:3000';
const browser=await chromium.launch({channel:'chrome'}),cases=[];
try{
 for(const theme of ['light','dark'])for(const width of [375,1440])for(const route of ['/','/learn/llm-foundations']){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  await context.addInitScript(theme=>{
   localStorage.setItem('theme',theme);
   window.__studyShifts=[];
   new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__studyShifts.push({value:e.value,at:e.startTime});}).observe({type:'layout-shift',buffered:true});
  },theme);
  // Deliberately slow fonts to expose fallback layout changes on a cold visit.
  await context.route('**/fonts/*.woff2',async r=>{await new Promise(resolve=>setTimeout(resolve,250));await r.continue();});
  const page=await context.newPage();await page.goto(base+route,{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1000);
  const sample=await page.evaluate(()=>({
   shifts:window.__studyShifts,overflow:document.documentElement.scrollWidth>innerWidth+1,
   bodyFont:getComputedStyle(document.body).fontFamily,headingFont:getComputedStyle(document.querySelector('main h1')).fontFamily,
   fonts:performance.getEntriesByType('resource').filter(e=>/\/fonts\/.*\.woff2/.test(e.name)).map(e=>({file:new URL(e.name).pathname,transferBytes:e.transferSize,durationMs:e.duration})),
  }));
  let max=0,total=0,start=0,last=0;for(const e of sample.shifts){if(e.at-last>1000||e.at-start>5000){start=e.at;total=0;}total+=e.value;last=e.at;max=Math.max(max,total);}
  cases.push({theme,width,route,fontDelayMs:250,cls:max,...sample});await context.close();
 }
 fs.writeFileSync('docs/neuralclone-refinement-layout-observation.json',JSON.stringify({checkedAt:new Date().toISOString(),browser:browser.version(),scope:'Chromium desktop cold contexts, 250ms artificial font delay; lab observation, not field Core Web Vitals or a device test',cases},null,2)+'\n');
 console.log(JSON.stringify(cases.map(({route,width,theme,cls,overflow})=>({route,width,theme,cls,overflow}))));
}finally{await browser.close();}
