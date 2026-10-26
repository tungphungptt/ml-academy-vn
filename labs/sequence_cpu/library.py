"""One-step GRU forecasting with chronological train/validation/test boundaries."""
import copy
import json
import os
from pathlib import Path
import numpy as np
import torch
from torch import nn

torch.set_num_threads(1)
torch.manual_seed(23)
torch.use_deterministic_algorithms(True)
rng = np.random.default_rng(23)
t = np.arange(960)
series = np.sin(.055*t) + .4*np.sin(.13*t) + rng.normal(0, .03, len(t))
mu, sd = series[:640].mean(), series[:640].std()
z = (series-mu)/sd
lookback = 12
target_times = np.arange(lookback, len(z))
X = torch.tensor(np.array([z[i-lookback:i] for i in target_times]), dtype=torch.float32).unsqueeze(-1)
y = torch.tensor(z[target_times], dtype=torch.float32).unsqueeze(-1)
train = np.flatnonzero(target_times < 640)
val = np.flatnonzero((target_times >= 640) & (target_times < 800))
test = np.flatnonzero(target_times >= 800)
assert target_times[train].max() < target_times[val].min() < target_times[test].min()

class Forecaster(nn.Module):
    def __init__(self):
        super().__init__()
        self.rnn = nn.GRU(1, 16, batch_first=True)
        self.head = nn.Linear(16, 1)
    def forward(self, x):
        states, _ = self.rnn(x)
        return self.head(states[:, -1])

net = Forecaster()
opt = torch.optim.Adam(net.parameters(), lr=.01)
best, state, best_epoch = float('inf'), None, 0
curves = []
for epoch in range(40):
    net.train()
    losses = []
    for ids in np.array_split(rng.permutation(train), 10):
        opt.zero_grad(set_to_none=True)
        loss = nn.functional.mse_loss(net(X[ids]), y[ids])
        assert torch.isfinite(loss)
        loss.backward()
        nn.utils.clip_grad_norm_(net.parameters(), 1.)
        opt.step()
        losses.append(loss.item())
    net.eval()
    with torch.no_grad():
        vl = nn.functional.mse_loss(net(X[val]), y[val]).item()
    curves.append({'epoch': epoch+1, 'train_mse': float(np.mean(losses)), 'val_mse': vl})
    if vl < best:
        best, state, best_epoch = vl, copy.deepcopy(net.state_dict()), epoch+1
net.load_state_dict(state)
net.eval()
with torch.no_grad():
    pred = net(X[test])
    mse = nn.functional.mse_loss(pred, y[test]).item() * sd**2
    naive = nn.functional.mse_loss(X[test, -1], y[test]).item() * sd**2
assert np.isfinite(mse) and mse < .2
out = Path(os.environ.get('ML_ACADEMY_OUTPUT_DIR', '.local/curriculum-output'))
out.mkdir(parents=True, exist_ok=True)
(out/'sequence-curves.json').write_text(json.dumps(curves, indent=2))
print(json.dumps({'baseline_mse': round(naive, 6), 'best_epoch': best_epoch, 'test_mse': round(mse, 6), 'test_samples': len(test), 'train_samples': len(train), 'val_samples': len(val)}, sort_keys=True))
