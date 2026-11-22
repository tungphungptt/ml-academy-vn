"use client";
import {useEffect,useState,type ReactNode} from 'react';

export default function LessonPreparation({description,children}:{description:string;children:ReactNode}){
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 return <><details inert={!ready} aria-busy={!ready}><summary aria-disabled={!ready}>Mục tiêu và chuẩn bị<span>{description}</span></summary>{children}</details><noscript><div><strong>Mục tiêu và chuẩn bị</strong>{children}</div></noscript></>;
}
