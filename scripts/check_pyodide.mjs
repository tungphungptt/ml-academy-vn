// Real browser/WASM smoke test. Optional proxy mode keeps TLS verification on
// while downloading unchanged official CDN responses using Python's platform CA.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);
const proxyMode = process.argv.includes('--trusted-proxy-download');
const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const labs = JSON.parse(fs.readFileSync('content/labs.json', 'utf8'));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ml-pyodide-'));
const assets = new Map(), results = [];
const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH });
try {
  const context = await browser.newContext();
  if (proxyMode) await context.route('https://cdn.jsdelivr.net/pyodide/**', async route => {
    const url = route.request().url();
    try {
      if (!assets.has(url)) {
        const { stdout } = await run(process.env.CURRICULUM_FETCH_PYTHON || 'python3', ['-c', `import urllib.request,hashlib,json,sys,pathlib
u=sys.argv[1]
with urllib.request.urlopen(u,timeout=45) as r: d=r.read();s=r.status;t=r.headers.get('content-type','application/octet-stream')
f=pathlib.Path(sys.argv[2])/hashlib.sha256(u.encode()).hexdigest();f.write_bytes(d)
print(json.dumps({'url':u,'status':s,'type':t,'file':str(f),'sha256':hashlib.sha256(d).hexdigest(),'bytes':len(d)}))`, url, dir], { timeout: 50_000 });
        assets.set(url, JSON.parse(stdout));
      }
      const asset = assets.get(url);
      await route.fulfill({ status: asset.status, contentType: asset.type, body: fs.readFileSync(asset.file) });
    } catch (e) { console.error(`Asset failed: ${url}: ${e.message}`); await route.abort(); }
  });
  const page = await context.newPage();
  for (const lab of labs.filter(l => l.runtime === 'pyodide')) {
    await page.goto(`${baseURL}/lab?lab=${lab.id}`);
    for (const variant of lab.variants) {
      await page.getByRole('button', { name: variant === 'scratch' ? 'From Scratch' : 'Library-based', exact: true }).click();
      await page.getByRole('button', { name: '▶ Run' }).click();
      await page.getByText('Hoàn tất.', { exact: true }).waitFor({ timeout: 85_000 });
      const stdout = (await page.getByRole('heading', { name: 'Output', exact: true }).locator('xpath=following-sibling::pre[1]').innerText()).trim();
      const pass = stdout === lab.expected[variant];
      results.push({ id: lab.id, variant, stdout, expected: lab.expected[variant], pass });
      console.log(`${pass ? 'PASS' : 'FAIL'} ${lab.id}/${variant}: ${stdout}`);
    }
  }
  const report = { transport: proxyMode ? 'Official CDN assets fetched with Python TLS and platform CA, unchanged bytes fulfilled to browser; not a direct Chromium CDN/TLS test' : 'Direct Chromium CDN', assets: [...assets.values()].map(({ file, ...a }) => a), results };
  fs.writeFileSync('docs/curriculum-pyodide-execution.json', JSON.stringify(report, null, 1) + '\n');
  if (results.some(r => !r.pass)) process.exitCode = 1;
} finally {
  await browser.close(); fs.rmSync(dir, { recursive: true, force: true });
}
