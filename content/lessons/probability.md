**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Python cho ML.
**Mục tiêu:** hiểu kỳ vọng, phương sai, phân phối nhị thức và chuẩn, và trực giác Maximum Likelihood.

## Vấn đề thực tế
Dữ liệu có nhiễu và bất định; mô hình ML thường là mô hình xác suất, và loss như cross-entropy xuất phát từ likelihood.

## Công thức
$$
\mathbb E[X]=\sum_x x\,P(x),\quad \operatorname{Var}(X)=\mathbb E[X^2]-\mathbb E[X]^2,\quad P(X=k)=\binom nk p^k(1-p)^{n-k}
$$
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
MLE đơn giản và có thể nhất quán dưới các giả định nhận dạng, mô hình và lấy mẫu thích hợp; nhiều dữ liệu tự nó không đủ. Với mẫu nhỏ, MAP bổ sung prior để regularize nhưng prior không phù hợp có thể làm ước lượng kém hơn MLE.

## Bài tập
1. (Dễ) Tính $\mathbb E[X]$ của đồng xu gán 1 cho ngửa, 0 cho sấp. 2. (Vừa) Tìm $\hat p$ cho 7 ngửa trong 10 lần. 3. (Khó) Suy ra MLE của trung bình phân phối chuẩn.

## Tóm tắt
Kỳ vọng và phương sai tóm tắt phân phối; MLE chọn tham số làm dữ liệu "dễ xảy ra" nhất.

## Điều kiện áp dụng và kiểm tra kết luận
Một mô hình xác suất cần chỉ rõ biến ngẫu nhiên, miền giá trị và giả định lấy mẫu. Xác suất có điều kiện và độc lập khác nhau: X,Y độc lập không đồng nghĩa độc lập khi điều kiện thêm Z. Bayes kết hợp likelihood với prior; không đảo P(A|B) thành P(B|A). MLE có các bảo đảm tiệm cận dưới giả định nhận dạng/mô hình/lấy mẫu phù hợp, không tự nhất quán chỉ vì nhiều dữ liệu. [Bayes, MLE và MAP](/learn/bayesian-estimation) suy ra công thức và cho ví dụ base-rate.

## Đáp án và tiêu chí chấm
1. Với $X\in\{0,1\}$ và $P(X=1)=p$, $\mathbb E[X]=0\cdot(1-p)+1\cdot p=p$. (2 điểm).
2. MLE bằng $7/10=0.7$. Đây là ước lượng từ dữ liệu, không phải chứng minh xác suất thật đúng bằng 0.7. (3 điểm).
3. Với Gaussian variance cố định dương, đạo hàm log-likelihood theo $\mu$ là $\sum_i(x_i-\mu)/\sigma^2$. Cho bằng 0 suy ra $\hat\mu$ bằng trung bình; cần nêu độc lập cùng phân phối và phân biệt μ thật với ước lượng. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Probability and Statistics](https://d2l.ai/chapter_preliminaries/probability.html).
