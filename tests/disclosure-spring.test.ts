import test from 'node:test';
import assert from 'node:assert/strict';
import {stepDisclosureSpring} from '../src/lib/disclosureSpring';
test('disclosure spring settles without overshoot and a reversal inherits its live velocity',()=>{
 let state={position:0,velocity:0};
 for(let i=0;i<7;i++)state=stepDisclosureSpring(state,1,1/60);
 assert.ok(state.position>0&&state.position<1);assert.ok(state.velocity>0);
 const before={...state},reversed=stepDisclosureSpring(state,0,1/240);
 assert.ok(Math.abs(reversed.position-before.position)<.03);
 assert.ok(reversed.velocity>0,'momentum is retained rather than resetting velocity on retarget');
 state=reversed;for(let i=0;i<120;i++)state=stepDisclosureSpring(state,0,1/60);
 assert.ok(Math.abs(state.position)<1e-8);assert.ok(Math.abs(state.velocity)<1e-6);
 state={position:0,velocity:0};for(let i=0;i<120;i++){state=stepDisclosureSpring(state,1,1/60);assert.ok(state.position>=0&&state.position<=1);}
 assert.ok(state.position>.99999);
});
