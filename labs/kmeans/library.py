import numpy as np
rng = np.random.default_rng(42)
X = np.vstack([rng.normal(c, 0.6, (40, 2)) for c in ([0, 0], [5, 0], [2.5, 5])])
from sklearn.cluster import KMeans
m = KMeans(n_clusters=3, n_init=10, random_state=42).fit(X)
print(f"Inertia: {m.inertia_:.2f}")
