**Cấp độ:** Intermediate · **Tiên quyết:** Linear Regression.
**Mục tiêu:** hiểu regularization L2 (Ridge) và L1 (Lasso).

## Vấn đề thực tế
Mô hình quá phức tạp khớp cả nhiễu (overfit): trọng số rất lớn. Regularization phạt độ lớn của trọng số.

## Công thức
$$\text{Ridge: } L=\lVert y-Xw\rVert^2+\lambda\lVert w\rVert_2^2\ \Rightarrow\ w=(X^\top X+\lambda I)^{-1}X^\top y$$
$$\text{Lasso: } L=\tfrac12\lVert y-Xw\rVert^2+\lambda\lVert w\rVert_1$$
$\lambda\ge0$ là cường độ phạt. Ridge co nhỏ trọng số; Lasso có thể đưa trọng số về đúng 0 (chọn đặc trưng).

![Hệ số Ridge và Lasso theo lambda](/img/ridge-lasso.svg)

## Ví dụ từng bước
Dữ liệu $x=(1,2,3)$, $y=(2,4,6)$, không bias: $X^\top X=14$, $X^\top y=28$. Ridge: $w=28/(14+\lambda)$, cho $2,\ 1.8667,\ 1$ với $\lambda=0,1,14$. Lasso 1 chiều: $w=\max(0,(28-\lambda)/14)$, bằng $1$ khi $\lambda=14$ và $0$ khi $\lambda=28$.

## Code và cách chạy
```python
import numpy as np
x = np.array([[1.0], [2.0], [3.0]]); y = np.array([2.0, 4.0, 6.0])
print([round(float(np.linalg.solve(x.T @ x + l * np.eye(1), x.T @ y)[0]), 4) for l in (0, 1, 14)])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[2.0, 1.8667, 1.0]`.

## Lỗi thường gặp
Không chuẩn hóa đặc trưng trước khi phạt (phạt không công bằng giữa các thang đo); phạt cả bias; chọn $\lambda$ trên tập test thay vì validation.

## Ưu điểm, hạn chế
Giảm phương sai, giúp khi số đặc trưng lớn. Làm tăng bias; chọn $\lambda$ bằng cross-validation. Lasso không ổn định khi các đặc trưng tương quan mạnh.

## Bài tập
1. (Dễ) Tính $w$ Ridge với $\lambda=7$. 2. (Vừa) Chạy `Ridge` và `Lasso` của scikit-learn với nhiều $\lambda$. 3. (Khó) Suy ra nghiệm Lasso 1 chiều.

## Tóm tắt
Ridge co trọng số, Lasso làm thưa; $\lambda$ cân bằng giữa khớp dữ liệu và độ phức tạp.
