from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
import numpy as np
X, y = load_iris(return_X_y=True)
tr, te = train_test_split(np.arange(len(y)), test_size=.3, random_state=42, stratify=y)
# Three classes select the multinomial objective; this estimator also has L2 penalty.
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1500))
model.fit(X[tr],y[tr])
print(f'test_accuracy={model.score(X[te],y[te]):.3f}')
