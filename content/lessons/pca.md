**Cấp độ:** Intermediate · **Tiên quyết:** ma trận, phương sai, trị riêng.
**Mục tiêu:** hiểu PCA tìm hướng có phương sai lớn nhất.

## Vấn đề thực tế
Dữ liệu nhiều chiều khó trực quan và tốn tài nguyên. PCA giữ lại ít chiều nhất nhưng giữ được nhiều thông tin (phương sai) nhất.

## Công thức
Sau khi trừ trung bình mỗi cột, ma trận hiệp phương sai $C=\frac{1}{N-1}X^\top X$. Các thành phần chính là vector riêng của $C$; trị riêng $\lambda_k$ là phương sai dọc hướng đó:
$$\text{tỉ lệ phương sai}_k=\frac{\lambda_k}{\sum_j\lambda_j}$$

![Các thành phần chính trong PCA](/img/pca.svg)

## Ví dụ từng bước
Dữ liệu $(1,1),(2,2),(3,3)$, trung bình $(2,2)$; sau khi trừ: $(-1,-1),(0,0),(1,1)$. $C=\begin{pmatrix}1&1\\1&1\end{pmatrix}$, trị riêng $2$ và $0$: thành phần chính đầu là $(1,1)/\sqrt2$ giữ 100% phương sai.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
print(PCA(2).fit(load_iris().data).explained_variance_ratio_.round(4))
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.9246 0.0531]`.

## Lỗi thường gặp
Không chuẩn hóa khi đặc trưng khác thang đo; quên trừ trung bình; hiểu nhầm PCA là chọn đặc trưng gốc.

## Ưu điểm, hạn chế
Giảm chiều tuyến tính, nhanh. Chỉ bắt cấu trúc tuyến tính, thành phần chính khó diễn giải.

## Bài tập
1. (Dễ) Tính $C$ cho $(0,0),(1,0),(2,0)$. 2. (Vừa) Chọn số thành phần để giữ 95% phương sai trên Iris. 3. (Khó) Tự cài PCA bằng `np.linalg.eigh`.

## Tóm tắt
PCA chiếu dữ liệu lên các vector riêng của ma trận hiệp phương sai.
