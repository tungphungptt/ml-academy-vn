import {chromium,webkit} from '@playwright/test';
import fs from 'node:fs';
const report={checkedAt:new Date().toISOString(),scope:'Windows headless touchscreen/viewport emulation, not physical iOS/Android',engines:[]};
for(const type of [chromium,webkit]){
 const browser=await type.launch(type===chromium?{channel:'chrome'}:{}),context=await browser.newContext({viewport:{width:375,height:1000},hasTouch:true,isMobile:true,reducedMotion:'reduce'}),page=await context.newPage();
 const entry={engine:type.name(),version:browser.version(),errors:[],menuTap:false,navigationTap:false,themeTap:false};
 page.on('pageerror',e=>entry.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')entry.errors.push(m.text());});
 await page.goto('http://localhost:3000/courses',{waitUntil:'networkidle'});
 const menu=page.getByRole('button',{name:'Mở hoặc đóng menu'});await menu.tap();entry.menuTap=await menu.getAttribute('aria-expanded')==='true';
 await page.locator('#menu').getByRole('link',{name:'Code Lab',exact:true}).tap();await page.waitForURL('**/lab');entry.navigationTap=true;
 await menu.tap();const theme=await page.locator('html').getAttribute('data-theme');await page.getByRole('button',{name:'Đổi giao diện sáng/tối'}).tap();entry.themeTap=theme!==await page.locator('html').getAttribute('data-theme');
 fs.mkdirSync('docs/screenshots/apple-touch',{recursive:true});await page.screenshot({path:`docs/screenshots/apple-touch/${type.name()}-375.png`});
 report.engines.push(entry);await browser.close();
}
fs.writeFileSync('docs/neuralclone-apple-touch.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));if(report.engines.some(e=>e.errors.length||!e.menuTap||!e.navigationTap||!e.themeTap))process.exitCode=1;
