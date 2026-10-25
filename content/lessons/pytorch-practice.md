**Cấp độ:** Intermediate · **Tiên quyết:** MLP, Backpropagation, CNN, Optimizers.
**Mục tiêu:** biết khung huấn luyện chuẩn của PyTorch và cách tính shape khi xây CNN.

## Vòng lặp huấn luyện
Mỗi bước: đặt gradient về 0, tính tiến, tính loss, lan truyền ngược, cập nhật tham số. Chuyển `model.train()` khi huấn luyện và `model.eval()` kèm `torch.no_grad()` khi đánh giá.

## Ví dụ tính shape cho CNN (ảnh xám 28×28)
Conv 3×3 (padding 1) lên 8 kênh giữ kích thước 28×28; max pooling 2×2 còn 14×14; làm phẳng ra $8\cdot14\cdot14=1568$ đặc trưng; lớp tuyến tính 1568→10 có $1568\cdot10+10=15690$ tham số.

![Shape qua các lớp của CNN](/img/pytorch-practice.svg)

## Code và cách chạy
```python
n = 28; n = (n + 2 * 1 - 3) // 1 + 1; n //= 2
print(n, 8 * n * n, 8 * n * n * 10 + 10)
```
Kết quả kỳ vọng (đã chạy cục bộ): `14 1568 15690`.

Mẫu CNN và vòng lặp huấn luyện (**chưa được chạy trong môi trường phát triển**; cần `pip install torch`; hãy thay `X, y` bằng dữ liệu thật, ví dụ từ `torchvision.datasets.MNIST`):
```python
import torch, torch.nn as nn
net = nn.Sequential(nn.Conv2d(1, 8, 3, padding=1), nn.ReLU(), nn.MaxPool2d(2), nn.Flatten(), nn.Linear(8 * 14 * 14, 10))
opt = torch.optim.Adam(net.parameters(), lr=1e-3); loss_fn = nn.CrossEntropyLoss()
X = torch.randn(64, 1, 28, 28); y = torch.randint(0, 10, (64,))   # dữ liệu giả để kiểm tra shape
for epoch in range(3):
    net.train(); opt.zero_grad(); loss = loss_fn(net(X), y); loss.backward(); opt.step()
print(net(X).shape)  # kỳ vọng: torch.Size([64, 10])
```

## Lỗi thường gặp
Sai thứ tự shape $(N,C,H,W)$; đưa softmax trước `CrossEntropyLoss` (loss này nhận logits); quên `eval()`; dữ liệu và mô hình ở khác thiết bị (CPU/GPU).

## Hạn chế
Dữ liệu giả trong ví dụ chỉ để kiểm tra shape, không học được gì có ý nghĩa. Muốn huấn luyện thật cần dữ liệu thật, nhiều epoch, mini-batch và có thể cần GPU (Google Colab hỗ trợ GPU nhưng không được đảm bảo).

## Bài tập
1. (Dễ) Tính số tham số của `Conv2d(1, 8, 3)` (có bias). 2. (Vừa) Thêm lớp conv thứ hai và tính lại shape. 3. (Khó) Huấn luyện trên MNIST và vẽ đường cong loss.

## Tóm tắt
Vòng lặp: zero_grad, forward, loss, backward, step; luôn kiểm tra shape trước khi huấn luyện.
