import { test, expect } from '@playwright/test';
import fs from 'node:fs';
const samples = ['Bắt đầu từ điều bạn tò mò.', 'Học máy. Hiểu từ gốc.', 'Đường cong mất mát và tối ưu hóa.', 'Tiền xử lý dữ liệu.', 'Mạng nơ-ron nhân tạo.', 'Hồi quy tuyến tính và phân loại.', 'Khám phá trí tuệ nhân tạo.', 'Những điều cần biết trước khi bắt đầu.'];
test('Vietnamese NFC/NFD, bold and italic retain one intended font per run at all widths/themes', async ({ browser }) => {
  test.setTimeout(180000);
  for (const theme of ['light', 'dark']) for (const width of [375,768,1440,1920]) {
    const page = await browser.newPage({ viewport:{width,height:1000}, reducedMotion:'reduce' });
    await page.addInitScript(t=>localStorage.setItem('theme',t),theme);
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    const session = await page.context().newCDPSession(page);
    await session.send('DOM.enable'); await session.send('CSS.enable');
    const css=fs.readFileSync('src/app/fonts.css','utf8');
    await page.route('**/__font-review',route=>route.fulfill({contentType:'text/html',body:`<!doctype html><html lang="vi"><meta charset="utf-8"><style>${css}*{box-sizing:border-box}body{margin:0}main{padding:16px}</style><main></main></html>`}));
    await page.goto('/__font-review');
    await page.evaluate(samples=>{
      const main=document.querySelector('main')!; main.replaceChildren();
      for(const [family,weight,style]of [['Lora',500,'normal'],['Lora',600,'normal'],['Lora',500,'italic'],['Be Vietnam Pro',400,'normal'],['Be Vietnam Pro',600,'normal'],['Be Vietnam Pro',400,'italic'],['Be Vietnam Pro',700,'italic']])for(const size of [24,36,64]) for(const text of [...samples,'TRÍ TUỆ NHÂN TẠO','Học có giám sát. Lan truyền ngược. Ngưỡng quyết định.']) for(const form of ['NFC','NFD'] as const){
        const h=document.createElement('h2'); h.dataset.sample=form; h.textContent=text.normalize(form);
        h.dataset.family=String(family);h.style.cssText=`font: ${style} ${weight} ${size}px/1.65 "${family}";letter-spacing:-.015em;margin:16px 0;overflow-wrap:anywhere`;
        main.append(h);
      }
    },samples);
    await page.evaluate(()=>document.fonts.ready);
    const {root}=await session.send('DOM.getDocument');
    const {nodeIds}=await session.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector:'[data-sample]'});
    for(const nodeId of nodeIds){
      const {fonts}=await session.send('CSS.getPlatformFontsForNode',{nodeId});
      expect(fonts.length).toBe(1);
      expect(fonts[0].isCustomFont).toBe(true);
      expect(fonts[0].postScriptName).toMatch(/^(Lora|BeVietnamPro)/);
    }
    const widths=await page.locator('[data-sample]').evaluateAll(els=>els.map(el=>{const r=document.createRange();r.selectNodeContents(el);return r.getBoundingClientRect().width;}));
    for(let i=0;i<widths.length;i+=2) expect(Math.abs(widths[i]-widths[i+1]),`${theme}/${width}/pair ${i/2}`).toBeLessThan(.1);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.close();
  }
});
