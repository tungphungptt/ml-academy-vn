"""NeuralClone: deterministic scalar teaching examples, Python 3 standard library.
Same conventions as src/lib/learningMath.ts; no external data or training claim.
"""
import math

def finite(*values):
    if not all(math.isfinite(v) for v in values):
        raise ValueError('Inputs must be finite')

def quadratic(x, h):
    finite(x, h)
    if h <= 0:
        raise ValueError('h must be positive')
    value, plus, minus = x*x, (x+h)**2, (x-h)**2
    result = dict(value=value, plus=plus, minus=minus, derivative=2*x,
                  forward=(plus-value)/h, central=(plus-minus)/(2*h))
    finite(*result.values())
    return result

def linear(w, b, lastY=6):
    finite(w, b, lastY)
    rows = []
    for x, y in zip([1, 2, 3], [2, 4, lastY]):
        prediction = w*x+b
        error = prediction-y
        rows.append(dict(x=x, y=y, prediction=prediction, error=error,
                         squared=error*error, dw=2*error*x/3, db=2*error/3))
    loss = sum(r['squared'] for r in rows)/3
    dw, db = sum(r['dw'] for r in rows), sum(r['db'] for r in rows)
    finite(loss, dw, db)
    return dict(rows=rows, loss=loss, dw=dw, db=db)

def descent(w, b, eta, lastY=6):
    finite(eta)
    if eta < 0:
        raise ValueError('eta must be nonnegative')
    before = linear(w, b, lastY)
    next_w, next_b = w-eta*before['dw'], b-eta*before['db']
    return dict(before=before, w=next_w, b=next_b, after=linear(next_w, next_b, lastY))

def backprop(x, w1, w2, target):
    finite(x, w1, w2, target)
    a = w1*x
    h = max(0, a)
    prediction = w2*h
    error = prediction-target
    loss = .5*error*error
    dh = error*w2
    gate = 1 if a > 0 else 0
    da, dw2 = dh*gate, error*h
    dw1 = da*x
    finite(loss, dw1, dw2)
    return dict(a=a, h=h, prediction=prediction, error=error, loss=loss,
                dPrediction=error, dh=dh, gate=gate, da=da, dw1=dw1,
                dw2=dw2, kink=a == 0)

def sigmoid(z):
    finite(z)
    tail = math.exp(-abs(z))
    return 1 / (1 + tail) if z >= 0 else tail / (1 + tail)

def binaryLogit(x, w, b, y):
    finite(x, w, b, y)
    if y not in (0, 1):
        raise ValueError('Binary label must be 0 or 1')
    z = w*x+b
    finite(z)
    probability = sigmoid(z)
    loss = (max(-z, 0) if y == 1 else max(z, 0)) + math.log1p(math.exp(-abs(z)))
    dz = probability-y
    dw, db = dz*x, dz
    finite(loss, dw, db)
    return dict(z=z, probability=probability, loss=loss, dz=dz, dw=dw, db=db)

def regressionLoss(error, delta):
    finite(error, delta)
    if delta <= 0:
        raise ValueError('delta must be positive')
    magnitude = abs(error)
    mse, mae = error*error, magnitude
    huber = .5*mse if magnitude <= delta else delta*(magnitude-.5*delta)
    sign = 1 if error > 0 else -1 if error < 0 else 0
    dmse, dmae = 2*error, sign if error != 0 else None
    dhuber = error if magnitude <= delta else delta*sign
    finite(mse, huber, dmse, dhuber)
    return dict(error=error, delta=delta, mse=mse, mae=mae, huber=huber,
                dmse=dmse, dmae=dmae, dhuber=dhuber)

def activation(x, kind, alpha=.01):
    finite(x, alpha)
    if not 0 <= alpha <= 1:
        raise ValueError('alpha must be in [0, 1] in this experiment')
    if kind == 'sigmoid':
        value = sigmoid(x)
        derivative = value*(1-value)
    elif kind == 'tanh':
        value = math.tanh(x)
        derivative = 1-value*value
    elif kind == 'relu':
        value, derivative = max(0, x), 1 if x > 0 else 0
    elif kind == 'leaky':
        value, derivative = x if x >= 0 else alpha*x, 1 if x > 0 else alpha
    else:
        raise ValueError('Unknown activation')
    return dict(value=value, derivative=derivative,
                kink=x == 0 and (kind == 'relu' or (kind == 'leaky' and alpha != 1)))

if __name__ == '__main__':
    print('quadratic:', quadratic(1, .5))
    print('linear:', linear(1, 0))
    print('descent:', descent(1, 0, .05))
    print('backprop:', backprop(1, 2, 3, 5))
