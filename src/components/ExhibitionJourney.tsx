"use client";
import {useEffect,useRef,useState} from 'react';
import NeuralSculpture from './NeuralSculpture';
import Icon from './Icon';
const chapters=[
 {id:'journey-data',name:'Dữ liệu',title:'Mọi điều bắt đầu từ quan sát.',copy:'Một điểm đo. Một hình ảnh. Một câu nói. Dữ liệu là những dấu vết để ta đặt câu hỏi — trước khi vội tìm một mô hình.',href:'/learn/data-preparation',action:'Học cách nhìn vào dữ liệu'},
 {id:'journey-model',name:'Mô hình',title:'Tìm một cách biểu diễn thế giới.',copy:'Mô hình biến đầu vào thành một dự đoán bằng các phép tính và tham số. Hiểu từng lớp, từng trọng số để biết điều gì đang diễn ra.',href:'/learn/mlp',action:'Khám phá mạng neural'},
 {id:'journey-learning',name:'Quá trình học',title:'Sai một chút. Hiểu thêm một chút.',copy:'Hàm mất mát đo sai lệch. Gradient chỉ hướng thay đổi tham số. Những bước nhỏ lặp lại tạo nên quá trình tối ưu — với điều kiện và giới hạn cần hiểu.',href:'/learn/gradient-descent',action:'Theo dấu một bước học'},
 {id:'journey-prediction',name:'Dự đoán',title:'Một kết quả. Và những câu hỏi mới.',copy:'Dự đoán không phải sự thật chắc chắn. Đọc chỉ số, kiểm tra trên dữ liệu chưa thấy và hiểu cái giá của mỗi kiểu sai trước khi sử dụng mô hình.',href:'/learn/metrics',action:'Học cách đánh giá kết quả'},
];
export default function ExhibitionJourney(){
 const root=useRef<HTMLElement>(null),art=useRef<HTMLDivElement>(null),[active,setActive]=useState(0);
 useEffect(()=>{let frame=0;const update=()=>{frame=0;if(innerWidth<=800)return;const sections=root.current?.querySelectorAll<HTMLElement>('[data-chapter]');if(!sections)return;let chosen=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<innerHeight*.32)chosen=i;});setActive(chosen);};const scroll=()=>{if(!frame)frame=requestAnimationFrame(update);};addEventListener('scroll',scroll,{passive:true});addEventListener('resize',scroll);update();return()=>{removeEventListener('scroll',scroll);removeEventListener('resize',scroll);cancelAnimationFrame(frame);};},[]);
 useEffect(()=>{const fit=()=>{if(art.current)art.current.dataset.stickyFit=String(art.current.clientHeight<innerHeight-(document.querySelector('.site-header')?.getBoundingClientRect().height??80)-24);};const observer=new ResizeObserver(fit);if(art.current)observer.observe(art.current);addEventListener('resize',fit);fit();return()=>{observer.disconnect();removeEventListener('resize',fit);};},[]);
 return <section ref={root} className="exhibition-journey" aria-label="Từ dữ liệu đến dự đoán">
  <header className="hero exhibition-hero" data-chapter="0" id="journey-data"><div className="hero-copy"><h1><span className="cover-title">Hiểu AI.</span><span className="cover-title-next">Mở một thế giới.</span></h1></div><div className="cover-deck"><p>Học bằng tiếng Việt. Nhìn thấy cách mô hình hoạt động. Tự tay kiểm chứng điều bạn vừa hiểu.</p><div className="actions"><a className="btn primary" href="/courses">Bắt đầu khám phá<Icon name="arrow" /></a><a className="text-link" href="#journey-model">Theo hành trình<Icon name="chevron" /></a></div><p className="journey-opening">Từ một điểm dữ liệu đến một điều có thể giải thích.</p></div></header>
  <div className="journey-story">
   {chapters.slice(1).map((chapter,index)=><section key={chapter.id} className="journey-chapter" id={chapter.id} data-chapter={index+1}><span className="journey-number" aria-hidden="true">0{index+2}</span><h2>{chapter.title}</h2><p>{chapter.copy}</p><a className="text-link" href={chapter.href}>{chapter.action}<Icon name="arrow" /></a></section>)}
  </div>
  <div ref={art} className="journey-art"><NeuralSculpture stage={active}/><label className="journey-stage-picker">Cấu trúc đang xem<select value={active} onChange={e=>setActive(Number(e.target.value))}>{chapters.map((chapter,index)=><option key={chapter.id} value={index}>{chapter.name}</option>)}</select></label><nav className="journey-index" aria-label="Các chặng của hành trình">{chapters.map((chapter,index)=><a key={chapter.id} href={'#'+chapter.id} onClick={()=>{if(innerWidth<=800)setActive(index);}} aria-current={active===index?'step':undefined}><span>0{index+1}</span>{chapter.name}</a>)}</nav><p className="journey-art-note"><span className="journey-scroll-hint">Cuộn để biến đổi cấu trúc</span><span className="journey-picker-hint">Chọn cấu trúc để xem từng chặng</span> · chọn vùng sáng để khám phá</p></div>
 </section>;
}
