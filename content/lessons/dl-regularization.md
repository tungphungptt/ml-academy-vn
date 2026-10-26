**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Chẩn đoán huấn luyện: khởi tạo, gradient và normalization, Optimizers.
**Mục tiêu:** hiểu Dropout, Batch Normalization, Weight Decay, Early Stopping và lập lịch learning rate.

## Vấn đề thực tế
Mạng sâu có rất nhiều tham số nên dễ overfit và khó huấn luyện ổn định. Các kỹ thuật dưới đây giúp mạng tổng quát hóa tốt và hội tụ nhanh hơn.

## Công thức và ý tưởng
- **Dropout (inverted):** khi huấn luyện, tắt ngẫu nhiên mỗi neuron với xác suất $1-p$ và chia đầu ra còn lại cho $p$ để kỳ vọng không đổi.
- **Batch Normalization:** chuẩn hóa theo lô $\hat x=\frac{x-\mu_B}{\sqrt{\sigma_B^2+\epsilon}}$ rồi co giãn bằng tham số học được.
- **Weight decay (L2):** cập nhật $w\leftarrow w-\eta(g+\lambda w)$.
- **Early stopping:** dừng khi loss validation không cải thiện sau `patience` epoch và giữ mô hình tốt nhất.
- **Lịch learning rate:** step decay $\eta_t=\eta_0\gamma^{\lfloor t/s\rfloor}$; cosine $\eta_t=\tfrac12\eta_0\big(1+\cos\tfrac{\pi t}{T}\big)$.
- **Khởi tạo trọng số:** dùng phương sai phù hợp (Xavier/He) để tín hiệu không co lại hoặc nổ ra qua các lớp.

![Dropout và BatchNorm](/img/dl-regularization.svg)

## Ví dụ từng bước
Dropout $p=0.8$ trên vector toàn 1 với một neuron bị tắt cho $(1.25,1.25,0,1.25,1.25)$. BatchNorm của lô $(1,2,3,4)$: $\mu=2.5,\sigma^2=1.25$ nên giá trị chuẩn hóa $\approx(-1.3416,-0.4472,0.4472,1.3416)$. Weight decay: $w=1,g=0.5,\eta=0.1,\lambda=0.01\Rightarrow w=0.949$.

## Code và cách chạy
```python
import numpy as np
x = np.ones(5); mask = np.array([1, 1, 0, 1, 1])
b = np.array([1.0, 2.0, 3.0, 4.0])
print((x * mask / 0.8).tolist(), ((b - b.mean()) / np.sqrt(b.var() + 1e-5)).round(4).tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `[1.25, 1.25, 0.0, 1.25, 1.25] [-1.3416, -0.4472, 0.4472, 1.3416]`.
```python
from math import cos, pi
w = 1 - 0.1 * (0.5 + 0.01 * 1)
v = [0.9, 0.7, 0.6, 0.62, 0.63, 0.64]
best_loss, best, bad, stop = float("inf"), 0, 0, None
for i, l in enumerate(v):
    if l < best_loss: best_loss, best, bad = l, i, 0
    else:
        bad += 1
        if bad >= 2: stop = i; break
print(round(w, 3), best, stop, round(0.1 * 0.5 ** (25 // 10), 3), round(0.5 * 0.1 * (1 + cos(pi * 50 / 100)), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.949 2 4 0.025 0.05`. Nghĩa là: $w=0.949$; epoch tốt nhất là 2 (đếm từ 0), dừng ở epoch 4 với patience 2; step decay ở epoch 25 cho $0.025$; cosine ở nửa chu kỳ cho $0.05$.

## Lỗi thường gặp
Quên `model.eval()` khi suy luận (Dropout và BatchNorm hoạt động khác khi huấn luyện); dùng Dropout cao ở lớp nhỏ; chọn tập validation trùng với tập test.

## Hạn chế
Mỗi kỹ thuật thêm siêu tham số cần tinh chỉnh; hiệu quả phụ thuộc kiến trúc và dữ liệu. Chưa có thí nghiệm huấn luyện thật trong bài này.

## Bài tập
1. (Dễ) Tính dropout với $p=0.5$ và mask $(1,0,1,0)$. 2. (Vừa) Tính step decay ở epoch 45. 3. (Khó) Thêm early stopping vào vòng lặp huấn luyện PyTorch.

## Tóm tắt
Dropout, BatchNorm, weight decay, early stopping và lịch learning rate giúp mạng sâu ổn định và tổng quát hóa tốt hơn.

## Điều kiện áp dụng và kiểm tra kết luận
Ký hiệu p trong công thức dropout của bài là xác suất giữ; PyTorch nn.Dropout(p) nhận xác suất bỏ. BatchNorm1d chuẩn hóa theo batch trên từng feature; LayerNorm chuẩn hóa các chiều cuối từng mẫu/token, không dùng running stats. Với batch nhỏ, BatchNorm có giới hạn và train/eval phải đúng. Công thức w←w−η(g+λw) là SGD kèm L2 theo convention tương ứng; AdamW có decay tách khỏi moment nên không gọi chung là cùng một L2 gradient cho mọi optimizer. Early stopping dùng validation; chọn patience hay scheduler qua test cũng là leakage. Best checkpoint phải được khôi phục trước inference, như [CNN CPU](/learn/cnn-cpu).

## Đáp án và tiêu chí chấm
1. Với input toàn 1, xác suất giữ 0.5 và mask (1,0,1,0), inverted dropout cho (2,0,2,0). Khi eval không nhân lại 0.5 nếu đã dùng convention inverted. (2 điểm).
2. Với η0=0.1, gamma=0.5, step_size=10, epoch=45 theo công thức bài cho 0.1·0.5^4=0.00625. Framework có convention thời điểm scheduler.step; nêu rõ index. (3 điểm).
3. Theo dõi val loss không gradient, cập nhật deepcopy(best_state) khi cải thiện, đếm patience, restore trước test. Không chỉ break rồi dùng trọng số epoch cuối kém hơn. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Multilayer Perceptrons (Dropout, weight decay)](https://d2l.ai/chapter_multilayer-perceptrons/index.html).
- [Stanford CS231n: Neural Networks Part 3](https://cs231n.github.io/neural-networks-3/).
