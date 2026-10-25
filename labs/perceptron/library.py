import numpy as np
rng = np.random.default_rng(0)
X = np.vstack([rng.normal(-3, 0.8, (100, 2)), rng.normal(3, 0.8, (100, 2))]); y = np.array([0] * 100 + [1] * 100)
from sklearn.linear_model import Perceptron
m = Perceptron(random_state=0).fit(X, y)
print(f"accuracy={m.score(X, y):.3f}")
