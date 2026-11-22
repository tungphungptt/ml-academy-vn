import test from 'node:test';
import assert from 'node:assert/strict';
import {activation, binaryLogit, regressionLoss, sigmoid, type ActivationKind} from '../src/lib/learningMath';
const near=(a:number,b:number,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<=tolerance*Math.max(1,Math.abs(b)),`${a} != ${b}`);

test('Huber values and residual gradients agree at both joins and reject invalid delta',()=>{
 for(const delta of [.1,1,3])for(const error of [-6,-delta,0,delta,6]){
  const r=regressionLoss(error,delta);near(r.dhuber,(regressionLoss(error+1e-6,delta).huber-regressionLoss(error-1e-6,delta).huber)/2e-6,1e-5);
  near(r.mse,error*error);near(r.mae,Math.abs(error));
 }
 assert.equal(regressionLoss(2,1).huber,1.5);assert.equal(regressionLoss(0,1).dmae,null);
 for(const delta of [0,-1,NaN,Infinity])assert.throws(()=>regressionLoss(1,delta));
});

test('binary logits stay finite at extreme scores and use simultaneous old-state gradients',()=>{
 near(binaryLogit(2,0,0,1).loss,Math.log(2));
 const old=binaryLogit(2,0,0,1),next=binaryLogit(2,-.1*old.dw,-.1*old.db,1);
 near(next.z,.25);near(next.probability,.5621765008857981);near(next.loss,.5759394198788436);
 for(const z of [-1000,0,1000])for(const y of [0,1]){const r=binaryLogit(1,z,0,y);assert.ok(Number.isFinite(r.loss));near(r.loss,z===0?Math.log(2):((z>0)===(y===1)?0:1000));}
 near(binaryLogit(0,2,0,1).dw,0);near(binaryLogit(0,2,0,1).db,-.5);
 assert.throws(()=>binaryLogit(1,1,1,.5));assert.throws(()=>sigmoid(NaN));assert.throws(()=>binaryLogit(1e308,1e308,0,1));
});

test('binary-logit weight and bias gradients match independent finite differences',()=>{
 for(const x of [-2,0,2])for(const w of [-1,.5])for(const y of [0,1]){
  const h=1e-5,r=binaryLogit(x,w,.3,y);
  near(r.dw,(binaryLogit(x,w+h,.3,y).loss-binaryLogit(x,w-h,.3,y).loss)/(2*h));
  near(r.db,(binaryLogit(x,w,.3+h,y).loss-binaryLogit(x,w,.3-h,y).loss)/(2*h));
 }
});

test('activation derivatives distinguish forward values, regular points and kink conventions',()=>{
 const kinds:ActivationKind[]=['sigmoid','tanh','relu','leaky'];
 for(const kind of kinds)for(const x of [-2,-.1,.1,2]){const h=1e-5,r=activation(x,kind);near(r.derivative,(activation(x+h,kind).value-activation(x-h,kind).value)/(2*h));}
 assert.equal(activation(0,'sigmoid').derivative,.25);assert.equal(activation(0,'relu').kink,true);assert.equal(activation(0,'relu').derivative,0);
 assert.equal(activation(0,'leaky',1).kink,false);assert.equal(activation(0,'leaky',1).derivative,1);
 near(activation(-2,'leaky').value,-.02);near(activation(-2,'leaky').derivative,.01);
 for(const alpha of [-1,2,NaN])assert.throws(()=>activation(1,'leaky',alpha));
});
