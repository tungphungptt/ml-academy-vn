"use client";
import {useEffect,useRef,useState} from 'react';
import {illustrativeForwardPass} from '@/lib/flowModel';
import Icon from './Icon';
const model=illustrativeForwardPass();
const edges=[[[76,116],[240,100]],[[76,116],[240,200]],[[76,216],[240,100]],[[76,216],[240,200]],[[240,100],[410,150]],[[240,200],[410,150]]] as const;
const stages=['Nhìn vào dữ liệu','Tính qua lớp ẩn','Tạo điểm dự đoán','Đọc kết quả và giới hạn'];
export default function KnowledgeFlow(){
 const box=useRef<HTMLElement>(null),packets=useRef<Animation[]>([]);
 const [step,setStep]=useState(0),[playing,setPlaying]=useState(true),[visible,setVisible]=useState(false),[awake,setAwake]=useState(true),[reduced,setReduced]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>{
  const query=matchMedia('(prefers-reduced-motion: reduce)'),pref=()=>setReduced(query.matches),tab=()=>setAwake(document.visibilityState==='visible');pref();tab();
  const io=new IntersectionObserver(([e])=>setVisible(e.isIntersecting),{threshold:.1});if(box.current)io.observe(box.current);
  query.addEventListener('change',pref);document.addEventListener('visibilitychange',tab);setReady(true);
  return()=>{io.disconnect();query.removeEventListener('change',pref);document.removeEventListener('visibilitychange',tab);};
 },[]);
 useEffect(()=>{
  packets.current.forEach(a=>a.cancel());packets.current=[];
  if(reduced||step===0||step===3)return;
  box.current?.querySelectorAll<SVGCircleElement>('[data-packet]').forEach((el,i)=>{
   if((step===1&&i>=4)||(step===2&&i<4))return;
   const [a,b]=edges[i];const animation=el.animate([{transform:`translate(${a[0]}px,${a[1]}px)`,opacity:0},{opacity:1,offset:.15},{opacity:1,offset:.85},{transform:`translate(${b[0]}px,${b[1]}px)`,opacity:0}],{duration:850,fill:'none',easing:'linear'});animation.pause();packets.current.push(animation);
  });
  return()=>packets.current.forEach(a=>a.cancel());
 },[step,reduced]);
 useEffect(()=>{const active=playing&&visible&&awake&&!reduced;packets.current.forEach(a=>active?a.play():a.pause());},[playing,visible,awake,reduced,step]);
 useEffect(()=>{if(!playing||!visible||!awake||reduced||step>=3)return;const timer=setTimeout(()=>setStep(s=>Math.min(3,s+1)),1400);return()=>clearTimeout(timer);},[playing,visible,awake,reduced,step]);
 return <figure ref={box} className="knowledge-flow" aria-busy={!ready} data-flow-step={step} data-animating={playing&&visible&&awake&&!reduced&&step<3}>
  <div className="flow-caption"><span>Mạng neural 2 → 2 → 1</span><span className="flow-tag">Forward pass</span></div>
  <div className="flow-stages" role="group" aria-label="Các bước tính của mạng neural">{['Đầu vào','Lớp ẩn','Sigmoid','Kết quả'].map((label,index)=><button key={label} disabled={!ready} aria-pressed={step===index} onClick={()=>{setPlaying(false);setStep(index);}}><span>{index+1}</span>{label}</button>)}</div>
  <svg viewBox="0 0 490 300" role="img" aria-labelledby="flow-title flow-desc"><title id="flow-title">Một lượt tính qua mạng neural 2–2–1</title><desc id="flow-desc">Hai đầu vào 0,6 và 0,3 đi qua hai neuron ReLU cho 0,70 và 0,29; sigmoid cho điểm khoảng 0,65. Đây là trọng số minh họa cố định, chưa huấn luyện hay calibration.</desc>
   <defs><pattern id="flow-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".8" fill="var(--bd)"/></pattern></defs><rect width="490" height="300" fill="url(#flow-grid)"/>
   {edges.map(([a,b],i)=><g key={i}><path d={`M${a[0]} ${a[1]}L${b[0]} ${b[1]}`} fill="none" stroke="var(--bd)" strokeWidth="1.5"/><circle data-packet={i} cx="0" cy="0" r="4" fill="var(--secondary)" opacity="0"/></g>)}
   {[[76,116,'0.60'],[76,216,'0.30'],[240,100,model.hidden[0].toFixed(2)],[240,200,model.hidden[1].toFixed(2)],[410,150,model.score.toFixed(2)]].map(([x,y,value],i)=><g key={i} className={`flow-node${(i<2||step>=1&&i<4||step>=2)?' lit':''}`}><circle cx={x} cy={y} r={i===4?36:30} fill="var(--bg2)" stroke="var(--ac)" strokeWidth="1.5"/><text x={x} y={Number(y)+5} textAnchor="middle">{value}</text></g>)}
   <text x="76" y="48" textAnchor="middle" className="flow-label">Đầu vào</text><text x="240" y="48" textAnchor="middle" className="flow-label">Lớp ẩn · ReLU</text><text x="410" y="48" textAnchor="middle" className="flow-label">Sigmoid</text>
   <text x="245" y="278" textAnchor="middle" className="flow-equation">h = ReLU(Wx + b) · p = σ(vh + c)</text>
  </svg>
  <div className="flow-explanation" aria-live="polite"><span className="flow-index">0{step+1}</span><div><strong>{stages[step]}</strong><p>{step===0?'Hai đặc trưng đã được đưa về cùng thang đo.':step===1?'Nhân trọng số, cộng bias, rồi áp dụng ReLU.':step===2?`Sigmoid cho điểm ${model.score.toFixed(2)}; với ngưỡng 0,5, dự đoán lớp ${model.prediction}.`:'Một phép tính minh họa, chưa phải một mô hình đã được đánh giá.'}</p></div></div>
  <div className="flow-controls"><button className="flow-play" disabled={!ready} onClick={()=>{if(step===3){setStep(0);setPlaying(true);}else setPlaying(p=>!p);}} aria-pressed={playing&&step<3} aria-label={playing&&step<3?'Tạm dừng minh họa':'Phát minh họa'}><Icon name={playing&&step<3?'focus':'play'}/>{playing&&step<3?'Tạm dừng':'Phát lại'}</button><button disabled={!ready} onClick={()=>{setPlaying(false);setStep(s=>(s+1)%4);}}>Từng bước<Icon name="arrow"/></button><span>{!ready?'Đang chuẩn bị điều khiển…':reduced?'Chế độ tĩnh · giảm chuyển động':'MLP 2–2–1 · trọng số cố định'}</span></div>
  <details className="flow-calculation"><summary>Xem phép tính</summary><p>h1 = ReLU(1,2 × 0,6 − 0,4 × 0,3 + 0,1) = 0,70<br/>h2 = ReLU(−0,3 × 0,6 + 0,9 × 0,3 + 0,2) = 0,29<br/>z = 1,4 × h1 − 0,6 × h2 − 0,2 = {model.logit.toFixed(3)}<br/>p = 1 / (1 + exp(−z)) = {model.score.toFixed(4)}</p></details>
  <figcaption>Minh họa một lượt forward pass, không huấn luyện hay đo accuracy. <a href="/learn/mlp">Tìm hiểu mạng nhiều lớp</a>.</figcaption>
 </figure>;
}
