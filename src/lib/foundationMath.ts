import {finite} from './learningMath';

export function vectorGeometry(ax:number,ay:number,bx:number,by:number){
 finite(ax,ay,bx,by);
 const dot=ax*bx+ay*by,normA=Math.hypot(ax,ay),normB=Math.hypot(bx,by);
 finite(dot,normA,normB);
 const cosine=normA===0||normB===0?null:Math.max(-1,Math.min(1,(ax/normA)*(bx/normB)+(ay/normA)*(by/normB)));
 return {dot,normA,normB,cosine,angle:cosine===null?null:Math.acos(cosine)*180/Math.PI};
}

export function sampleMoments(values:number[],ddof=0){
 if(!values.length||![0,1].includes(ddof)||values.length<=ddof)throw new Error('Cần N > ddof và ddof bằng 0 hoặc 1.');
 finite(...values);
 const mean=values.reduce((a,b)=>a+b,0)/values.length;
 const offsets=values.map(x=>x-mean),squares=offsets.map(x=>x*x),sumSquares=squares.reduce((a,b)=>a+b,0);
 const variance=sumSquares/(values.length-ddof),std=Math.sqrt(variance);
 finite(mean,variance,std);
 return {mean,offsets,squares,sumSquares,variance,std,zscores:std===0?null:offsets.map(x=>x/std)};
}

export function betaUpdate(successes:number,trials:number,alpha:number,beta:number){
 finite(successes,trials,alpha,beta);
 if(![successes,trials,alpha,beta].every(Number.isInteger)||trials<0||successes<0||successes>trials||alpha<1||beta<1||trials>1000||alpha>1000||beta>1000)throw new Error('Số đếm phải nguyên, 0 ≤ k ≤ n ≤ 1000; prior nguyên trong [1,1000].');
 const a=successes+alpha,b=trials-successes+beta;
 const mode=a===1&&b===1?null:a===1?0:b===1?1:(a-1)/(a+b-2);
 return {a,b,mle:trials===0?null:successes/trials,mean:a/(a+b),mode};
}

export function softmaxExample(logits:number[],target:number,temperature=1){
 if(logits.length<2||!Number.isInteger(target)||target<0||target>=logits.length||temperature<=0)throw new Error('Cần ít nhất hai lớp, nhãn hợp lệ và T > 0.');
 finite(...logits,temperature);
 const scaled=logits.map(z=>z/temperature);finite(...scaled);
 const max=Math.max(...scaled),exponentials=scaled.map(z=>Math.exp(z-max)),sum=exponentials.reduce((a,b)=>a+b,0);
 const probabilities=exponentials.map(x=>x/sum),loss=Math.log(sum)+(max-scaled[target]);
 const gradients=probabilities.map((p,i)=>(p-(i===target?1:0))/temperature);
 finite(loss,...gradients);
 return {scaled,exponentials,sum,probabilities,loss,gradients};
}
