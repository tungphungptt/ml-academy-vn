"""Real-data autoencoder, compared with PCA on an untouched Iris test split."""
import copy
import json
import numpy as np
import torch
from torch import nn
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

torch.set_num_threads(1)
torch.manual_seed(41)
torch.use_deterministic_algorithms(True)
X = load_iris().data
trainval, test = train_test_split(np.arange(len(X)), test_size=.2, random_state=41)
train, val = train_test_split(trainval, test_size=.25, random_state=42)
scale = StandardScaler().fit(X[train])
Z = torch.tensor(scale.transform(X), dtype=torch.float32)
net = nn.Sequential(nn.Linear(4, 8), nn.Tanh(), nn.Linear(8, 2), nn.Linear(2, 8), nn.Tanh(), nn.Linear(8, 4))
opt = torch.optim.Adam(net.parameters(), lr=.01)
best, state = float('inf'), None
for _ in range(250):
    net.train()
    opt.zero_grad(set_to_none=True)
    loss = nn.functional.mse_loss(net(Z[train]), Z[train])
    assert torch.isfinite(loss)
    loss.backward()
    opt.step()
    net.eval()
    with torch.no_grad():
        vl = nn.functional.mse_loss(net(Z[val]), Z[val]).item()
    if vl < best:
        best, state = vl, copy.deepcopy(net.state_dict())
net.load_state_dict(state)
net.eval()
with torch.no_grad():
    error = nn.functional.mse_loss(net(Z[test]), Z[test]).item()
pca = PCA(2).fit(Z[train].numpy())
baseline = np.mean((Z[test].numpy()-pca.inverse_transform(pca.transform(Z[test].numpy())))**2)
assert np.isfinite(error)
print(json.dumps({'pca_test_mse': round(float(baseline), 4), 'test_mse': round(error, 4), 'test_samples': len(test), 'train_samples': len(train), 'val_samples': len(val)}, sort_keys=True))
