**Cấp độ:** Intermediate · **Tiên quyết:** K-Means, Xác suất cơ bản.
**Mục tiêu:** hiểu mô hình hỗn hợp Gauss và "trách nhiệm" (responsibility), khác biệt với K-Means.

## Vấn đề thực tế
K-Means gán mỗi điểm cứng vào một cụm và giả định cụm tròn. Gaussian Mixture Model (GMM) cho xác suất thuộc từng cụm và mô hình hóa được cụm hình elip.

## Công thức
$$p(x)=\sum_{k=1}^{K}\pi_k\,\mathcal N(x\mid\mu_k,\Sigma_k),\qquad r_{k}(x)=\frac{\pi_k\,\mathcal N(x\mid\mu_k,\Sigma_k)}{\sum_j\pi_j\,\mathcal N(x\mid\mu_j,\Sigma_j)}$$
$\pi_k$ là trọng số thành phần ($\sum\pi_k=1$), $r_k(x)$ là xác suất điểm $x$ thuộc thành phần $k$. Thuật toán EM lặp: bước E tính $r_k$ cho mọi điểm, bước M cập nhật $\pi_k,\mu_k,\Sigma_k$ theo trung bình có trọng số $r_k$.

![Hai thành phần Gauss](/img/gmm.svg)

## Ví dụ từng bước
Hai thành phần $\mathcal N(0,1)$ và $\mathcal N(4,1)$, $\pi=(0.5,0.5)$, điểm $x=1$: $r_1=\frac{e^{-0.5}}{e^{-0.5}+e^{-4.5}}=\frac{1}{1+e^{-4}}\approx0.982$.

## Code và cách chạy
```python
from math import exp
print(round(1 / (1 + exp(-4)), 4))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.982`.
```python
import numpy as np
from sklearn.mixture import GaussianMixture
r = np.random.default_rng(0)
d = np.concatenate([r.normal(0, 1, 200), r.normal(5, 1, 200)]).reshape(-1, 1)
g = GaussianMixture(2, random_state=0).fit(d)
print(sorted(g.means_.ravel().round(2).tolist()), sorted(g.weights_.round(2).tolist()))
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.04, 4.96] [0.49, 0.51]`. Giá trị thật là trung bình 0 và 5, trọng số 0.5.

## Lỗi thường gặp
Khởi tạo kém làm EM rơi vào cực trị địa phương; ma trận hiệp phương sai suy biến khi một thành phần chỉ bám vào vài điểm; chọn $K$ tùy ý (có thể dùng BIC).

## Ưu điểm, hạn chế
Phân cụm mềm, cụm hình elip. Giả định dữ liệu là hỗn hợp Gauss, chậm hơn K-Means. K-Means có thể xem là trường hợp giới hạn của GMM với hiệp phương sai bằng nhau và nhỏ dần.

## Bài tập
1. (Dễ) Tính $r_1$ tại $x=2$ cho ví dụ trên. 2. (Vừa) Chọn $K$ bằng BIC (`g.bic(d)`). 3. (Khó) Tự cài EM cho GMM 1 chiều.

## Tóm tắt
GMM mô hình hóa dữ liệu bằng tổng các Gauss; EM luân phiên tính trách nhiệm và cập nhật tham số.
