import {sculptureProjector,sculpturePoints,sculpturePosition,sculptureRibbons,interpolateSculpturePoint} from './sculptureGeometry';
import {nextSculptureFrame,type SculptureFrame} from './sculptureTiming';
type Settings={stage:number;region:number;rotation:number;playing:boolean;reduced:boolean;visible:boolean;awake:boolean;light:boolean};
export function createSculptureScene(canvas:HTMLCanvasElement,settings:()=>Settings){
 const context=canvas.getContext('2d',{alpha:true});if(!context)return null;const ctx:CanvasRenderingContext2D=context;
 const small=matchMedia('(max-width: 800px)').matches,count=small?200:320,points=sculpturePoints(count);
 const shapes=[0,1,2,3].map(value=>points.map((point,index)=>sculpturePosition(point,index,value)));
 const ribbons=sculptureRibbons().map(ribbon=>[0,1,2,3].map(value=>ribbon.map((point,index)=>sculpturePosition(point,index,value))));
 const edges=points.flatMap((p,i)=>points.slice(i+1).map((q,j)=>({a:i,b:i+j+1,d:Math.hypot(p.x-q.x,p.y-q.y,p.z-q.z)})).filter(e=>e.d<.36)).slice(0,850);
 let width=0,height=0,frame=0,clock:SculptureFrame|null=null,angle=-.5,pitch=.18,yawVelocity=0,pitchVelocity=0,stage=0,stageVelocity=0,pointerX=0,pointerY=0,orbit=0,disposed=false;
 let hits:{x:number;y:number;region:number}[]=[];
 const resize=new ResizeObserver(([entry])=>{width=entry.contentRect.width;height=entry.contentRect.height;const ratio=Math.min(devicePixelRatio||1,small?1.25:1.75);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0);wake();});
 function draw(time:number){
  frame=0;if(disposed||width<=0||height<=0)return;const state=settings();
  if(!state.visible||!state.awake){canvas.dataset.animating='false';return;}
  const next=nextSculptureFrame(clock,time,small?30:60);if(!next){frame=requestAnimationFrame(draw);return;}clock=next;const {dt}=next;
  const moving=state.visible&&state.awake&&!state.reduced;
  const targetYaw=-.5+state.rotation+(moving?pointerX*.3:0),targetPitch=.18+(moving?pointerY*.18:0);
  if(state.reduced){angle=targetYaw;pitch=targetPitch;stage=state.stage;yawVelocity=0;pitchVelocity=0;stageVelocity=0;}
  else{yawVelocity+=(70*(targetYaw-angle)-17*yawVelocity)*dt;pitchVelocity+=(70*(targetPitch-pitch)-17*pitchVelocity)*dt;stageVelocity+=(55*(state.stage-stage)-15*stageVelocity)*dt;angle+=yawVelocity*dt;pitch+=pitchVelocity*dt;stage+=stageVelocity*dt;}
  if(moving&&state.playing)orbit+=dt*.035;
  ctx.clearRect(0,0,width,height);
  const clamped=Math.max(0,Math.min(3,stage)),lower=Math.floor(clamped),upper=Math.min(3,lower+1),blend=clamped-lower;
  const project=sculptureProjector(angle+orbit,pitch,width,height);
  const projected=points.map((p,i)=>({...project(interpolateSculpturePoint(shapes[lower][i],shapes[upper][i],blend)),region:p.region,index:i}));hits=projected;
  const glow=ctx.createRadialGradient(width*.53,height*.46,0,width*.53,height*.46,width*.52);glow.addColorStop(0,state.light?'#c7893619':'#d6963720');glow.addColorStop(1,'#c7893600');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  ribbons.forEach((ribbon,index)=>{ctx.beginPath();ribbon[lower].forEach((point,i)=>{const p=project(interpolateSculpturePoint(point,ribbon[upper][i],blend));if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);});ctx.strokeStyle=state.light?'#875016':'#efbf7a';ctx.globalAlpha=index%4===state.region?.8:.24;ctx.lineWidth=index%4===state.region?1.5:.8;ctx.stroke();});ctx.globalAlpha=1;
  for(const edge of edges){const a=projected[edge.a],b=projected[edge.b],lit=a.region===state.region||b.region===state.region;ctx.strokeStyle=state.light?(lit?'#955c28a0':'#705d4c35'):(lit?'#efbe7880':'#bda67d24');ctx.lineWidth=lit?.8:.5;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  for(let layer=0;layer<3;layer++){const a=projected.find(p=>p.region===layer),b=projected.find(p=>p.region===layer+1);if(a&&b&&stage>.1){ctx.strokeStyle=state.light?'#9b5c2b60':'#ecc18850';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.bezierCurveTo(width*.5,a.y,width*.5,b.y,b.x,b.y);ctx.stroke();}}
  for(const p of projected.toSorted((a,b)=>b.z-a.z)){const lit=p.region===state.region,r=(lit?2.1:1.15)*(p.scale/(Math.min(width,height)*.3));ctx.beginPath();ctx.arc(p.x,p.y,Math.max(.6,r),0,Math.PI*2);ctx.fillStyle=state.light?(lit?'#93501b':'#84715e'):(lit?'#ffe1aa':'#b9ab94');ctx.fill();if(lit&&p.index%7===0){ctx.beginPath();ctx.arc(p.x,p.y,r+4,0,Math.PI*2);ctx.strokeStyle=state.light?'#a65c3430':'#ffcd7b30';ctx.stroke();}}
  if(canvas.dataset.rendered!=='true')canvas.dataset.rendered='true';
  const settling=Math.abs(stage-state.stage)+Math.abs(angle-targetYaw)+Math.abs(pitch-targetPitch)+Math.abs(stageVelocity)+Math.abs(yawVelocity)+Math.abs(pitchVelocity)>.002;
  const animating=String(moving&&(state.playing||settling));if(canvas.dataset.animating!==animating)canvas.dataset.animating=animating;
  if(moving&&(state.playing||settling))frame=requestAnimationFrame(draw);
 }
 function wake(){if(!frame&&!disposed&&settings().visible&&settings().awake){clock=null;frame=requestAnimationFrame(draw);}}
 function pointer(x:number,y:number){pointerX=x;pointerY=y;wake();}
 function pick(x:number,y:number){let nearest=45*45,region:number|null=null;for(const hit of hits){const distance=(hit.x-x)**2+(hit.y-y)**2;if(distance<nearest){nearest=distance;region=hit.region;}}return region;}
 resize.observe(canvas);wake();
 return{wake,pointer,pick,dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();canvas.width=0;canvas.height=0;}};
}
