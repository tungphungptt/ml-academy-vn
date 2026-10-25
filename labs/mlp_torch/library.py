import torch, torch.nn as nn
torch.manual_seed(0)
X = torch.tensor([[0., 0.], [0., 1.], [1., 0.], [1., 1.]]); y = torch.tensor([[0.], [1.], [1.], [0.]])
net = nn.Sequential(nn.Linear(2, 8), nn.Tanh(), nn.Linear(8, 1))
opt = torch.optim.Adam(net.parameters(), lr=0.05); loss_fn = nn.BCEWithLogitsLoss()
for _ in range(500):
    opt.zero_grad(); loss = loss_fn(net(X), y); loss.backward(); opt.step()  # forward -> loss -> backward -> update
print(f"loss={loss.item():.4f} pred={(torch.sigmoid(net(X)) > 0.5).int().flatten().tolist()}")
