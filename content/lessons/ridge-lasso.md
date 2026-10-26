**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Linear Regression, Gradient Descent.
**Mục tiêu:** hiểu regularization L2 (Ridge) và L1 (Lasso).

## Vấn đề thực tế
Mô hình quá phức tạp khớp cả nhiễu (overfit): trọng số rất lớn. Regularization phạt độ lớn của trọng số.

## Công thức
$$
\text{Ridge: } L=\lVert y-Xw\rVert^2+\lambda\lVert w\rVert_2^2\ \Rightarrow\ w=(X^\top X+\lambda I)^{-1}X^\top y
$$
$$
\text{Lasso: } L=\tfrac12\lVert y-Xw\rVert^2+\lambda\lVert w\rVert_1
$$
$\lambda\ge0$ là cường độ phạt. Với $\lambda>0$ và phạt mọi tọa độ của $w$ như công thức trên, $X^\top X+\lambda I$ khả nghịch. Khi $\lambda=0$, nghiệm viết bằng nghịch đảo chỉ hợp lệ nếu $X$ có full column rank; nếu không, dùng `lstsq` hoặc pseudoinverse để chọn nghiệm least squares. Ridge co nhỏ trọng số; Lasso có thể đưa trọng số về đúng 0 (chọn đặc trưng).

![Hệ số Ridge và Lasso theo lambda](/img/ridge-lasso.svg)

## Ví dụ từng bước
Dữ liệu $x=(1,2,3)$, $y=(2,4,6)$, không bias: $X^\top X=14$, $X^\top y=28$. Ridge: $w=28/(14+\lambda)$, cho $2,\ 1.8667,\ 1$ với $\lambda=0,1,14$. Lasso 1 chiều: $w=\max(0,(28-\lambda)/14)$, bằng $1$ khi $\lambda=14$ và $0$ khi $\lambda=28$.

## Code và cách chạy
```python
import numpy as np
x = np.array([[1.0], [2.0], [3.0]]); y = np.array([2.0, 4.0, 6.0])
print([round(float(np.linalg.solve(x.T @ x + l * np.eye(1), x.T @ y)[0]), 4) for l in (0, 1, 14)])
# Hai cột phụ thuộc: lambda=0 không cho phép nghịch đảo normal matrix.
X_singular = np.column_stack([x[:, 0], x[:, 0]])
normal = X_singular.T @ X_singular
assert np.linalg.matrix_rank(normal) == 1
try:
    np.linalg.inv(normal)
    raise AssertionError("normal matrix must be singular")
except np.linalg.LinAlgError:
    pass
ridge_solution = np.linalg.solve(normal + np.eye(2), X_singular.T @ y)
assert np.isfinite(ridge_solution).all()
assert np.all(np.linalg.eigvalsh(normal + np.eye(2)) > 0)
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

## Điều kiện áp dụng và kiểm tra kết luận
Quy ước loss là một phần của tham số phạt. Lasso trong sklearn dùng $\operatorname{SSE}/(2N)+\alpha\lVert w\rVert_1$, nên lambda của công thức SSE/2 trong bài bằng $N\alpha$; không so alpha giữa các công thức mà bỏ hệ số N. Ridge ở dạng $\operatorname{SSE}+\alpha\lVert w\rVert_2^2$ có quy ước khác. Nghiệm đóng của Ridge trong bài là trường hợp không intercept; nếu thêm intercept mà không muốn phạt nó, ma trận phạt phải có tọa độ bias bằng 0. Chuẩn hóa fit trên train để penalty có ý nghĩa giữa các đơn vị. L1 không bảo đảm chọn đúng biến nguyên nhân, đặc biệt khi các cột tương quan.

## Đáp án và tiêu chí chấm
1. Ridge $\lambda=7$ cho $w=28/21=4/3\approx1.3333$. (2 điểm).
2. Giữ split, scale và convention loss; chọn alpha bằng CV, báo hệ số và lỗi validation. Không kết luận từ độ thưa một mình. (3 điểm).
3. Đạo hàm theo miền $w>0$ và $w<0$ và subgradient tại 0 cho $w=S(X^\top y,\lambda)/(X^\top X)$, với $S(a,\lambda)=\operatorname{sign}(a)\max(|a|-\lambda,0)$. Ví dụ $X^\top y=28$, $X^\top X=14$ khớp công thức bài. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Ridge regression and classification](https://scikit-learn.org/stable/modules/linear_model.html#ridge-regression-and-classification).
- [scikit-learn: Lasso](https://scikit-learn.org/stable/modules/linear_model.html#lasso).
