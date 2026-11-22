import math

def finite(*values):
    if not all(math.isfinite(v) for v in values):
        raise ValueError('Values must be finite')

def vectorGeometry(ax, ay, bx, by):
    finite(ax, ay, bx, by)
    dot = ax*bx+ay*by
    normA, normB = math.hypot(ax, ay), math.hypot(bx, by)
    finite(dot, normA, normB)
    cosine = None if normA == 0 or normB == 0 else max(-1, min(1, (ax/normA)*(bx/normB)+(ay/normA)*(by/normB)))
    return dict(dot=dot, normA=normA, normB=normB, cosine=cosine,
                angle=None if cosine is None else math.acos(cosine)*180/math.pi)

def sampleMoments(values, ddof=0):
    if not values or ddof not in (0, 1) or len(values) <= ddof:
        raise ValueError('N must exceed ddof; ddof must be 0 or 1')
    finite(*values)
    mean = sum(values)/len(values)
    offsets = [x-mean for x in values]
    squares = [x*x for x in offsets]
    sumSquares = sum(squares)
    variance = sumSquares/(len(values)-ddof)
    std = math.sqrt(variance)
    finite(mean, variance, std)
    return dict(mean=mean, offsets=offsets, squares=squares, sumSquares=sumSquares,
                variance=variance, std=std, zscores=None if std == 0 else [x/std for x in offsets])

def betaUpdate(successes, trials, alpha, beta):
    finite(successes, trials, alpha, beta)
    if any(int(v) != v for v in (successes, trials, alpha, beta)) or not 0 <= successes <= trials <= 1000 or not 1 <= alpha <= 1000 or not 1 <= beta <= 1000:
        raise ValueError('Counts and prior parameters must be valid integers')
    a, b = successes+alpha, trials-successes+beta
    mode = None if a == b == 1 else 0 if a == 1 else 1 if b == 1 else (a-1)/(a+b-2)
    return dict(a=a, b=b, mle=None if trials == 0 else successes/trials, mean=a/(a+b), mode=mode)

def softmaxExample(logits, target, temperature=1):
    if len(logits) < 2 or int(target) != target or not 0 <= target < len(logits) or temperature <= 0:
        raise ValueError('Invalid logits, target or temperature')
    finite(*logits, temperature)
    target = int(target)
    scaled = [z/temperature for z in logits]
    finite(*scaled)
    maximum = max(scaled)
    exponentials = [math.exp(z-maximum) for z in scaled]
    total = sum(exponentials)
    probabilities = [x/total for x in exponentials]
    loss = math.log(total)+(maximum-scaled[target])
    gradients = [(p-(i == target))/temperature for i, p in enumerate(probabilities)]
    finite(loss, *gradients)
    return dict(scaled=scaled, exponentials=exponentials, sum=total,
                probabilities=probabilities, loss=loss, gradients=gradients)
