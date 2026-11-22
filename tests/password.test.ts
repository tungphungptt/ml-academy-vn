import test from "node:test";
import assert from "node:assert/strict";
import { newPasswordError } from "../src/lib/password";
import { validatePasswordChange, validateReset } from "../src/lib/validation";
test("new passwords respect bcrypt's UTF-8 limit without weakening legacy login", () => {
  assert.equal(newPasswordError('a'.repeat(72)), null);
  assert.match(newPasswordError('a'.repeat(73))!, /72 byte/);
  assert.equal(newPasswordError('ữ'.repeat(24)), null);
  assert.match(newPasswordError('ữ'.repeat(25))!, /72 byte/);
  assert.equal(validatePasswordChange({ current: 'oldpass123', next: 'ữ'.repeat(25) }).ok, false);
  assert.equal(validateReset({ token: 'a'.repeat(64), next: 'a'.repeat(73) }).ok, false);
});
