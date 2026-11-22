"use client";
import {useState} from 'react';
import {activation, binaryLogit, regressionLoss, sigmoid, type ActivationKind} from '@/lib/learningMath';
import type {ExperimentProps} from './ExperimentLoader';
import CodeBlock from './CodeBlock';

const initial={error:2,delta:1,x:2,w:0,b:0,y:1,eta:.1,alpha:.01};
const format=(value:number)=>Number(value.toFixed(6)).toString();
export default function ProbabilityExperiment({kind,source,python}:ExperimentProps){
 const [state,setState]=useState(initial),[selected,setSelected]=useState<ActivationKind>('sigmoid'),[steps,setSteps]=useState(0);
 const [previous,setPrevious]=useState<ReturnType<typeof binaryLogit>|null>(null);
 const loss=regressionLoss(state.error,state.delta),binary=binaryLogit(state.x,state.w,state.b,state.y),act=activation(state.x,selected,state.alpha);
 const update=(key:keyof typeof initial,value:number)=>{setState(s=>({...s,[key]:value}));setPrevious(null);setSteps(0);};
 const range=(key:keyof typeof initial,label:string,min:number,max:number,step:number|'any')=><label className="experiment-field" key={key}>{label}<output>{format(state[key])}</output><input type="range" aria-label={label} min={Math.min(min,state[key])} max={Math.max(max,state[key])} step={step} value={state[key]} onChange={e=>update(key,Number(e.target.value))}/></label>;
 const result=kind==='loss'?loss:kind==='logistic'?binary:act;
 const curves=kind==='loss'?[
  {label:'MSE',color:'var(--plot-1)',value:(x:number)=>regressionLoss(x,state.delta).mse},
  {label:'MAE',color:'var(--plot-2)',value:(x:number)=>regressionLoss(x,state.delta).mae},
  {label:'Huber',color:'var(--plot-3)',value:(x:number)=>regressionLoss(x,state.delta).huber}
 ]:[{label:kind==='logistic'?'sigmoid(z)':selected,color:'var(--plot-1)',value:(x:number)=>kind==='logistic'?sigmoid(x):activation(x,selected,state.alpha).value}];
 const minX=kind==='logistic'?Math.min(-6,binary.z-1):-6,maxX=kind==='logistic'?Math.max(6,binary.z+1):6;
 const grid=Array.from({length:121},(_,i)=>minX+(maxX-minX)*i/120);
 const numbers=curves.flatMap(c=>grid.map(c.value)),minY=Math.min(0,...numbers),maxY=Math.max(1,...numbers);
 const px=(x:number)=>50+400*(x-minX)/(maxX-minX),py=(y:number)=>235-200*(y-minY)/(maxY-minY);
 const pointX=kind==='loss'?state.error:kind==='logistic'?binary.z:state.x;
 const metrics=kind==='loss'?[['MSE',loss.mse],['MAE',loss.mae],['Huber',loss.huber]]:kind==='logistic'?[['Xác suất lớp 1',binary.probability],['BCE',binary.loss],['Gradient dw',binary.dw]]:[['Giá trị forward',act.value],['Đạo hàm dùng trong code',act.derivative]];
 const rows=kind==='loss'?[
  ['MSE','e²',format(loss.mse),'2e',format(loss.dmse)],['MAE','|e|',format(loss.mae),'sign(e), e≠0',loss.dmae===null?'Không khả vi tại 0':format(loss.dmae)],['Huber','Hai nhánh theo δ',format(loss.huber),'e hoặc δ·sign(e)',format(loss.dhuber)]
 ]:kind==='logistic'?[
  ['Logit','z=wx+b',format(binary.z)],['Probability','p=sigmoid(z)',format(binary.probability)],['BCE','max(z,0)−yz+log1p(exp(−|z|))',format(binary.loss)],['Gradient z / b','p−y',format(binary.dz)],['Gradient w','(p−y)x',format(binary.dw)]
 ]:[['Forward',selected,format(act.value)],['Backward',act.kink?'Quy ước tại điểm gãy':'Đạo hàm tại x',format(act.derivative)],['Nếu gradient sau = 3','3 × đạo hàm',format(3*act.derivative)]];
 return <div data-experiment={kind}>
  <h3>{kind==='loss'?'So sánh cách loss phản ứng với sai số':kind==='logistic'?'Theo một mẫu qua sigmoid và BCE':'Theo giá trị và đạo hàm qua activation'}</h3>
  <p>{kind==='loss'?'Đổi sai số và δ; so sánh độ lớn loss với lực kéo từ gradient.':kind==='logistic'?'Đổi tham số, dự đoán hướng cập nhật, rồi chạy một bước để kiểm tra.':'Chọn hàm và đổi x. Đọc bảng để phân biệt giá trị forward với độ dốc backward.'}</p>
  <div className="experiment-fields">
   {kind==='loss'?<>{range('error','Sai số e = dự đoán − nhãn',-6,6,.1)}{range('delta','Ngưỡng Huber δ',.1,3,.1)}</>:kind==='logistic'?<>
    {range('x','Đặc trưng x',-3,3,.1)}{range('w','Trọng số w',-3,3,'any')}{range('b','Bias b',-4,4,'any')}
    <label className="experiment-field">Nhãn thật y<select aria-label="Nhãn thật y" value={state.y} onChange={e=>update('y',Number(e.target.value))}><option value={0}>0</option><option value={1}>1</option></select></label>
    {range('eta','Learning rate η',0,1,.01)}</>:<>
    <label className="experiment-field">Hàm kích hoạt<select aria-label="Hàm kích hoạt" value={selected} onChange={e=>setSelected(e.target.value as ActivationKind)}><option value="sigmoid">Sigmoid</option><option value="tanh">Tanh</option><option value="relu">ReLU</option><option value="leaky">Leaky ReLU</option></select></label>
    {range('x','Đầu vào x',-6,6,.1)}{selected==='leaky'&&range('alpha','Độ dốc phía âm α',0,1,.01)}</>}
  </div>
  <div className="actions">
   {kind==='logistic'&&<button className="primary" disabled={steps>=30} onClick={()=>{setPrevious(binary);setState(s=>({...s,w:s.w-s.eta*binary.dw,b:s.b-s.eta*binary.db}));setSteps(n=>n+1);}}>Chạy một bước</button>}
   <button onClick={()=>{setState(initial);setSelected('sigmoid');setSteps(0);setPrevious(null);}}>Đặt lại</button>
  </div>
  {kind==='logistic'&&<p role="status">Đã áp dụng {steps}/30 bước. {previous?`BCE trước: ${format(previous.loss)}; sau: ${format(binary.loss)}. Cả w và b dùng gradient trước bước cập nhật.`:'Chưa cập nhật tham số. Thí nghiệm một mẫu, không có regularization.'}</p>}
  <dl className="experiment-metrics" aria-label="Kết quả hiện tại">{metrics.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{typeof value==='number'?format(value):value}</dd></div>)}</dl>
  <figure><div className="experiment-plot-scroll" tabIndex={0} role="region" aria-label="Biểu đồ phép tính; cuộn ngang để xem đầy đủ"><svg viewBox="0 0 500 280" role="img" aria-label={kind==='loss'?'Các đường loss theo sai số':kind==='logistic'?'Xác suất sigmoid theo logit':'Hàm kích hoạt theo đầu vào'}>
   <path d={`M50 ${py(0)}H450 M${px(0)} 35V235`} fill="none" stroke="var(--mut)"/>
   {curves.map((c,index)=><g key={c.label}><polyline points={grid.map(x=>`${px(x)},${py(c.value(x))}`).join(' ')} fill="none" stroke={c.color} strokeWidth="3" strokeDasharray={index===1?"8 4":index===2?"2 4":undefined}/><circle cx={px(pointX)} cy={py(c.value(pointX))} r="5" fill={c.color}/></g>)}
   <text x="50" y="265">{format(minX)}</text><text x="430" y="265">{format(maxX)}</text><text x="8" y="40">{format(maxY)}</text><text x="8" y="235">{format(minY)}</text><text x="50" y="20">{kind==='loss'?'loss':kind==='logistic'?'p':'f(x)'}</text><text x="465" y="265">{kind==='loss'?'e':kind==='logistic'?'z':'x'}</text>
  </svg></div><p className="plot-scroll-hint">Cuộn ngang nếu biểu đồ chưa hiển thị đủ.</p><ul className="experiment-legend" aria-label="Chú giải đường cong">{curves.map((curve,index)=><li key={curve.label}><svg viewBox="0 0 32 12" width="32" height="12" aria-hidden="true"><line x1="0" y1="6" x2="32" y2="6" stroke={curve.color} strokeWidth="3" strokeDasharray={index===1?"8 4":index===2?"2 4":undefined}/></svg>{curve.label}</li>)}</ul><figcaption>{kind==='loss'?'MSE đầy đủ e², MAE và Huber được phân biệt bằng nhãn, màu và kiểu nét trong chú giải. Chấm tròn đánh dấu sai số hiện tại.':kind==='logistic'?'Đường sigmoid và điểm (z,p) hiện tại. Đổi nhãn ảnh hưởng loss/gradient, không đổi sigmoid tại cùng z.':'Chấm tròn là giá trị forward tại x. Độ dốc được tính và ghi riêng trong bảng.'}</figcaption></figure>
  {kind==='activation'&&act.kink&&<p role="note">Không có đạo hàm cổ điển tại x=0. Code dùng {selected==='relu'?'0':'α'} cho backward; đây là quy ước tại điểm gãy.</p>}
  <div className="experiment-scroll" tabIndex={0} role="region" aria-label="Bảng phép tính; cuộn ngang để xem đầy đủ"><table><caption>Tham số → công thức → kết quả từ {kind==='loss'?'regressionLoss':kind==='logistic'?'binaryLogit':'activation'}</caption><thead><tr>{(kind==='loss'?['Loss','Công thức','Giá trị','Gradient theo e','Kết quả gradient']:['Đại lượng','Phép tính','Kết quả']).map(t=><th key={t} scope="col">{t}</th>)}</tr></thead><tbody>{rows.map(row=><tr key={row[0]}>{row.map((value,i)=><td key={i}>{value}</td>)}</tr>)}</tbody></table></div>
  <details><summary>Xem output đầy đủ (JSON)</summary><pre className="experiment-output" tabIndex={0} aria-label="Kết quả tính toán">{JSON.stringify(result,null,2)}</pre></details>
  <details><summary>Xem code đang tạo kết quả (TypeScript)</summary><CodeBlock text={source} lang="typescript"/></details>
  <details><summary>Đối chiếu Python cùng đầu vào</summary><CodeBlock text={python} lang="python"/></details>
 </div>;
}
