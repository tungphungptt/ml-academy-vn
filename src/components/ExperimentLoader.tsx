"use client";
import {Component, useEffect, useState, type ReactNode} from 'react';
import dynamic from 'next/dynamic';
export type ExperimentKind='derivative'|'linear'|'descent'|'backprop'|'loss'|'logistic'|'activation'|'vectors'|'moments'|'bayes'|'softmax';
export type ExperimentProps={kind:ExperimentKind;source:string;python:string;pythonPath?:string};
const Experiment=dynamic(()=>import('./LearningExperiment'),{loading:()=> <p role="status">Đang mở thí nghiệm… Bạn vẫn có thể đọc bài bên dưới.</p>});
const ProbabilityExperiment=dynamic(()=>import('./ProbabilityExperiment'),{loading:()=> <p role="status">Đang mở thí nghiệm… Bạn vẫn có thể đọc bài bên dưới.</p>});
const FoundationExperiment=dynamic(()=>import('./FoundationExperiment'),{loading:()=> <p role="status">Đang mở thí nghiệm…</p>});
class ExperimentBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<p role="alert">Không tải được thí nghiệm. Bạn có thể tải ví dụ Python phía trên, hoặc tải lại trang để thử lại.</p>:this.props.children;}
}
export default function ExperimentLoader(props:ExperimentProps){
 const [open,setOpen]=useState(false),[ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 return <section className="learning-experiment" aria-label="Thí nghiệm gắn với công thức">
  <p>Thay tham số để tự kiểm chứng công thức, hình và code. Dữ liệu nhỏ phục vụ minh họa; kết quả được tính từ tham số bạn chọn.</p>
  {open?<ExperimentBoundary>{['vectors','moments','bayes','softmax'].includes(props.kind)?<FoundationExperiment key={props.kind} {...props}/>:['loss','logistic','activation'].includes(props.kind)?<ProbabilityExperiment {...props}/>:<Experiment {...props}/>}</ExperimentBoundary>:<button className="btn primary" disabled={!ready} onClick={()=>setOpen(true)}>Mở thí nghiệm</button>}
  <details className="experiment-downloads"><summary>Tải ví dụ để chạy trên máy</summary><p><a href={props.pythonPath??"/examples/learning_math.py"} download>Tải Python độc lập (.py)</a></p>{!props.pythonPath&&<p><a href="/notebooks/learning_math.ipynb" download>Tải notebook cùng mã nguồn (.ipynb)</a></p>}</details>
  <noscript><p>Thí nghiệm cần JavaScript. Công thức, ví dụ tính tay và Python tải về vẫn đọc được.</p></noscript>
 </section>;
}
