"use client";
import {useState} from 'react';
import {vectorGeometry,sampleMoments,betaUpdate,softmaxExample} from '@/lib/foundationMath';
import type {ExperimentProps} from './ExperimentLoader';
import CodeBlock from './CodeBlock';
const configurations={
 vectors:{title:'Vector và cosine',labels:['aₓ','aᵧ','bₓ','bᵧ'],initial:[1,0,1,1],min:-5,max:5,step:.1},
 moments:{title:'Phương sai và z-score',labels:['x₁','x₂','x₃','ddof'],initial:[2,4,6,0],min:0,max:10,step:1},
 bayes:{title:'MLE, MAP và posterior mean',labels:['Số thử n','Số thành công k','Prior α','Prior β'],initial:[4,3,2,2],min:0,max:20,step:1},
 softmax:{title:'Softmax và cross-entropy',labels:['Logit 0','Logit 1','Logit 2','Nhãn đúng'],initial:[2,1,0,0],min:-10,max:10,step:1}
};
export default function FoundationExperiment({kind,source,python}:ExperimentProps){
 const config=configurations[kind as keyof typeof configurations];
 const [values,setValues]=useState(config.initial);
 const [a,b,c,d]=values;
 const result=kind==='vectors'?vectorGeometry(a,b,c,d):kind==='moments'?sampleMoments([a,b,c],d):kind==='bayes'?betaUpdate(b,a,c,d):softmaxExample([a,b,c],d);
 const format=(v:unknown)=>v===null?'Không xác định':typeof v==='number'?Number(v.toFixed(6)).toString():JSON.stringify(v);
 const entries=Object.entries(result),numbers:[string,number][]='probabilities' in result?result.probabilities.map((value,i)=>[String(i),value] as [string,number]):entries.filter((pair):pair is [string,number]=>typeof pair[1]==='number'),scale=Math.max(1,...numbers.map(([,v])=>Math.abs(v)));
 return <div data-experiment={kind}><h3>{config.title}</h3><p>Đổi tham số, đối chiếu bảng và code. Vector 0, cột hằng và chưa có quan sát được ghi rõ là trường hợp không xác định; không thay bằng kết quả giả.</p>
  <div className="experiment-fields">{config.labels.map((label,i)=>{const min=kind==='bayes'&&i>=2?1:kind==='moments'?0:config.min,max=kind==='bayes'&&i===1?a:kind==='moments'&&i===3?1:kind==='softmax'&&i===3?2:config.max;return <label className="experiment-field" key={label}>{label}<output>{values[i]}</output><input type="range" aria-label={label} min={kind==='softmax'&&i===3?0:min} max={max} step={config.step} value={values[i]} onChange={e=>setValues(old=>{const next=[...old];next[i]=Number(e.target.value);if(kind==='bayes')next[1]=Math.min(next[1],next[0]);return next;})}/></label>;})}</div>
  <button onClick={()=>setValues(config.initial)}>Đặt lại</button>
  <div className="experiment-scroll" tabIndex={0} role="region" aria-label="Bảng kết quả"><table><caption>Kết quả từ cùng hàm đang hiển thị trong phần code</caption><thead><tr><th>Đại lượng</th><th>Giá trị</th></tr></thead><tbody>{entries.map(([name,value])=><tr key={name}><th scope="row">{name}</th><td>{format(value)}</td></tr>)}</tbody></table></div>
  <figure><div className="experiment-plot-scroll" tabIndex={0} role="region" aria-label="Biểu đồ kết quả"><svg viewBox={`0 0 500 ${Math.max(200,numbers.length*36+40)}`} role="img" aria-label="Các kết quả số trên cùng thang đo">{numbers.map(([name,value],i)=><g key={name}><text x="8" y={30+i*36}>{name}</text><line x1="250" x2={250+200*value/scale} y1={24+i*36} y2={24+i*36} stroke="var(--plot-1)" strokeWidth="8"/><text x="460" y={30+i*36}>{Number(value.toFixed(2))}</text></g>)}</svg></div><figcaption>Độ dài thanh tỷ lệ với giá trị có dấu trên cùng thang đo tự động. Đây là biểu đồ kết quả số, không phải hình học góc vector hoặc mật độ Beta. Xem bảng để đọc đủ độ chính xác.</figcaption></figure>
  <details><summary>Xem output đầy đủ (JSON)</summary><pre className="experiment-output" tabIndex={0}>{JSON.stringify(result,null,2)}</pre></details>
  <details><summary>Xem code đang tạo kết quả (TypeScript)</summary><CodeBlock text={source} lang="typescript"/></details>
  <details><summary>Đối chiếu Python cùng đầu vào</summary><CodeBlock text={python} lang="python"/></details>
 </div>;
}
