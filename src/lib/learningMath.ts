// Pure, deterministic teaching models. Inputs and intermediate values are shared
// by controls, SVG, tables and output. No training service or hidden randomness.
export function finite(...values: number[]) {
  if (values.some(v => !Number.isFinite(v))) throw new Error('Đầu vào phải là số hữu hạn.');
}
export function quadratic(x: number, h: number) {
  finite(x, h);
  if (h <= 0) throw new Error('Bước sai phân h phải lớn hơn 0.');
  const value = x*x, plus = (x+h)**2, minus = (x-h)**2;
  const result={value, plus, minus, derivative: 2*x, forward: (plus-value)/h, central: (plus-minus)/(2*h)};
  finite(...Object.values(result));
  return result;
}
export function linear(w: number, b: number, lastY = 6) {
  finite(w, b, lastY);
  const x = [1,2,3], y = [2,4,lastY];
  const rows = x.map((xi,i) => {
    const prediction = w*xi+b, error = prediction-y[i];
    return {x:xi,y:y[i],prediction,error,squared:error*error,dw:2*error*xi/3,db:2*error/3};
  });
  const loss=rows.reduce((s,r)=>s+r.squared,0)/3;
  const dw=rows.reduce((s,r)=>s+r.dw,0), db=rows.reduce((s,r)=>s+r.db,0);
  finite(loss,dw,db);
  return {rows,loss,dw,db};
}
export function descent(w: number, b: number, eta: number, lastY = 6) {
  finite(eta);
  if (eta < 0) throw new Error('Learning rate không được âm.');
  const before=linear(w,b,lastY);
  // Both parameters use the same old state, not an in-place mixed update.
  const nextW=w-eta*before.dw, nextB=b-eta*before.db;
  const after=linear(nextW,nextB,lastY);
  return {before,w:nextW,b:nextB,after};
}
export function backprop(x: number, w1: number, w2: number, target: number) {
  finite(x,w1,w2,target);
  const a=w1*x, h=Math.max(0,a), prediction=w2*h, error=prediction-target;
  const loss=.5*error*error, dPrediction=error, dh=error*w2;
  // At a=0 choose the documented ReLU convention 0; no classical derivative there.
  const gate=a>0?1:0, da=dh*gate, dw1=da*x, dw2=error*h;
  finite(loss,dw1,dw2);
  return {a,h,prediction,error,loss,dPrediction,dh,gate,da,dw1,dw2,kink:a===0};
}

export function sigmoid(z: number) {
  finite(z);
  const tail = Math.exp(-Math.abs(z));
  return z >= 0 ? 1 / (1 + tail) : tail / (1 + tail);
}

export function binaryLogit(x: number, w: number, b: number, y: number) {
  finite(x, w, b, y);
  if (y !== 0 && y !== 1) throw new Error('Nhãn nhị phân phải bằng 0 hoặc 1.');
  const z = w * x + b;
  finite(z);
  const probability = sigmoid(z);
  const loss = (y === 1 ? Math.max(-z, 0) : Math.max(z, 0)) + Math.log1p(Math.exp(-Math.abs(z)));
  const dz = probability - y, dw = dz * x, db = dz;
  finite(loss, dw, db);
  return {z, probability, loss, dz, dw, db};
}

export function regressionLoss(error: number, delta: number) {
  finite(error, delta);
  if (delta <= 0) throw new Error('Delta phải lớn hơn 0.');
  const magnitude = Math.abs(error), mse = error * error, mae = magnitude;
  const huber = magnitude <= delta ? .5 * mse : delta * (magnitude - .5 * delta);
  const dmse = 2 * error, dmae = error === 0 ? null : Math.sign(error);
  const dhuber = magnitude <= delta ? error : delta * Math.sign(error);
  finite(mse, huber, dmse, dhuber);
  return {error, delta, mse, mae, huber, dmse, dmae, dhuber};
}

export type ActivationKind = 'sigmoid' | 'tanh' | 'relu' | 'leaky';
export function activation(x: number, kind: ActivationKind, alpha = .01) {
  finite(x, alpha);
  if (alpha < 0 || alpha > 1) throw new Error('Thí nghiệm giới hạn alpha trong [0, 1].');
  let value: number, derivative: number;
  switch (kind) {
    case 'sigmoid': value = sigmoid(x); derivative = value * (1 - value); break;
    case 'tanh': value = Math.tanh(x); derivative = 1 - value * value; break;
    case 'relu': value = Math.max(0, x); derivative = x > 0 ? 1 : 0; break;
    case 'leaky': value = x >= 0 ? x : alpha * x; derivative = x > 0 ? 1 : alpha; break;
    default: throw new Error('Hàm kích hoạt không được hỗ trợ.');
  }
  return {value, derivative, kink: x === 0 && (kind === 'relu' || (kind === 'leaky' && alpha !== 1))};
}
