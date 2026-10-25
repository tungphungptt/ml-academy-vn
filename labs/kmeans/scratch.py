import numpy as np
rng = np.random.default_rng(42)
X = np.vstack([rng.normal(c, 0.6, (40, 2)) for c in ([0, 0], [5, 0], [2.5, 5])])
C = X[rng.choice(len(X), 3, replace=False)]
for _ in range(20):
    a = np.argmin(((X[:, None] - C[None]) ** 2).sum(-1), axis=1)
    C = np.array([X[a == k].mean(0) if (a == k).any() else C[k] for k in range(3)])
print(f"Inertia: {((X - C[a]) ** 2).sum():.2f}")
