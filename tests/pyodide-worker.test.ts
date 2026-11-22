import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

function harness(){
  const messages:{type:string;phase?:string;message?:string;out?:string}[]=[];
  let release!:()=>void,executions=0,destroyed=0;
  const loading=new Promise<void>(resolve=>{release=resolve;});
  const dict=Object.assign(()=>({destroy:()=>destroyed++}),{destroy:()=>destroyed++});
  const py={loadedPackages:{} as Record<string,string>,loadPackage:()=>loading,setStdout:()=>{},setStderr:()=>{},globals:{get:()=>dict},runPythonAsync:async()=>{executions++;return {destroy:()=>destroyed++};}};
  const self={postMessage:(m:typeof messages[number])=>messages.push(m),onmessage:undefined as undefined|((event:{data:{code:string;packages:string[]}})=>Promise<void>)};
  vm.runInNewContext(fs.readFileSync('public/pyodide-worker.js','utf8'),{self,importScripts:()=>{},loadPyodide:async()=>py});
  return {py,self,messages,release,executions:()=>executions,destroyed:()=>destroyed};
}
test('worker distinguishes dependency loading from execution and releases proxies',async()=>{
  const h=harness(),pending=h.self.onmessage!({data:{code:'print(1)',packages:['numpy']}});
  await new Promise(resolve=>setImmediate(resolve));
  assert.deepEqual(h.messages.map(m=>m.phase),['loading-runtime','loading-packages']);assert.equal(h.executions(),0);
  h.py.loadedPackages.numpy='official-cdn';h.release();await pending;
  assert.deepEqual(h.messages.map(m=>m.type),['status','status','status','done']);
  assert.equal(h.messages[2].phase,'running');assert.equal(h.executions(),1);assert.equal(h.destroyed(),3);
});
test('missing dependencies report an error before any Python execution',async()=>{
  const h=harness(),pending=h.self.onmessage!({data:{code:'import numpy',packages:['numpy']}});
  h.release();await pending;
  assert.equal(h.executions(),0);assert.equal(h.messages.at(-1)?.type,'error');
  assert.match(h.messages.at(-1)?.message??'',/Chưa tải được thư viện: numpy/);
  assert.ok(!h.messages.some(m=>m.phase==='running'));
});
