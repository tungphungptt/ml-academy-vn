import numpy as np
from sklearn.linear_model import LinearRegression
x = np.array([[1.0], [2.0], [3.0]]); y = np.array([2.0, 4.0, 6.0])
m = LinearRegression().fit(x, y)
print(f"w={m.coef_[0]:.3f} b={m.intercept_:.3f}")
