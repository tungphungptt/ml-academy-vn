**Cấp độ:** Beginner · **Tiên quyết:** Linear Regression, Bias-Variance.
**Mục tiêu:** hiểu cách mô hình tuyến tính khớp được đường cong bằng đặc trưng đa thức.

## Vấn đề thực tế
Quan hệ giữa $x$ và $y$ không phải đường thẳng (ví dụ quãng đường rơi tự do theo thời gian). Ta vẫn dùng hồi quy tuyến tính, nhưng trên đặc trưng được biến đổi.

## Công thức
$$\hat y=w_0+w_1x+w_2x^2+\dots+w_dx^d$$
Mô hình **tuyến tính theo tham số** $w$, chỉ phi tuyến theo $x$: đặt $\phi(x)=(1,x,x^2,\dots,x^d)$ thì $\hat y=\mathbf w^\top\phi(x)$ và dùng đúng nghiệm Linear Regression. Bậc $d$ là siêu tham số: quá thấp thì underfit, quá cao thì overfit (xem bài Bias-Variance); Ridge/Lasso giúp kiềm chế hệ số lớn.

![Đường thẳng và parabol trên cùng dữ liệu](/img/polynomial-regression.svg)

## Ví dụ từng bước
Với $x=2$ và $d=3$, vector đặc trưng là $(1,2,4,8)$. Dữ liệu $(x,y)$ = $(0,1),(1,2),(2,5),(3,10),(4,17)$ nằm đúng trên $y=x^2+1$: khớp bậc 2 cho hệ số $(1,0,1)$ theo thứ tự $x^2,x,1$.

## Code và cách chạy
```python
import numpy as np
x = np.arange(5.0); y = x ** 2 + 1
print((np.polyfit(x, y, 2).round(3) + 0.0).tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `[1.0, 0.0, 1.0]`.

## Lỗi thường gặp
Chọn bậc quá cao với ít dữ liệu; quên chuẩn hóa $x$ (lũy thừa cao làm các cột rất khác thang đo, gây bất ổn số); dự đoán ngoài khoảng dữ liệu (đa thức bậc cao dao động mạnh ở biên).

## Bài tập
1. (Dễ) Viết vector đặc trưng bậc 4 cho $x=3$. 2. (Vừa) Dùng `PolynomialFeatures` kết hợp `Ridge` trong Pipeline. 3. (Khó) Chọn bậc bằng cross-validation.

## Tóm tắt
Hồi quy đa thức là hồi quy tuyến tính trên đặc trưng lũy thừa; bậc là siêu tham số cần chọn bằng validation.
