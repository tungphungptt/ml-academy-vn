import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {existsSync} from 'node:fs';
import {vectorGeometry,sampleMoments,betaUpdate,softmaxExample} from '../src/lib/foundationMath';
test('foundation numerical references cover undefined and boundary cases',()=>{
 assert.equal(vectorGeometry(0,0,1,1).cosine,null);assert.ok(Math.abs(vectorGeometry(1,0,1,1).cosine!-1/Math.sqrt(2))<1e-12);
 assert.equal(sampleMoments([2,4,6],1).variance,4);assert.equal(sampleMoments([4,4,4]).zscores,null);assert.throws(()=>sampleMoments([],0));assert.throws(()=>sampleMoments([1],1));
 assert.deepEqual(betaUpdate(3,4,2,2),{a:5,b:3,mle:.75,mean:.625,mode:2/3});assert.equal(betaUpdate(0,0,1,1).mode,null);assert.equal(betaUpdate(0,0,2,2).mle,null);assert.throws(()=>betaUpdate(2,1,1,1));
 const a=softmaxExample([2,1,0],0),b=softmaxExample([1002,1001,1000],0);assert.deepEqual(a.probabilities,b.probabilities);assert.ok(Math.abs(a.loss-.4076059644443804)<1e-12);assert.throws(()=>softmaxExample([1,2],2));assert.throws(()=>softmaxExample([1,2],0,0));
});
test('foundation TypeScript and Python use the same intermediates',t=>{
 const python='.local/font-tools/Scripts/python.exe';if(!existsSync(python)){t.skip('Project Python environment unavailable');return;}
 const fixtures=[{fn:'vectorGeometry',args:[1,0,1,1]},{fn:'vectorGeometry',args:[0,0,1,1]},{fn:'sampleMoments',args:[[2,4,6],0]},{fn:'sampleMoments',args:[[4,4,4],1]},{fn:'betaUpdate',args:[3,4,2,2]},{fn:'betaUpdate',args:[0,0,1,1]},{fn:'softmaxExample',args:[[2,1,0],0]},{fn:'softmaxExample',args:[[1002,1001,1000],2,.5]}];
 const result=JSON.parse(execFileSync(python,['-c',"import sys,json;sys.path.insert(0,'public/examples');import foundation_math as m;print(json.dumps([getattr(m,f['fn'])(*f['args']) for f in json.load(sys.stdin)]))"],{input:JSON.stringify(fixtures),encoding:'utf8',windowsHide:true}));
 const functions={vectorGeometry,sampleMoments,betaUpdate,softmaxExample};
 const compare=(a:unknown,b:unknown)=>{if(typeof a==='number'&&typeof b==='number')assert.ok(Math.abs(a-b)<1e-10);else if(a&&typeof a==='object')for(const k of Object.keys(a))compare((a as Record<string,unknown>)[k],(b as Record<string,unknown>)[k]);else assert.equal(a,b);};
 fixtures.forEach((f,i)=>compare((functions[f.fn as keyof typeof functions] as (...args:unknown[])=>unknown)(...f.args),result[i]));
});
