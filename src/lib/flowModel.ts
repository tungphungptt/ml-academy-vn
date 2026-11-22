/** Explicit toy forward pass: 2 inputs → 2 ReLU units → 1 sigmoid output.
 * Fixed weights, no training/calibration or accuracy claim. */
export function illustrativeForwardPass(x1=.6,x2=.3){
  const hidden=[Math.max(0,1.2*x1-.4*x2+.1),Math.max(0,-.3*x1+.9*x2+.2)];
  const logit=1.4*hidden[0]-.6*hidden[1]-.2;
  const score=1/(1+Math.exp(-logit));
  return {inputs:[x1,x2],hidden,logit,score,prediction:score>=.5?1:0};
}
