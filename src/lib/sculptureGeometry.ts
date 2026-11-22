export type SculpturePoint = {x:number;y:number;z:number;region:number};
export function sculpturePoints(count=320):SculpturePoint[]{
 return Array.from({length:count},(_,i)=>{const a=i*2.399963229728653,r=Math.sqrt((i+.5)/count),t=a*.37,ring=1+.28*Math.cos(t);return{x:ring*Math.cos(a),y:(r-.5)*2.1,z:ring*Math.sin(a),region:i%4};});
}
export function sculptureRibbons():SculpturePoint[][]{
 return Array.from({length:7},(_,layer)=>Array.from({length:65},(_,i)=>{const a=i/64*Math.PI*2,r=1+.18*Math.cos(a*3+layer*.4);return{x:r*Math.cos(a),y:(layer-3)*.28+.13*Math.sin(a*2+layer*.5),z:r*Math.sin(a),region:layer%4};}));
}
export function sculpturePosition(point:SculpturePoint,index:number,stage:number):SculpturePoint{
 const layer={x:(point.region-1.5)*.65,y:Math.sin(index*2.4)*.85,z:Math.cos(index*2.4)*.85,region:point.region};
 const blend=Math.max(0,Math.min(1,stage));
 const trained=Math.max(0,Math.min(1,stage-1));
 const output=Math.max(0,Math.min(1,stage-2));
 return{x:point.x*(1-blend)+layer.x*blend+Math.sin(index*.16)*trained*.12+output*(point.region===3?.7:-.2),y:(point.y*(1-blend)+layer.y*blend)*(1-trained*.13)*(1-output*.2),z:point.z*(1-blend)+layer.z*blend+Math.sin(index*.15)*trained*.14,region:point.region};
}
export function projectSculpture(point:SculpturePoint,yaw:number,pitch:number,width:number,height:number){
 return sculptureProjector(yaw,pitch,width,height)(point);
}
export function sculptureProjector(yaw:number,pitch:number,width:number,height:number){
 const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);
 const radius=Math.min(width,height)*.3;
 return (point:SculpturePoint)=>{
  const x=point.x*cy+point.z*sy,z=-point.x*sy+point.z*cy;
  const y=point.y*cp-z*sp,depth=point.y*sp+z*cp;
  const scale=radius*3.6/(3.6+depth);
  return{x:width*.5+x*scale,y:height*.5+y*scale,z:depth,scale};
 };
}
export function interpolateSculpturePoint(a:SculpturePoint,b:SculpturePoint,t:number):SculpturePoint{
 return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,z:a.z+(b.z-a.z)*t,region:a.region};
}
