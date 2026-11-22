import test from 'node:test';
import assert from 'node:assert/strict';
import {projectSculpture,sculpturePoints,sculpturePosition,sculptureProjector,interpolateSculpturePoint} from '../src/lib/sculptureGeometry';
test('sculpture projection preserves perspective and deterministic chapter geometry',()=>{
 const point={x:1,y:0,z:0,region:3};
 assert.deepEqual(projectSculpture(point,0,0,600,520),{x:456,y:260,z:0,scale:156});
 assert.ok(projectSculpture({...point,z:1},0,0,600,520).scale<156);
 assert.deepEqual(sculpturePosition(point,0,0),point);
 assert.ok(Math.abs(sculpturePosition(point,0,3).x-1.675)<1e-12);
 assert.deepEqual(sculpturePoints(120),sculpturePoints(120));
 for(const stage of [0,.5,1,1.5,2,2.5,3])for(const [i,p]of sculpturePoints().entries())assert.ok(Object.values(projectSculpture(sculpturePosition(p,i,stage),-.5,.18,375,300)).every(Number.isFinite));
});
test('precomputed sculpture frames match direct geometry throughout every chapter',()=>{
 const points=sculpturePoints(120),forms=[0,1,2,3].map(stage=>points.map((point,index)=>sculpturePosition(point,index,stage)));
 for(const stage of [0,.1,.4,.9,1,1.25,1.7,2,2.2,2.85,3]){
  const a=Math.floor(stage),b=Math.min(3,a+1),camera=sculptureProjector(.3,-.2,1440,900);
  for(const [index,point]of points.entries()){
   const reference=projectSculpture(sculpturePosition(point,index,stage),.3,-.2,1440,900);
   const projected=camera(interpolateSculpturePoint(forms[a][index],forms[b][index],stage-a));
   for(const key of ['x','y','z','scale'] as const)assert.ok(Math.abs(reference[key]-projected[key])<1e-10);
  }
 }
});
