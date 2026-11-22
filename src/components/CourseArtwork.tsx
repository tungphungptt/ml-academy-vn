const rounded=(n:number)=>Number(n.toFixed(3));
export function courseArtworkVariant(slug:string){return /deep|dl/.test(slug)?2:/math|python|foundation/.test(slug)?0:1;}

export default function CourseArtwork({variant=0}:{variant?:number}){
 const nodes=Array.from({length:36},(_,i)=>({x:55+(i%6)*38,y:45+Math.floor(i/6)*32}));
 return <svg className="course-artwork" viewBox="0 0 320 240" aria-hidden="true" focusable="false">
  {variant===0?<>
   {Array.from({length:9},(_,i)=><path key={i} d={`M${30+i*25} 200 Q${120+i*12} ${125-i*9} ${270-i*6} 25`} fill="none" stroke="currentColor" strokeOpacity={.15+i*.055}/>) }
   <path d="M45 195V40 M45 195H285 M45 195L225 62" fill="none" stroke="currentColor" strokeWidth="1.5"/>
   {[[45,195],[130,133],[225,62]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="7" fill="var(--bg2)" stroke="currentColor" strokeWidth="2"/><circle cx={x} cy={y} r="2" fill="currentColor"/></g>)}
  </>:variant===1?<>
   {nodes.map((p,i)=><circle key={i} cx={p.x} cy={rounded(p.y+Math.sin(i*2.7)*12)} r={i%3===0?4:2.5} fill={p.y>180-p.x*.4?'currentColor':'var(--bg2)'} stroke="currentColor" strokeOpacity=".7"/>)}
   <path d="M35 190C90 170 120 70 170 84S240 130 290 40" fill="none" stroke="currentColor" strokeWidth="2"/>
   <path d="M35 210C90 190 120 90 170 104S240 150 290 60 M35 170C90 150 120 50 170 64S240 110 290 20" fill="none" stroke="currentColor" strokeOpacity=".18"/>
  </>:<>
   {[0,1,2].flatMap(layer=>Array.from({length:layer===1?5:3},(_,i)=>({x:65+layer*95,y:layer===1?35+i*42:68+i*52,layer}))).map((node,i,all)=><g key={i}>{all.filter(n=>n.layer===node.layer+1).map((n,j)=><path key={j} d={`M${node.x} ${node.y}C${node.x+45} ${node.y} ${n.x-45} ${n.y} ${n.x} ${n.y}`} fill="none" stroke="currentColor" strokeOpacity=".2"/>)}<circle cx={node.x} cy={node.y} r={node.layer===1?8:11} fill="var(--bg2)" stroke="currentColor" strokeWidth="1.5"/><circle cx={node.x} cy={node.y} r="3" fill="currentColor"/></g>)}
  </>}
 </svg>;
}
