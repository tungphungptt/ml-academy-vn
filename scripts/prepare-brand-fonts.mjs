// Full faces intentionally keep Vietnamese combining clusters in one font.
// The old split unicode-range files remain for cached-page compatibility.
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';
const local = process.platform === 'win32' ? '.local/font-tools/Scripts/python.exe' : '.local/font-tools/bin/python';
const python = process.env.FONTTOOLS_PYTHON || (fs.existsSync(local) ? local : 'python');
const result = spawnSync(python, ['scripts/build-brand-fonts.py'], { stdio: 'inherit', windowsHide: true });
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
