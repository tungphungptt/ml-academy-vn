import numpy as np
rng = np.random.default_rng(42)
X = np.vstack([rng.normal(0, 1, (50, 2)), rng.normal(3, 1, (50, 2))]); y = np.array([0] * 50 + [1] * 50)
idx = rng.permutation(100); tr, te = idx[:70], idx[70:]
from sklearn.neighbors import KNeighborsClassifier
m = KNeighborsClassifier(n_neighbors=5).fit(X[tr], y[tr])
print(f"Do chinh xac KNN (k=5): {m.score(X[te], y[te]):.3f}")
