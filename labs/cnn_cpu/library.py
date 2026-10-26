"""Train a small CNN on bundled Digits, CPU only; no network download."""
import argparse
import copy
import json
import os
import sys
from pathlib import Path
import numpy as np
import torch
from torch import nn
from torch.nn import functional as F
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

parser = argparse.ArgumentParser()
parser.add_argument('--augment', action='store_true')
# A notebook kernel owns sys.argv (including its -f connection file).
# Notebook cells use the default experiment; terminal CLI flags stay strict.
args = parser.parse_args([] if 'ipykernel' in sys.modules else None)
torch.set_num_threads(1)
torch.manual_seed(17)
torch.use_deterministic_algorithms(True)
rng = np.random.default_rng(17)
X, y = load_digits(return_X_y=True)
trainval, test = train_test_split(np.arange(len(y)), test_size=.2, random_state=17, stratify=y)
train, val = train_test_split(trainval, test_size=.2, random_state=18, stratify=y[trainval])
images = torch.tensor(X.reshape(-1, 1, 8, 8) / 16., dtype=torch.float32)
labels = torch.tensor(y, dtype=torch.long)
net = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2), nn.Flatten(), nn.Linear(8*4*4, 10))
opt = torch.optim.AdamW(net.parameters(), lr=.01, weight_decay=1e-4)
scheduler = torch.optim.lr_scheduler.StepLR(opt, step_size=8, gamma=.5)
best_loss, best_state, best_epoch, bad = float('inf'), None, 0, 0
history = []
for epoch in range(16):
    net.train()
    total = 0.
    for ids in np.array_split(rng.permutation(train), int(np.ceil(len(train)/64))):
        batch = images[ids]
        if args.augment:
            dy, dx = rng.integers(0, 3, 2)
            batch = F.pad(batch, (1, 1, 1, 1))[:, :, dy:dy+8, dx:dx+8]
        opt.zero_grad(set_to_none=True)
        loss = F.cross_entropy(net(batch), labels[ids])
        assert torch.isfinite(loss)
        loss.backward()
        nn.utils.clip_grad_norm_(net.parameters(), 5.)
        opt.step()
        total += loss.item() * len(ids)
    net.eval()
    with torch.no_grad():
        vl = F.cross_entropy(net(images[val]), labels[val]).item()
    history.append({'epoch': epoch+1, 'train_loss': total/len(train), 'val_loss': vl})
    if vl < best_loss:
        best_loss, best_state, best_epoch, bad = vl, copy.deepcopy(net.state_dict()), epoch+1, 0
    else:
        bad += 1
    scheduler.step()
    if bad >= 4:
        break
net.load_state_dict(best_state)
net.eval()
with torch.no_grad():
    logits = net(images[test])
    accuracy = (logits.argmax(1) == labels[test]).float().mean().item()
assert accuracy > .65, 'A trained classifier must exceed the 0.1 chance baseline'
# Baseline is trained on train only; the held-out test is evaluated once here.
baseline = LogisticRegression(max_iter=1500).fit(X[train]/16., y[train]).score(X[test]/16., y[test])
out = Path(os.environ.get('ML_ACADEMY_OUTPUT_DIR', '.local/curriculum-output'))
out.mkdir(parents=True, exist_ok=True)
torch.save(net.state_dict(), out/'cnn.pt')
reloaded = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2), nn.Flatten(), nn.Linear(8*4*4, 10))
reloaded.load_state_dict(torch.load(out/'cnn.pt', map_location='cpu', weights_only=True))
reloaded.eval()
with torch.no_grad():
    assert torch.equal(logits, reloaded(images[test]))
(out/'cnn-curves.json').write_text(json.dumps(history, indent=2))
print(json.dumps({'augmentation': args.augment, 'baseline_accuracy': round(baseline, 4), 'best_epoch': best_epoch, 'reload_equal': True, 'test_accuracy': round(accuracy, 4), 'test_samples': len(test), 'train_samples': len(train), 'val_samples': len(val)}, sort_keys=True))
