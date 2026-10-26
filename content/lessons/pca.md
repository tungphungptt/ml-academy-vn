**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Không gian vector, trị riêng và SVD, Chuẩn bị dữ liệu: train/validation/test và dữ liệu thiếu.
**Mục tiêu:** hiểu PCA tìm hướng có phương sai lớn nhất.

## Vấn đề thực tế
Dữ liệu nhiều chiều khó trực quan và tốn tài nguyên. Với số chiều giữ lại đã chọn, PCA tìm phép chiếu tuyến tính giữ phương sai lớn nhất. Phương sai ở đây là mức phân tán, không đồng nghĩa mọi thông tin hữu ích cho bài toán dự đoán.

## Công thức
Sau khi trừ trung bình mỗi cột, ma trận hiệp phương sai $C=\frac{1}{N-1}X^\top X$. Các thành phần chính là vector riêng của $C$; trị riêng $\lambda_k$ là phương sai dọc hướng đó:
$$
\text{tỉ lệ phương sai}_k=\frac{\lambda_k}{\sum_j\lambda_j}
$$

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

## Điều kiện áp dụng và kiểm tra kết luận
PCA cần căn giữa; scale từng cột là quyết định theo đơn vị và mục tiêu, không luôn bắt buộc. Hướng có variance lớn có thể là nhiễu; nhãn không được dùng khi fit PCA.

Một classifier có thể mất tín hiệu nếu giảm chiều chỉ dựa vào variance, xem [LDA](/learn/lda).

SVD của dữ liệu centered cho cùng không gian chính, tránh tạo covariance lớn. TruncatedSVD thường dùng cho sparse text và không tự center giống PCA. Tính explained-variance ratio trên train; không dùng test để chọn k rồi gọi test là độc lập.

## Đáp án và tiêu chí chấm
1. Trung bình $(1,0)$; ma trận hiệp phương sai mẫu $C=\begin{pmatrix}1&0\\0&0\end{pmatrix}$ cho $N=3$. (2 điểm).
2. Fit trên train, lấy k nhỏ nhất sao cho tổng explained variance ratio ít nhất 0.95; scaling thay đổi số k nên phải ghi pipeline. (3 điểm).
3. Dùng eigh cho covariance đối xứng, sắp trị riêng giảm dần rồi chiếu dữ liệu đã trừ mean train. Kiểm tra reconstruction và không so dấu eigenvector một cách cứng nhắc. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: PCA](https://scikit-learn.org/stable/modules/decomposition.html#pca).
