"use client";
import {useEffect,useRef,useState,type RefObject} from 'react';
import {stepDisclosureSpring} from '@/lib/disclosureSpring';
/** One live spring, no animation lock. Only transform/opacity consume its value. */
export default function useDisclosureMotion(ref:RefObject<HTMLElement|null>,open:boolean){
  const state=useRef({position:0,velocity:0}),[present,setPresent]=useState(false),[mobile,setMobile]=useState(false);
  useEffect(()=>{
    const query=matchMedia('(max-width: 1050px)'),update=()=>setMobile(query.matches);
    update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);
  },[]);
  useEffect(()=>{
    const element=ref.current;if(!element)return;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)'),target=open?1:0;
    let frame=0,last=performance.now();
    const draw=()=>element.style.setProperty('--disclosure-progress',String(state.current.position));
    const finish=()=>{state.current={position:target,velocity:0};draw();setPresent(open);};
    const tick=(now:number)=>{
      if(reduced.matches){finish();return;}
      state.current=stepDisclosureSpring(state.current,target,(now-last)/1000);last=now;draw();
      if(Math.abs(state.current.position-target)<.001&&Math.abs(state.current.velocity)<.01)finish();else frame=requestAnimationFrame(tick);
    };
    if(open)setPresent(true);
    if(reduced.matches)finish();else frame=requestAnimationFrame(tick);
    const preference=()=>{if(reduced.matches){cancelAnimationFrame(frame);finish();}};
    reduced.addEventListener('change',preference);
    return()=>{cancelAnimationFrame(frame);reduced.removeEventListener('change',preference);};
  },[open,ref]);
  return {present,mobile};
}
