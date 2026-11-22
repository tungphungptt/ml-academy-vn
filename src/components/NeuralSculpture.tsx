"use client";
import {useEffect,useRef,useState} from 'react';
import {projectSculpture,sculpturePoints,sculptureRibbons} from '@/lib/sculptureGeometry';
import type {createSculptureScene} from '@/lib/sculptureScene';
import Icon from './Icon';
const regions=['Điểm dữ liệu','Lớp biểu diễn','Những kết nối','Không gian đầu ra'];
const descriptions=['Từng điểm là một phần của cấu trúc sinh bằng code. Chọn một vùng để nhìn rõ các kết nối.','Một cách hình dung trừu tượng về việc tổ chức thông tin thành các lớp.','Các đường nối tạo nên nhịp điệu và chiều sâu của khối neural.','Một biểu tượng cho hành trình từ quan sát đến một điều có thể hiểu.'];
const fallback=sculpturePoints(120).map(p=>(()=>{const v=projectSculpture(p,-.5,.18,600,520);return{x:Number(v.x.toFixed(3)),y:Number(v.y.toFixed(3)),region:p.region};})());
const fallbackRibbons=sculptureRibbons().map(ribbon=>ribbon.map(point=>{const p=projectSculpture(point,-.5,.18,600,520);return`${Number(p.x.toFixed(3))},${Number(p.y.toFixed(3))}`;}).join(' '));
export default function NeuralSculpture({stage=0,compact=false}:{stage?:number;compact?:boolean}){
 const canvas=useRef<HTMLCanvasElement>(null),scene=useRef<ReturnType<typeof createSculptureScene>>(null);
 const [region,setRegion]=useState(0),[rotation,setRotation]=useState(0),[playing,setPlaying]=useState(true),[ready,setReady]=useState(false),[reduced,setReduced]=useState(false),[hydrated,setHydrated]=useState(false),[failed,setFailed]=useState(false);
 const state=useRef({stage,region,rotation,playing,reduced:false,visible:false,awake:true,light:false});
 state.current={...state.current,stage,region,rotation,playing};
 useEffect(()=>{
  let disposed=false,loading=false;const media=matchMedia('(prefers-reduced-motion: reduce)');
  const update=()=>{state.current.reduced=media.matches;setReduced(media.matches);state.current.awake=!document.hidden;state.current.light=document.documentElement.dataset.theme==='light';if(document.hidden&&canvas.current)canvas.current.dataset.animating='false';scene.current?.wake();};update();setHydrated(true);
  const observer=new IntersectionObserver(async([entry])=>{state.current.visible=entry.isIntersecting;if(entry.isIntersecting&&!scene.current&&!loading){loading=true;try{const module=await import('@/lib/sculptureScene');if(disposed||!canvas.current)return;scene.current=module.createSculptureScene(canvas.current,()=>state.current);setReady(!!scene.current);setFailed(!scene.current);}catch{if(!disposed)setFailed(true);}}scene.current?.wake();});
  if(canvas.current)observer.observe(canvas.current);
  const theme=new MutationObserver(update);theme.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
  return()=>{disposed=true;observer.disconnect();theme.disconnect();media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);scene.current?.dispose();scene.current=null;};
 },[]);
 useEffect(()=>{scene.current?.wake();},[stage,region,rotation,playing]);
 return <figure className={`neural-sculpture${compact?' compact':''}`} data-stage={stage} data-ready={ready}>
  <div className="sculpture-stage"><svg className="sculpture-fallback" viewBox="0 0 600 520" aria-hidden="true">{fallbackRibbons.map((points,i)=><polyline key={i} points={points} fill="none" stroke="currentColor" strokeWidth={i%4===region?1.5:.8} opacity={i%4===region?.8:.3}/>)}{fallback.map((p,i)=><g key={i}>{i>0&&<path d={`M${fallback[i-1].x},${fallback[i-1].y}L${p.x},${p.y}`} stroke="currentColor" strokeOpacity=".15"/>}<circle cx={p.x} cy={p.y} r={p.region===region?2.3:1.3} fill="currentColor"/></g>)}</svg><canvas ref={canvas} aria-hidden="true" onPointerMove={e=>{if(e.pointerType==='mouse'){const r=e.currentTarget.getBoundingClientRect();scene.current?.pointer((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5);}}} onPointerLeave={()=>scene.current?.pointer(0,0)} onClick={e=>{const r=e.currentTarget.getBoundingClientRect(),hit=scene.current?.pick(e.clientX-r.left,e.clientY-r.top);if(hit!==null&&hit!==undefined)setRegion(hit);}} />
  <span className="sculpture-coordinate" aria-hidden="true">NC / {String(stage+1).padStart(2,'0')}<br/>CONNECTIONS IN SPACE</span></div>
  <div className="sculpture-controls" role="group" aria-label="Khám phá khối neural">{regions.map((name,i)=><button key={name} disabled={!hydrated} aria-pressed={region===i} onClick={()=>setRegion(i)}>{String(i+1).padStart(2,'0')}<span>{name}</span></button>)}</div>
  <div className="sculpture-tools"><button disabled={!ready||reduced} aria-pressed={!playing} onClick={()=>setPlaying(v=>!v)}>{reduced?'Hình tĩnh · giảm chuyển động':playing?'Dừng chuyển động':'Tiếp tục chuyển động'}</button><button disabled={!ready} aria-label="Xoay khối sang trái" onClick={()=>setRotation(r=>r-.3)}><Icon name="back" /></button><button disabled={!ready} aria-label="Xoay khối sang phải" onClick={()=>setRotation(r=>r+.3)}><Icon name="arrow" /></button></div>
  <figcaption><strong>{regions[region]}</strong><p>{descriptions[region]}</p><small>Điêu khắc số trừu tượng · không mô phỏng huấn luyện hay đo độ chính xác.{failed?' Chế độ hình tĩnh: bạn vẫn có thể chọn và đọc về từng vùng.':reduced?' Chế độ giảm chuyển động: hình tĩnh, điều khiển đầy đủ.':''}</small></figcaption>
 </figure>;
}
