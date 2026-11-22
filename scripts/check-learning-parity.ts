import fs from 'node:fs';import {execFileSync} from 'node:child_process';import assert from 'node:assert/strict';import * as math from '../src/lib/learningMath';
const fixtures:{fn:'quadratic'|'linear'|'descent'|'backprop';args:number[]}[]=[];
for(const x of [-2,-1,0,1,2])for(const h of [.0001,.01,.5,1])fixtures.push({fn:'quadratic',args:[x,h]});
for(const w of [-2,0,1,2])for(const b of [-1,0,1])for(const y of [0,6,9])fixtures.push({fn:'linear',args:[w,b,y]});
for(const eta of [0,.01,.05,.18,.5])fixtures.push({fn:'descent',args:[1,0,eta]});
for(const x of [-1,0,1])for(const w of [-2,0,2])for(const t of [0,5,6])fixtures.push({fn:'backprop',args:[x,w,3,t]});
const python=process.env.LEARNING_PYTHON||'.local/font-tools/Scripts/python.exe';
const result=JSON.parse(execFileSync(python,['-c',"import json,sys;sys.path.insert(0,'public/examples');import learning_math as m;f=json.load(sys.stdin);print(json.dumps({'version':sys.version,'results':[getattr(m,c['fn'])(*c['args']) for c in f]}))"],{input:JSON.stringify(fixtures),encoding:'utf8',windowsHide:true}));
let maxAbsoluteError=0,comparisons=0;
function compare(a:unknown,b:unknown){if(typeof a==='number'&&typeof b==='number'){const d=Math.abs(a-b);maxAbsoluteError=Math.max(maxAbsoluteError,d);comparisons++;assert.ok(d<=1e-10+1e-10*Math.abs(b));}else if(a&&typeof a==='object'){assert.deepEqual(Object.keys(a),Object.keys(b as object));for(const k of Object.keys(a))compare((a as Record<string,unknown>)[k],(b as Record<string,unknown>)[k]);}else assert.deepEqual(a,b);}
fixtures.forEach((c,i)=>{const f=math[c.fn] as (...a:number[])=>unknown;compare(f(...c.args),result.results[i]);});
const report={checkedAt:new Date().toISOString(),python:result.version,node:process.version,cases:fixtures.length,comparisons,maxAbsoluteError,tolerance:'abs <= 1e-10 + 1e-10*abs(reference)',fixtures,passed:true};fs.writeFileSync('docs/neuralclone-expansion-numerical.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({cases:fixtures.length,comparisons,maxAbsoluteError}));
