import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import {createSessionFixture} from './fixtures';

async function openExperiment(page:import('@playwright/test').Page,slug:string){
 await page.goto('/learn/'+slug);
 await page.getByRole('button',{name:'Mở thí nghiệm',exact:true}).click();
 await expect(page.locator('[data-experiment]')).toBeVisible({timeout:30000});
 await page.getByText('Xem output đầy đủ (JSON)',{exact:true}).click();
}
test('foundation concepts display reference values and preserve boundary states',async({page})=>{
 for(const slug of ['vectors-matrices','numpy-pandas','statistics','bayesian-estimation','softmax-regression']){
  await openExperiment(page,slug);
  const result=JSON.parse(await page.locator('.experiment-output').innerText());
  if(slug==='vectors-matrices'){expect(result.dot).toBe(1);await page.getByRole('slider',{name:'aₓ',exact:true}).fill('0');expect(JSON.parse(await page.locator('.experiment-output').innerText()).cosine).toBeNull();}
  if(slug==='statistics'||slug==='numpy-pandas')expect(result.variance).toBeCloseTo(8/3,10);
  if(slug==='bayesian-estimation'){expect(result.mean).toBe(.625);await page.getByRole('slider',{name:'Số thử n',exact:true}).fill('0');expect(JSON.parse(await page.locator('.experiment-output').innerText()).mle).toBeNull();}
  if(slug==='softmax-regression')expect(result.loss).toBeCloseTo(.4076059644443804,10);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});
test('loss, logits, activations and existing experiments keep code, plots and results synchronized',async({page})=>{
 test.setTimeout(180000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 const output=async()=>JSON.parse(await page.locator('.experiment-output').innerText());
 await openExperiment(page,'loss-functions');expect((await output()).huber).toBe(1.5);
 await page.getByRole('slider',{name:'Sai số e = dự đoán − nhãn'}).fill('0');expect((await output()).dmae).toBeNull();await expect(page.locator('.experiment-scroll')).toContainText('Không khả vi tại 0');
 await page.getByRole('slider',{name:'Sai số e = dự đoán − nhãn'}).fill('-2');expect((await output()).dhuber).toBe(-1);
 await openExperiment(page,'logistic-regression');expect((await output()).loss).toBeCloseTo(Math.log(2),12);
 await page.getByRole('button',{name:'Chạy một bước',exact:true}).click();expect((await output()).z).toBeCloseTo(.25,12);expect((await output()).loss).toBeCloseTo(.5759394198788436,12);
 await expect(page.getByRole('slider',{name:'Trọng số w',exact:true})).toHaveValue('0.1');await expect(page.getByRole('slider',{name:'Bias b',exact:true})).toHaveValue('0.05');
 await page.getByRole('button',{name:'Đặt lại',exact:true}).click();await page.getByRole('slider',{name:'Learning rate η'}).fill('0');await page.getByRole('button',{name:'Chạy một bước',exact:true}).click();expect((await output()).loss).toBeCloseTo(Math.log(2),12);
 await page.getByLabel('Nhãn thật y').selectOption('0');expect((await output()).dw).toBe(1);
 await openExperiment(page,'activations');await page.getByRole('combobox',{name:'Hàm kích hoạt',exact:true}).selectOption('leaky');await page.getByRole('slider',{name:'Đầu vào x'}).fill('-2');expect((await output()).value).toBeCloseTo(-.02,12);expect((await output()).derivative).toBe(.01);
 await page.getByRole('slider',{name:'Đầu vào x'}).fill('0');await expect(page.getByRole('note')).toContainText('Không có đạo hàm cổ điển');await page.getByRole('slider',{name:'Độ dốc phía âm α'}).fill('1');expect((await output()).kink).toBe(false);
 for(const slug of ['derivatives','linear-regression','gradient-descent','backpropagation']){await openExperiment(page,slug);await expect(page.locator('.experiment-metrics')).toBeVisible();expect(Object.values(await output()).every(v=>typeof v!=='number'||Number.isFinite(v))).toBe(true);}
 expect(errors).toEqual([]);
});

test('reading and operating surfaces retain theme, math, focus and enlarged Vietnamese reflow',async({browser})=>{
 test.setTimeout(600000);
 for(const theme of ['light','dark'])for(const width of [375,768,1440,1920])for(const slug of ['loss-functions','logistic-regression','activations']){
  const context=await browser.newContext({baseURL:process.env.E2E_BASE_URL,viewport:{width,height:1000},reducedMotion:'reduce'});await context.addInitScript(t=>localStorage.setItem('theme',t),theme);const page=await context.newPage(),errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  await openExperiment(page,slug);await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);await expect(page.locator('.katex-error')).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const table=page.locator('.experiment-scroll');await table.focus();await expect(table).toBeFocused();
  if(await table.evaluate(e=>e.scrollWidth>e.clientWidth)){await page.keyboard.press('ArrowRight');await expect.poll(()=>table.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);}
  const plot=page.locator('.experiment-plot-scroll');await plot.focus();await expect(plot).toBeFocused();
  if(await plot.evaluate(e=>e.scrollWidth>e.clientWidth)){const caption=page.locator('.learning-experiment figcaption'),before=(await caption.boundingBox())!.x;await page.keyboard.press('ArrowRight');await expect.poll(()=>plot.evaluate(e=>e.scrollLeft)).toBeGreaterThan(0);expect(Math.abs((await caption.boundingBox())!.x-before)).toBeLessThan(1);}
  const glyphSize=await plot.locator('svg text').first().evaluate(e=>{const s=(e as SVGElement).ownerSVGElement!,m=s.getScreenCTM()!;return parseFloat(getComputedStyle(e).fontSize)*m.a;});expect(glyphSize).toBeGreaterThanOrEqual(13.9);
  expect(await page.locator('.prerequisites').evaluate(e=>!!(e.compareDocumentPosition(document.querySelector('article')!)&Node.DOCUMENT_POSITION_FOLLOWING))).toBe(true);
  const link=page.locator('.lesson p a').first();if(await link.count())expect(await link.evaluate(e=>getComputedStyle(e).textDecorationLine)).toContain('underline');
  await page.locator('.learning-experiment h3').evaluate(e=>e.textContent=e.textContent!.normalize('NFD'));await page.evaluate(()=>document.documentElement.style.fontSize='200%');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  expect(errors).toEqual([]);await context.close();
 }
});

test('quiz, threshold labels and lab stale outputs preserve the learning flow',async({page,context})=>{
 test.setTimeout(180000);await createSessionFixture(context,'learning-refinement','Fixture-password-2026!');
 await page.goto('/learn/loss-functions#quiz');
 const questions=JSON.parse(fs.readFileSync('content/quizzes/loss-functions.json','utf8')) as {correct:number}[];
 for(const [i,q]of questions.entries())await page.locator('#quiz fieldset').nth(i).locator(`label[data-option-index="${q.correct}"] input`).check();
 await page.getByRole('button',{name:'Nộp bài',exact:true}).click();await expect(page.locator('.quiz-result')).toContainText(`Điểm: ${questions.length}/${questions.length}`);
 await page.goto('/playground#threshold');await page.setViewportSize({width:375,height:1000});await page.locator('.threshold-chart').scrollIntoViewIfNeeded();
 const boxes=await page.locator('.threshold-plot g>text:first-child').evaluateAll(nodes=>nodes.map(node=>{const b=(node as SVGGraphicsElement).getBBox();return{x:b.x,right:b.x+b.width};}));expect(boxes.length).toBe(8);expect(boxes.every(b=>b.x>=0&&b.right<105)).toBe(true);
 for(const threshold of ['0','1']){await page.getByRole('slider',{name:'Ngưỡng quyết định',exact:true}).fill(threshold);const predicted=await page.locator('.threshold-plot circle[data-predicted=positive]').count();expect(predicted).toBe(threshold==='0'?8:0);}
 await page.getByRole('slider',{name:'Chi phí false positive'}).fill('0');await page.getByRole('slider',{name:'Chi phí false negative'}).fill('0');await expect(page.locator('[data-metric=cost]')).toHaveText('0');
 await page.route('**/pyodide-worker.js',route=>route.fulfill({contentType:'application/javascript',body:"self.onmessage=()=>{self.postMessage({type:'status',phase:'running'});self.postMessage({type:'done',out:'controlled-worker-output'});};"}));
 await page.goto('/lab?lab=linear_regression');await page.getByRole('button',{name:'Library-based',exact:true}).click();await expect(page.getByRole('button',{name:'Library-based',exact:true})).toHaveAttribute('aria-pressed','true');
 const editor=page.getByLabel('Code Python');await editor.fill('print(1)');await page.getByRole('button',{name:'▶ Run',exact:true}).click();await expect(page.locator('#lab-output')).toHaveAttribute('data-state','success');
 await editor.fill('print(2)');await expect(page.locator('#lab-output')).toHaveAttribute('data-state','stale');await expect(page.locator('.lab-status')).toContainText('Code đã thay đổi');await expect(page.locator('.lab-output')).toContainText('controlled-worker-output');
 await page.getByRole('button',{name:'▶ Run',exact:true}).click();await expect(page.locator('#lab-output')).toHaveAttribute('data-state','success');await expect(page.locator('.lab-status')).toContainText('Hoàn tất.');
 await page.getByLabel('Bài thực hành:').selectOption('logistic_regression');await expect(page).toHaveURL(/lab=logistic_regression/);
});
