// Playwright owns this server. No personal database, admin credentials, content
// overrides or running development server is reused by the test suite.
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const database = process.env.DATABASE_URL ?? '';
if (process.env.NEURALCLONE_E2E !== '1' || !/^file:.*[/\\]ml-curriculum-e2e-[^/\\]+[/\\][^/\\]+\.db$/.test(database)) throw new Error('Refusing non-fixture E2E database.');
const port = Number(process.argv[2]);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 3000) throw new Error('Invalid E2E port.');
await mkdir(path.dirname(database.slice(5)), { recursive: true });
const env = { ...process.env, ADMIN_EMAIL: '', ADMIN_PASSWORD: '', COOKIE_SECURE: 'false' };
async function command(file, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], { env, stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${file} exited ${code}`)));
  });
}
await command('node_modules/prisma/build/index.js', ['migrate', 'deploy']);
await command('node_modules/tsx/dist/cli.mjs', ['prisma/seed.ts']);
await command('node_modules/next/dist/bin/next', ['build']);
await command('node_modules/next/dist/bin/next', ['start', '--hostname', '127.0.0.1', '--port', String(port)]);
