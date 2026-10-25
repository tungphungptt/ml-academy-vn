**Cấp độ:** Intermediate · **Tiên quyết:** Gradient Descent.
**Mục tiêu:** hiểu Momentum và Adam khác gì Gradient Descent thuần.

## Vấn đề thực tế
Gradient Descent thuần dao động trên "thung lũng hẹp" và dùng chung một learning rate cho mọi tham số. Các bộ tối ưu hiện đại khắc phục hai điểm này.

## Công thức
**Momentum** (tích lũy hướng đi): $v\leftarrow\beta v+g,\ \theta\leftarrow\theta-\eta v$. $g=\nabla L$, $\beta$ (thường 0.9) là hệ số nhớ.
**Adam** (động lượng + learning rate thích nghi):
$$m=\beta_1 m+(1-\beta_1)g,\quad s=\beta_2 s+(1-\beta_2)g^2,\quad \hat m=\frac{m}{1-\beta_1^t},\ \hat s=\frac{s}{1-\beta_2^t},\quad \theta\leftarrow\theta-\eta\frac{\hat m}{\sqrt{\hat s}+\epsilon}$$
Các phép chia cho $1-\beta^t$ hiệu chỉnh sai lệch do khởi tạo $m,s$ bằng 0. Mặc định thường dùng: $\beta_1=0.9,\beta_2=0.999,\epsilon=10^{-8}$.

![Quỹ đạo GD và Momentum](/img/optimizers.svg)

## Ví dụ từng bước
Với $L=\theta^2$, $\theta_0=4$, $\eta=0.1$, $\beta=0.9$: bước 1: $g=8$, $v=8$, $\theta=3.2$. Bước 2: $g=6.4$, $v=0.9\cdot8+6.4=13.6$, $\theta=3.2-1.36=1.84$. Adam bước đầu: $\hat m=8,\ \hat s=64$ nên cập nhật $\approx\eta\cdot\operatorname{sign}(g)=0.1$, $\theta=3.9$.

## Code và cách chạy
```python
theta, v, lr, beta = 4.0, 0.0, 0.1, 0.9
for _ in range(2):
    g = 2 * theta
    v = beta * v + g
    theta -= lr * v
print(round(theta, 2))
```
Kết quả kỳ vọng (đã chạy cục bộ): `1.84`.
```python
import numpy as np
g, lr, b1, b2, eps = 8.0, 0.1, 0.9, 0.999, 1e-8
m = (1 - b1) * g; v = (1 - b2) * g * g
m_hat, v_hat = m / (1 - b1), v / (1 - b2)
print(round(4.0 - lr * m_hat / (np.sqrt(v_hat) + eps), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `3.9`.

## Lỗi thường gặp
Dùng cùng learning rate của SGD cho Adam (Adam thường cần $\eta$ nhỏ hơn, ví dụ $10^{-3}$); quên rằng Adam không luôn tổng quát hóa tốt hơn SGD.

## Ưu điểm, hạn chế
Momentum giảm dao động; Adam ít nhạy với thang đo gradient và cần ít tinh chỉnh. Adam tốn thêm bộ nhớ cho $m,s$. Bài báo gốc: Kingma và Ba (arXiv 1412.6980).

## Bài tập
1. (Dễ) Tính $\theta_3$ của Momentum. 2. (Vừa) Thử $\beta=0.5$ và $0.99$. 3. (Khó) Cài Adam đầy đủ nhiều bước và so với SGD trên $L=\theta^2$.

## Tóm tắt
Momentum nhớ hướng đi; Adam chuẩn hóa bước theo độ lớn gradient gần đây.
