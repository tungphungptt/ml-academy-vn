"""Multiclass softmax regression from scratch on Iris; train-only scaling."""
import numpy as np
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
X, y = load_iris(return_X_y=True)
tr, te = train_test_split(np.arange(len(y)), test_size=.3, random_state=42, stratify=y)
mean, scale = X[tr].mean(0), X[tr].std(0)
A, B = (X[tr]-mean)/scale, (X[te]-mean)/scale
Y = np.eye(3)[y[tr]]
W, bias = np.zeros((4,3)), np.zeros(3)
for _ in range(500):
    logits = A@W+bias
    logits -= logits.max(1,keepdims=True)
    prob = np.exp(logits); prob /= prob.sum(1,keepdims=True)
    delta = (prob-Y)/len(tr)
    W -= .1*(A.T@delta)
    bias -= .1*delta.sum(0)
assert np.allclose(prob.sum(1),1)
accuracy = np.mean((B@W+bias).argmax(1)==y[te])
print(f'test_accuracy={accuracy:.3f}')
