import test from 'node:test';
import assert from 'node:assert/strict';
import { ensurePrismaClient } from '../scripts/ensure-prisma-client.mjs';
test('building unchanged Prisma schema does not rewrite a client used by the running server', () => {
  ensurePrismaClient(process.cwd(), () => { assert.fail('An unchanged generated client must not be regenerated.'); });
});
