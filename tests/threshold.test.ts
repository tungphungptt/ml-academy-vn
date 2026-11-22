import test from "node:test";
import assert from "node:assert/strict";
import { THRESHOLD_SAMPLES, thresholdMetrics } from "../src/lib/threshold";
test("threshold demo matches independently verified lesson/Python confusion counts and costs",()=>{
  for(const [t,tp,fp,fn,cost] of [[.3,3,3,0,3],[.5,2,2,1,6],[.7,1,1,2,9]]){
    const r=thresholdMetrics(THRESHOLD_SAMPLES,t,1,4);
    assert.deepEqual([r.tp,r.fp,r.fn,r.cost],[tp,fp,fn,cost]);
    assert.equal(r.tp+r.fp+r.fn+r.tn,8);
  }
  assert.equal(thresholdMetrics(THRESHOLD_SAMPLES,.5,1,4).recall,2/3);
});
test("threshold equality, undefined metrics and invalid inputs are explicit",()=>{
  assert.equal(thresholdMetrics([{score:.5,label:1}],.5,1,1).tp,1);
  const r=thresholdMetrics([],1,0,0);assert.equal(r.precision,null);assert.equal(r.recall,null);assert.equal(r.cost,0);
  assert.throws(()=>thresholdMetrics(THRESHOLD_SAMPLES,NaN,1,1),RangeError);
  assert.throws(()=>thresholdMetrics(THRESHOLD_SAMPLES,.5,-1,1),RangeError);
});
test("threshold endpoints, equality and zero-cost decisions remain mathematically consistent",()=>{
  assert.deepEqual(thresholdMetrics(THRESHOLD_SAMPLES,0,1,4),{tp:3,fp:5,tn:0,fn:0,precision:3/8,recall:1,cost:5});
  assert.deepEqual(thresholdMetrics(THRESHOLD_SAMPLES,1,1,4),{tp:0,fp:0,tn:5,fn:3,precision:null,recall:0,cost:12});
  assert.equal(thresholdMetrics(THRESHOLD_SAMPLES,.9,1,4).tp,1);
  for(const t of [0,.35,.5,.9,1])assert.equal(thresholdMetrics(THRESHOLD_SAMPLES,t,0,0).cost,0);
  const negativeOnly=thresholdMetrics([{score:.2,label:0}],.5,0,1);
  assert.equal(negativeOnly.recall,null);assert.equal(negativeOnly.precision,null);
  for(const score of [-1,Infinity,NaN])assert.throws(()=>thresholdMetrics([{score,label:1}],.5,1,1),RangeError);
});
