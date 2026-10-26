"""Observed-rating matrix factorization as learned user/item embeddings."""
import copy
import json
import numpy as np
import torch
from torch import nn

torch.set_num_threads(1)
torch.manual_seed(31)
torch.use_deterministic_algorithms(True)
rng = np.random.default_rng(31)
users, items, rank = 30, 24, 3
true_u, true_i = rng.normal(size=(users, rank)), rng.normal(size=(items, rank))
ratings = 3 + true_u @ true_i.T / np.sqrt(rank) + rng.normal(0, .03, (users, items))
u, i = np.indices(ratings.shape)
pairs = torch.tensor(np.c_[u.ravel(), i.ravel()], dtype=torch.long)
y = torch.tensor(ratings.ravel(), dtype=torch.float32)
order = rng.permutation(len(y))
train, val, test = order[:504], order[504:612], order[612:]
assert len(np.unique(pairs[train, 0])) == users and len(np.unique(pairs[train, 1])) == items
mean = y[train].mean().item()

class Recommender(nn.Module):
    def __init__(self):
        super().__init__()
        self.user = nn.Embedding(users, rank)
        self.item = nn.Embedding(items, rank)
        self.ub = nn.Embedding(users, 1)
        self.ib = nn.Embedding(items, 1)
        nn.init.normal_(self.user.weight, std=.1)
        nn.init.normal_(self.item.weight, std=.1)
        nn.init.zeros_(self.ub.weight)
        nn.init.zeros_(self.ib.weight)
    def forward(self, p):
        return mean + (self.user(p[:, 0])*self.item(p[:, 1])).sum(1) + self.ub(p[:, 0]).squeeze(1) + self.ib(p[:, 1]).squeeze(1)

net = Recommender()
opt = torch.optim.AdamW(net.parameters(), lr=.04, weight_decay=.01)
best, state = float('inf'), None
for _ in range(250):
    net.train()
    opt.zero_grad(set_to_none=True)
    loss = nn.functional.mse_loss(net(pairs[train]), y[train])
    assert torch.isfinite(loss)
    loss.backward()
    opt.step()
    net.eval()
    with torch.no_grad():
        vl = nn.functional.mse_loss(net(pairs[val]), y[val]).item()
    if vl < best:
        best, state = vl, copy.deepcopy(net.state_dict())
net.load_state_dict(state)
net.eval()
with torch.no_grad():
    rmse = nn.functional.mse_loss(net(pairs[test]), y[test]).sqrt().item()
    baseline = ((y[test]-mean)**2).mean().sqrt().item()
assert np.isfinite(rmse) and rmse < baseline, 'Embeddings should recover this synthetic low-rank signal'
print(json.dumps({'baseline_rmse': round(baseline, 4), 'test_rmse': round(rmse, 4), 'test_ratings': len(test), 'train_ratings': len(train), 'val_ratings': len(val)}, sort_keys=True))
