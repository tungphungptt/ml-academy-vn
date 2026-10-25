import numpy as np
rng = np.random.default_rng(0)
X = np.vstack([rng.normal(-3, 0.8, (100, 2)), rng.normal(3, 0.8, (100, 2))]); y = np.array([0] * 100 + [1] * 100)
t = 2 * y - 1; w, b = np.zeros(2), 0.0
for epoch in range(1, 101):
    errs = 0
    for xi, ti in zip(X, t):
        if ti * (xi @ w + b) <= 0: w += ti * xi; b += ti; errs += 1
    if errs == 0: break
print(f"epoch={epoch} loi_cuoi_epoch={errs} accuracy={np.mean(np.sign(X @ w + b) == t):.3f}")
