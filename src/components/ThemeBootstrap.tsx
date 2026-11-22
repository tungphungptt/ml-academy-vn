"use client";
import {useRef} from 'react';
import {useServerInsertedHTML} from 'next/navigation';

export default function ThemeBootstrap(){
 const inserted=useRef(false);
 useServerInsertedHTML(()=>{
  if(inserted.current)return null;
  inserted.current=true;
  return <script id="neuralclone-theme-bootstrap" dangerouslySetInnerHTML={{__html:'try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}'}}/>;
 });
 return null;
}
