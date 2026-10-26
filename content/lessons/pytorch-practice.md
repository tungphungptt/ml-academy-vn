**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Regularization và Learning Rate Scheduling, Automatic Differentiation (Autograd).
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

Mẫu CNN và vòng lặp huấn luyện (**kiểm tra shape/gradient trên CPU**; không phải dữ liệu huấn luyện nhận dạng ảnh. Xem CNN CPU để dùng dataset thật):
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
Dữ liệu giả trong ví dụ chỉ để kiểm tra shape, không học được gì có ý nghĩa. Muốn huấn luyện thật, xem CNN CPU với Digits nhỏ, mini-batch và validation; không cần GPU.

## Bài tập
1. (Dễ) Tính số tham số của `Conv2d(1, 8, 3)` (có bias). 2. (Vừa) Thêm lớp conv thứ hai và tính lại shape. 3. (Khó) Huấn luyện trên MNIST và vẽ đường cong loss.

## Tóm tắt
Vòng lặp: zero_grad, forward, loss, backward, step; luôn kiểm tra shape trước khi huấn luyện.

## Điều kiện áp dụng và kiểm tra kết luận
Một vòng lặp học thực phải có train/validation/test, target có ý nghĩa và baseline. Tensor ngẫu nhiên trong đoạn kiểm tra CNN chỉ chứng minh shape/backward chạy, không chứng minh nhận dạng ảnh. [CNN CPU](/learn/cnn-cpu) dùng Digits thật và checkpoint theo validation; [chẩn đoán huấn luyện](/learn/training-diagnostics) giải thích dtype/axes/NaN. Epoch gồm nhiều minibatch step; zero_grad→forward→loss→backward→clip nếu cần→step. Train và eval không thay thế no_grad; khi lưu best state phải deepcopy hoặc ghi file, không giữ tham chiếu tới tensor tiếp tục bị update.

## Đáp án và tiêu chí chấm
1. Conv2d(1,8,3) có 3·3·1·8+8=80 tham số. (2 điểm).
2. Một phương án: sau pool còn N×8×14×14; Conv(8,16,3,padding=1) cho N×16×14×14. Nếu pool thêm 2 thì còn 16×7×7; phải đổi Linear tương ứng. (3 điểm).
3. Có thể dùng CNN CPU trong giáo trình thay cho tải MNIST. Ghi split, baseline, train/val curves, best checkpoint và test cuối. Không chấm đạt chỉ vì code in đúng shape. (5 điểm).

## Nguồn tham khảo
- [PyTorch Tutorials](https://docs.pytorch.org/tutorials/).
