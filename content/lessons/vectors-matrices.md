**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** NumPy, pandas và Matplotlib.
**Mục tiêu:** hiểu tích vô hướng, chuẩn, độ tương đồng cosine, nhân ma trận và quy tắc về shape.

## Vấn đề thực tế
Mỗi mẫu dữ liệu là một vector đặc trưng, cả bộ dữ liệu là một ma trận. Hầu hết mô hình ML (Linear Regression, MLP, PCA) là các phép toán trên vector và ma trận.

## Công thức
$$\mathbf a\cdot\mathbf b=\sum_i a_ib_i,\qquad \lVert\mathbf a\rVert=\sqrt{\mathbf a\cdot\mathbf a},\qquad \cos\theta=\frac{\mathbf a\cdot\mathbf b}{\lVert\mathbf a\rVert\lVert\mathbf b\rVert},\qquad (AB)_{ij}=\sum_k A_{ik}B_{kj}$$
Nhân $A$ shape $(m,n)$ với $B$ shape $(n,p)$ cho kết quả shape $(m,p)$; số cột của $A$ phải bằng số hàng của $B$. Nhân ma trận không giao hoán: nói chung $AB\ne BA$.

![Hai vector và góc giữa chúng](/img/vectors-matrices.svg)

## Ví dụ từng bước
$(1,2,3)\cdot(4,5,6)=4+10+18=32$. $\lVert(3,4)\rVert=5$. $\cos$ giữa $(1,0)$ và $(1,1)$ là $1/\sqrt2\approx0.7071$ (góc $45^\circ$). Với $A=\begin{pmatrix}1&2\\3&4\end{pmatrix}$, $B=\begin{pmatrix}0&1\\1&0\end{pmatrix}$: $AB=\begin{pmatrix}2&1\\4&3\end{pmatrix}$ (hoán đổi cột của $A$).

## Code và cách chạy
```python
import numpy as np
a = np.array([1, 2, 3]); b = np.array([4, 5, 6])
print(int(a @ b), float(np.linalg.norm([3, 4])))
```
Kết quả kỳ vọng (đã chạy cục bộ): `32 5.0`.
```python
import numpy as np
A = np.array([[1, 2], [3, 4]]); B = np.array([[0, 1], [1, 0]])
print((A @ B).tolist(), (np.ones((2, 3)) @ np.ones((3, 4))).shape)
```
Kết quả kỳ vọng (đã chạy cục bộ): `[[2, 1], [4, 3]] (2, 4)`.

## Lỗi thường gặp
Nhầm `*` (nhân từng phần tử) với `@` (nhân ma trận); sai shape ($(n,)$ khác $(n,1)$); quên chuyển vị.

## Ưu điểm, hạn chế
Biểu diễn vector hóa nhanh hơn vòng lặp Python nhiều lần. Cosine bỏ qua độ lớn, chỉ xét hướng.

## Bài tập
1. (Dễ) Tính $(2,0,1)\cdot(1,5,3)$. 2. (Vừa) Tính $BA$ và so với $AB$. 3. (Khó) Viết hàm cosine similarity có xử lý vector bằng 0.

## Tóm tắt
Tích vô hướng đo sự thẳng hàng, nhân ma trận kết hợp các biến đổi tuyến tính; luôn kiểm tra shape.

## Điều kiện áp dụng và kiểm tra kết luận
Tích vô hướng/cosine cần hai vector cùng số chiều; cosine không xác định nếu một norm bằng 0. Với ma trận X gồm hàng là mẫu, `X @ w` cho một dự đoán mỗi hàng, còn `X.T @ X` ghép tương quan cột. Chuẩn Euclid không đo mọi kiểu giống nhau trong mọi miền. Không gian cột, rank, eigen và SVD được phát triển ở [bài phân rã đại số](/learn/linear-algebra-decompositions); bài này chỉ là nền shape và phép toán.

## Đáp án và tiêu chí chấm
1. Tích vô hướng bằng 2·1+0·5+1·3=5. (2 điểm).
2. BA=[[3,4],[1,2]], là hoán đổi hàng của A; AB hoán đổi cột, nên hai kết quả khác nhau. (3 điểm).
3. Kiểm tra norm trước khi chia. Có thể báo ValueError cho vector 0; nếu chọn trả 0 như convention ứng dụng thì phải ghi đó là quy ước, không phải định nghĩa toán học. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Linear Algebra](https://d2l.ai/chapter_preliminaries/linear-algebra.html).
