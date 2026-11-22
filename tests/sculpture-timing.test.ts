import test from 'node:test';
import assert from 'node:assert/strict';
import {nextSculptureFrame,type SculptureFrame} from '../src/lib/sculptureTiming';

test('sculpture frame cap keeps time remainder across jittered animation callbacks',()=>{
 for(const fps of [30,60] as const){
  let clock:SculptureFrame|null=null,frames=0;
  for(let time=0;time<=3000;time+=15){
   const next=nextSculptureFrame(clock,time,fps);
   if(next){clock=next;frames++;}
  }
  assert.ok(Math.abs(frames-(3*fps+1))<=1,`${fps}: ${frames} frames over three seconds`);
 }
});

test('sculpture physics uses actual draw intervals and resets after suspension',()=>{
 const first=nextSculptureFrame(null,1000,60)!;
 assert.equal(first.dt,.016);
 assert.equal(nextSculptureFrame(first,1007,60),null);
 const second=nextSculptureFrame(first,1030,60)!;
 assert.equal(second.dt,.03);
 const third=nextSculptureFrame(second,1045,60)!;
 assert.equal(third.dt,.015);
 assert.equal(nextSculptureFrame(third,5000,60)!.dt,.05);
 assert.equal(nextSculptureFrame(null,10000,60)!.dt,.016);
});
