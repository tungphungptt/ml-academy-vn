import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
import * as math from '../src/lib/learningMath';
const fixtures:{fn:'regressionLoss'|'binaryLogit'|'activation';args:(number|string)[]}[]=[];
for(const e of [-6,-1,0,1,6])for(const delta of [.1,1,3])fixtures.push({fn:'regressionLoss',args:[e,delta]});
for(const x of [-2,0,2])for(const w of [-500,-1,0,1,500])for(const y of [0,1])fixtures.push({fn:'binaryLogit',args:[x,w,0,y]});
for(const x of [-6,-2,0,2,6])for(const kind of ['sigmoid','tanh','relu','leaky'])for(const alpha of [0,.01,1])fixtures.push({fn:'activation',args:[x,kind,alpha]});
const python=process.env.LEARNING_PYTHON||'.local/font-tools/Scripts/python.exe';
const results=JSON.parse(execFileSync(python,['-c',"import json,sys;sys.path.insert(0,'public/examples');import learning_math as m;f=json.load(sys.stdin);print(json.dumps({'version':sys.version,'results':[getattr(m,c['fn'])(*c['args']) for c in f]}))"],{input:JSON.stringify(fixtures),encoding:'utf8',windowsHide:true}));
let count=0,maxError=0;
function compare(a:unknown,b:unknown){
 if(typeof a==='number'&&typeof b==='number'){const error=Math.abs(a-b);count++;maxError=Math.max(error,maxError);assert.ok(error<=1e-10+1e-10*Math.abs(b));}
 else if(a&&typeof a==='object'){assert.deepEqual(Object.keys(a),Object.keys(b as object));for(const k of Object.keys(a))compare((a as Record<string,unknown>)[k],(b as Record<string,unknown>)[k]);}
 else assert.deepEqual(a,b);
}
fixtures.forEach((f,i)=>compare((math[f.fn] as (...args:unknown[])=>unknown)(...f.args),results.results[i]));
const notebook=JSON.parse(fs.readFileSync('public/notebooks/learning_math.ipynb','utf8'));assert.equal(notebook.cells[1].source.join(''),fs.readFileSync('public/examples/learning_math.py','utf8'));
console.log(JSON.stringify({python:results.version,cases:fixtures.length,numericComparisons:count,maxAbsoluteError:maxError,notebookSourceMatches:true}));
