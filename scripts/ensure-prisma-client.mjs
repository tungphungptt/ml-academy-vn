import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function ensurePrismaClient(root = process.cwd(), run = spawnSync) {
  const source = path.join(root, 'prisma/schema.prisma');
  const generated = path.join(root, 'node_modules/.prisma/client/schema.prisma');
  // Prisma reformats its stored schema. Ignore formatting/comments while
  // preserving quoted defaults and every non-whitespace schema token.
  const normalized = file => fs.readFileSync(file, 'utf8').replace(/"(?:\\.|[^"\\])*"|\/\/[^\n]*|\/\*[\s\S]*?\*\/|\s+/g, token => token.startsWith('"') ? token : '');
  let ready = false;
  try {
    const require = createRequire(path.join(root, 'package.json'));
    const { Prisma } = require('@prisma/client');
    ready = Prisma.prismaVersion.client === require('@prisma/client/package.json').version && normalized(source) === normalized(generated);
  } catch { /* Initial setup or changed schema requires generation below. */ }
  if (ready) { console.log('Prisma Client matches schema; no regeneration required.'); return; }
  const result = run(process.execPath, [path.join(root, 'node_modules/prisma/build/index.js'), 'generate'], { cwd: root, stdio: 'inherit', windowsHide: true });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Prisma generation failed. If Windows reports a locked DLL, stop servers using this client, run npm run db:generate, then retry.');
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { ensurePrismaClient(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
