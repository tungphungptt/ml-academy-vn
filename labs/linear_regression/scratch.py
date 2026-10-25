import numpy as np
rng = np.random.default_rng(42)
x = np.array([1.0, 2.0, 3.0]); y = 2 * x
w, b, lr = 0.0, 0.0, 0.05
for epoch in range(500):
    err = (w * x + b) - y
    w -= lr * 2 * np.mean(err * x)
    b -= lr * 2 * np.mean(err)
print(f"w={w:.3f} b={b:.3f} mse={np.mean(((w*x+b)-y)**2):.6f}")
