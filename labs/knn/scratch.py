import numpy as np
rng = np.random.default_rng(42)
X = np.vstack([rng.normal(0, 1, (50, 2)), rng.normal(3, 1, (50, 2))]); y = np.array([0] * 50 + [1] * 50)
idx = rng.permutation(100); tr, te = idx[:70], idx[70:]
def predict(q, k=5):
    d = np.linalg.norm(X[tr] - q, axis=1)
    return np.bincount(y[tr][np.argsort(d)[:k]]).argmax()
acc = np.mean([predict(X[i]) == y[i] for i in te])
print(f"Do chinh xac KNN (k=5): {acc:.3f}")
