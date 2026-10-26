**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Vector và ma trận.
**Mục tiêu:** giải thích không gian con, hạng, trị riêng và SVD; dùng phân rã để giải least squares khi ma trận suy biến.

## Từ tọa độ đến không gian con
Một vector đặc trưng là một điểm; tổ hợp tuyến tính của các cột ma trận tạo thành không gian cột. Một tập là không gian con khi chứa vector không, đóng dưới phép cộng và nhân vô hướng. Cơ sở là tập vector độc lập sinh ra toàn không gian đó; hạng là số chiều không gian cột. Hai cột giống nhau không cung cấp hai hướng thông tin độc lập. Vì vậy thêm cột không đồng nghĩa thêm hạng.

Với dữ liệu $X\in\mathbb R^{n\times d}$, kernel/null space gồm các $v$ thỏa $Xv=0$. Nếu có $v\ne0$, hai nghiệm $w$ và $w+v$ cho cùng dự đoán. Đây là lý do không nên viết `inv(X.T @ X)` một cách máy móc.

## Trị riêng và hình học
Với ma trận vuông, $Av=\lambda v$, $v\ne0$: hướng $v$ không đổi khi biến đổi, chỉ co/giãn bởi $\lambda$. Ma trận đối xứng thực có cơ sở trực chuẩn vector riêng; ma trận bất kỳ không nhất thiết có đủ vector riêng thực. Ma trận hiệp phương sai đối xứng nửa xác định dương nên có trị riêng không âm (trừ sai số làm tròn rất nhỏ).

## SVD áp dụng cả ma trận chữ nhật
$$
X=U\Sigma V^\top,\qquad X_k=\sum_{j=1}^k\sigma_j u_jv_j^\top.
$$
Singular value $\sigma_j\ge0$ xếp giảm dần; không phải trị riêng có dấu của $X$. Trong SVD rút gọn, nếu $r=\min(n,d)$ thì $U:(n,r)$, $\Sigma:(r,r)$, $V^\top:(r,d)$. Hạng số học đếm singular value lớn hơn tolerance phụ thuộc độ lớn ma trận và precision.

Giữ $k$ thành phần đầu cho xấp xỉ hạng tối đa $k$ tốt nhất theo chuẩn Frobenius: sai số bình phương bằng $\sum_{j>k}\sigma_j^2$. Với dữ liệu đã căn giữa, các cột $V$ là hướng PCA và phương sai là $\sigma_j^2/(n-1)$. Đây là quan hệ SVD–PCA, không phải tuyên bố phương sai cao luôn hữu ích để phân loại.

## Ví dụ có thể chạy
Ma trận dưới có hai cột phụ thuộc; `lstsq` chọn nghiệm có chuẩn nhỏ nhất trong các nghiệm least squares. Ví dụ chỉ dùng NumPy, CPU, không tải dữ liệu:
```python
import numpy as np
X = np.array([[1., 2.], [2., 4.], [3., 6.]])
y = np.array([1., 2., 3.])
U, s, Vt = np.linalg.svd(X, full_matrices=False)
w, _, rank, _ = np.linalg.lstsq(X, y, rcond=None)
assert np.allclose((U * s) @ Vt, X)
assert np.allclose(X @ w, y)
print(int(rank), np.round(w, 4).tolist())
```
Kết quả kỳ vọng: `1 [0.2, 0.4]`.

## Khi nào dùng và lỗi thường gặp
SVD dùng để nén, chẩn đoán đa cộng tuyến và giải hệ kém điều kiện. Nó tốn tài nguyên với ma trận rất lớn; truncated/randomized SVD thích hợp khi chỉ cần ít chiều. Không khẳng định singular value bằng 0 tuyệt đối trong số thực dấu phẩy động. Không so sánh dấu vector riêng giữa hai thư viện: $v$ và $-v$ biểu diễn cùng một trục. Chỉ fit phép giảm chiều trên train.

## Bài tập tự đánh giá
1. Tìm một vector khác 0 trong null space của $X$ ví dụ.
2. Với singular values $5,2,1$, sai số Frobenius bình phương khi giữ hạng 1 là bao nhiêu?
3. Giải thích vì sao nghiệm least squares không duy nhất nhưng dự đoán $Xw$ là duy nhất.

## Đáp án và tiêu chí chấm
1. $v=(-2,1)$, bởi mỗi hàng có dạng $(a,2a)$ nên $Xv=0$ (2 điểm).
2. Bỏ hai singular value cuối: $2^2+1^2=5$; chuẩn sai số là $\sqrt5$, không phải 5 (3 điểm).
3. Hai nghiệm khác nhau bởi phần tử null space. Phép chiếu vuông góc $y$ lên không gian cột là duy nhất; cần phân biệt tính duy nhất của hệ số và dự đoán (5 điểm).

## Tổng kết
Hạng đếm hướng độc lập; SVD phân rã ma trận chữ nhật thành các hướng trực chuẩn. Dùng solver hoặc `lstsq`, không tự nghịch đảo normal equations.

## Nguồn tham khảo
- [ML cơ bản: SVD](https://machinelearningcoban.com/2017/06/07/svd/) — đối chiếu qua snapshot repository nguồn; xem audit về giới hạn live.
- [ML cơ bản: kiến thức toán](https://machinelearningcoban.com/math/).
