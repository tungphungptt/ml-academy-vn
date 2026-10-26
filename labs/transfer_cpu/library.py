"""Transfer from a locally trained Digits CNN to parity classification, CPU only."""
import copy
import json
import os
import runpy
from pathlib import Path
import numpy as np
import torch
from torch import nn
from sklearn.datasets import load_digits
from sklearn.model_selection import train_test_split

torch.set_num_threads(1)
# Pretrain here, rather than trusting an unrelated or downloaded checkpoint.
runpy.run_path('labs/cnn_cpu/library.py', run_name='__main__')
torch.manual_seed(53)
rng = np.random.default_rng(53)
X, digits = load_digits(return_X_y=True)
trainval, test = train_test_split(np.arange(len(digits)), test_size=.2, random_state=17, stratify=digits)
train, val = train_test_split(trainval, test_size=.2, random_state=18, stratify=digits[trainval])
images = torch.tensor(X.reshape(-1, 1, 8, 8)/16, dtype=torch.float32)
y = torch.tensor(digits % 2, dtype=torch.long)
out = Path(os.environ.get('ML_ACADEMY_OUTPUT_DIR', '.local/curriculum-output'))
source = nn.Sequential(nn.Conv2d(1,8,3,padding=1),nn.ReLU(),nn.MaxPool2d(2),nn.Flatten(),nn.Linear(128,10))
source.load_state_dict(torch.load(out/'cnn.pt',map_location='cpu',weights_only=True))
source.eval()
body = nn.Sequential(*list(source.children())[:-1])
net = nn.Sequential(body, nn.Linear(128,2))
for p in body.parameters():
    p.requires_grad_(False)
frozen_before = copy.deepcopy(body.state_dict())

def fit(optimizer, epochs, freeze):
    best, state = float('inf'), None
    for _ in range(epochs):
        net.train()
        if freeze:
            body.eval()
        for ids in np.array_split(rng.permutation(train), 18):
            optimizer.zero_grad(set_to_none=True)
            loss = nn.functional.cross_entropy(net(images[ids]), y[ids])
            assert torch.isfinite(loss)
            loss.backward()
            optimizer.step()
        net.eval()
        with torch.no_grad():
            vl = nn.functional.cross_entropy(net(images[val]), y[val]).item()
        if vl < best:
            best, state = vl, copy.deepcopy(net.state_dict())
    net.load_state_dict(state)
    net.eval()
    return state

fit(torch.optim.Adam(net[1].parameters(), lr=.01), 12, True)
assert all(torch.equal(v,body.state_dict()[k]) for k,v in frozen_before.items())
# Unfreeze only after frozen-feature extraction; use a smaller backbone LR.
for p in body.parameters():
    p.requires_grad_(True)
frozen = copy.deepcopy(net)
fit(torch.optim.Adam([{'params':body.parameters(),'lr':.001},{'params':net[1].parameters(),'lr':.005}]),12,False)
with torch.no_grad():
    frozen_acc = (frozen(images[test]).argmax(1)==y[test]).float().mean().item()
    tuned_acc = (net(images[test]).argmax(1)==y[test]).float().mean().item()
print(json.dumps({'backbone_unchanged_when_frozen':True,'fine_tune_accuracy':round(tuned_acc,4),'frozen_accuracy':round(frozen_acc,4),'target':'digit parity; same-domain transfer'},sort_keys=True))
