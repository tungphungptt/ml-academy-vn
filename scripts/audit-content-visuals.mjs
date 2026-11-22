import {chromium} from '@playwright/test';
import fs from 'node:fs/promises';
const option=(name,fallback)=>{const i=process.argv.indexOf(name);if(i<0)return fallback;if(!process.argv[i+1])throw new Error(`${name} requires a path`);return process.argv[i+1];};
const directory=option('--screenshots','docs/screenshots/new-content');
const reportPath=option('--report','docs/neuralclone-content-visuals.json');
await fs.mkdir(directory,{recursive:true});
const topics=JSON.parse(await fs.readFile('docs/neuralclone-new-topics.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={checkedAt:new Date().toISOString(),screens:[],errors:[]};
try {
  for(const theme of ['dark','light']) for(const width of [375,768,1440,1920]){
    const page=await browser.newPage({viewport:{width,height:1000},reducedMotion:'reduce'});
    await page.addInitScript(t=>localStorage.setItem('theme',t),theme);
    page.on('pageerror',e=>report.errors.push(e.message));
    const cdp=await page.context().newCDPSession(page);
    await cdp.send('DOM.enable');await cdp.send('CSS.enable');
    for(const topic of topics){
      const response=await page.goto(`http://localhost:3000/learn/${topic.slug}`,{waitUntil:'networkidle'});
      await page.evaluate(()=>document.fonts.ready);
      const {root}=await cdp.send('DOM.getDocument');
      const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'main h1,article.lesson h2'});
      const fonts=[];
      for(const nodeId of nodeIds) fonts.push((await cdp.send('CSS.getPlatformFontsForNode',{nodeId})).fonts);
      const geometry=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+1,mathErrors:document.querySelectorAll('.katex-error').length,theme:document.documentElement.dataset.theme}));
      const prefix=`${directory}/${topic.slug}-${theme}-${width}`;
      await page.screenshot({path:`${prefix}-heading.png`});
      await page.locator('article.lesson figure').first().screenshot({path:`${prefix}-figure.png`});
      report.screens.push({slug:topic.slug,theme,width,status:response.status(),...geometry,fonts});
    }
    await page.close();
  }
}finally{await browser.close();}
report.summary={screens:report.screens.length,overflow:report.screens.filter(s=>s.overflow).length,mathErrors:report.screens.reduce((s,r)=>s+r.mathErrors,0),mixedHeadingFonts:report.screens.flatMap(s=>s.fonts).filter(fonts=>new Set(fonts.map(f=>f.familyName)).size!==1).length};
await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({summary:report.summary,errors:report.errors}));
if(report.errors.length || report.summary.overflow || report.summary.mathErrors || report.summary.mixedHeadingFonts) process.exitCode=1;
