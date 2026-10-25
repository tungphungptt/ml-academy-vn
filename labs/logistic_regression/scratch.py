import numpy as np
rng = np.random.default_rng(0)
X = np.vstack([rng.normal(-1.5, 1, (100, 2)), rng.normal(1.5, 1, (100, 2))]); y = np.array([0] * 100 + [1] * 100)
w, b = np.zeros(2), 0.0
for _ in range(1000):
    p = 1 / (1 + np.exp(-(X @ w + b)))
    w -= 0.1 * X.T @ (p - y) / len(y); b -= 0.1 * np.mean(p - y)
p = 1 / (1 + np.exp(-(X @ w + b)))
loss = -np.mean(y * np.log(p) + (1 - y) * np.log(1 - p))
print(f"loss={loss:.4f} accuracy={np.mean((p > 0.5) == y):.3f}")
