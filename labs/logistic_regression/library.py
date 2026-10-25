import numpy as np
rng = np.random.default_rng(0)
X = np.vstack([rng.normal(-1.5, 1, (100, 2)), rng.normal(1.5, 1, (100, 2))]); y = np.array([0] * 100 + [1] * 100)
from sklearn.linear_model import LogisticRegression
m = LogisticRegression().fit(X, y)
print(f"accuracy={m.score(X, y):.3f}")
