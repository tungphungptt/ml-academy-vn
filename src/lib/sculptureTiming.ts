export type SculptureFrame = {phase:number;time:number;dt:number};

export function nextSculptureFrame(previous:SculptureFrame|null,time:number,fps:30|60):SculptureFrame|null{
 if(!previous)return{phase:time,time,dt:.016};
 const interval=1000/fps,elapsed=time-previous.phase;
 if(elapsed<interval-1)return null;
 return{phase:previous.phase+Math.floor((elapsed+1)/interval)*interval,time,dt:Math.min(.05,(time-previous.time)/1000)};
}
