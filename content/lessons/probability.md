**Cấp độ:** Beginner · **Tiên quyết:** đại số THPT.
**Mục tiêu:** hiểu kỳ vọng, phương sai, phân phối nhị thức và chuẩn, và trực giác Maximum Likelihood.

## Vấn đề thực tế
Dữ liệu có nhiễu và bất định; mô hình ML thường là mô hình xác suất, và loss như cross-entropy xuất phát từ likelihood.

## Công thức
$$\mathbb E[X]=\sum_x x\,P(x),\quad \operatorname{Var}(X)=\mathbb E[X^2]-\mathbb E[X]^2,\quad P(X=k)=\binom nk p^k(1-p)^{n-k}$$
Phân phối chuẩn có khoảng 68.27% xác suất trong khoảng $\mu\pm\sigma$. **Maximum Likelihood**: chọn tham số làm dữ liệu quan sát có xác suất lớn nhất. Với $n$ lần tung đồng xu cho $k$ mặt ngửa, hàm log-likelihood là $k\ln p+(n-k)\ln(1-p)$; đặt đạo hàm bằng 0 được $\hat p=k/n$.

![Phân phối chuẩn và khoảng một sigma](/img/probability.svg)

## Ví dụ từng bước
Xúc xắc công bằng: $\mathbb E[X]=3.5$, $\operatorname{Var}=35/12\approx2.9167$. Tung 3 đồng xu công bằng, $P(\text{đúng 2 ngửa})=\binom32\cdot0.5^3=0.375$. Dữ liệu $(1,0,1,1)$: $\hat p=3/4=0.75$.

## Code và cách chạy
```python
import numpy as np
from math import comb, erf, sqrt
d = np.arange(1, 7)
print([float(d.mean()), round(float(d.var()), 4), comb(3, 2) * 0.5 ** 3, round(erf(1 / sqrt(2)), 4)])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[3.5, 2.9167, 0.375, 0.6827]`.

## Lỗi thường gặp
Nhầm xác suất $P(\text{dữ liệu}\mid\theta)$ với $P(\theta\mid\text{dữ liệu})$; nhầm phương sai mẫu ($N-1$) với phương sai tổng thể ($N$); tính tích nhiều xác suất nhỏ mà không dùng log.

## Ưu điểm, hạn chế
MLE đơn giản, nhất quán khi dữ liệu nhiều; với dữ liệu ít có thể overfit (MAP thêm tiên nghiệm để khắc phục).

## Bài tập
1. (Dễ) Tính $\mathbb E[X]$ của đồng xu gán 1 cho ngửa, 0 cho sấp. 2. (Vừa) Tìm $\hat p$ cho 7 ngửa trong 10 lần. 3. (Khó) Suy ra MLE của trung bình phân phối chuẩn.

## Tóm tắt
Kỳ vọng và phương sai tóm tắt phân phối; MLE chọn tham số làm dữ liệu "dễ xảy ra" nhất.
