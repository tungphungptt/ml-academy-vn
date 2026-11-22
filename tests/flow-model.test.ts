import test from 'node:test';import assert from 'node:assert/strict';
import {illustrativeForwardPass} from '../src/lib/flowModel';
test('illustrated MLP exposes the independently calculated 2–2–1 forward pass',()=>{
 // Sigmoid reference evaluated independently with Python Decimal, 45 digits.
 const m=illustrativeForwardPass();assert.ok(Math.abs(m.hidden[0]-.7)<1e-12);assert.ok(Math.abs(m.hidden[1]-.29)<1e-12);assert.ok(Math.abs(m.logit-.606)<1e-12);assert.ok(Math.abs(m.score-.6470278089459086)<1e-12);assert.equal(m.prediction,1);
 const negative=illustrativeForwardPass(-10,-10);assert.ok(negative.hidden.every(v=>v>=0));assert.ok(negative.score>0&&negative.score<1);
});
