**Cấp độ:** Beginner · **Kiến thức tiên quyết:** khoảng cách Euclid, trung bình.

**Mục tiêu:** hiểu thuật toán K-Means, hàm mục tiêu inertia và các hạn chế của nó.

## Vấn đề thực tế
Bạn có dữ liệu khách hàng chưa có nhãn và muốn chia họ thành các nhóm tương tự nhau. Đây là bài toán học không giám sát (clustering).

## Trực giác
Chọn $K$ "tâm" ban đầu. Lặp lại: mỗi điểm theo tâm gần nhất, rồi dời mỗi tâm về trung bình các điểm của nó, cho đến khi không còn thay đổi.

## Công thức
$$J=\sum_{i=1}^{N}\left\lVert \mathbf x_i-\boldsymbol\mu_{c_i}\right\rVert^2,\qquad \boldsymbol\mu_k=\frac{1}{|S_k|}\sum_{i\in S_k}\mathbf x_i$$

Trong đó $c_i$ là cụm được gán cho điểm $\mathbf x_i$, $\boldsymbol\mu_k$ là tâm cụm $k$, $S_k$ là tập điểm thuộc cụm $k$. $J$ gọi là inertia. Mỗi bước gán và cập nhật đều không làm $J$ tăng.

![Kết quả K-Means với ba cụm](/img/kmeans.svg)

## Ví dụ từng bước
Dữ liệu 1 chiều: $1,2,3,10,11,12$; $K=2$; tâm ban đầu $\mu_1=1,\ \mu_2=2$.
1. Gán: $\{1\}\to\mu_1$; $\{2,3,10,11,12\}\to\mu_2$. Cập nhật: $\mu_1=1$, $\mu_2=38/5=7.6$.
2. Gán lại: $\{1,2,3\}\to\mu_1$; $\{10,11,12\}\to\mu_2$. Cập nhật: $\mu_1=2$, $\mu_2=11$.
3. Gán lại không đổi, thuật toán hội tụ. $J=(1+0+1)+(1+0+1)=4$.

## Code và cách chạy
Xem bài **K-Means** trong Code Lab (`labs/kmeans/`): bản from scratch và bản `sklearn.cluster.KMeans`. Cả hai cho inertia 69.24 trên dữ liệu mẫu có seed cố định. Trang **Playground** cho phép chạy từng bước.

## Lỗi thường gặp
- Khởi tạo tâm kém dẫn tới kết quả xấu: chạy nhiều lần (`n_init`) và lấy kết quả có $J$ nhỏ nhất.
- Không chuẩn hóa đặc trưng làm khoảng cách bị lệch.
- Chọn $K$ tùy ý: có thể dùng elbow method hoặc silhouette score.

## Ưu điểm, hạn chế
Nhanh và dễ cài đặt. Chỉ tìm được cụm dạng cầu, kích thước gần nhau; nhạy với ngoại lai; phải biết trước $K$. Chỉ đảm bảo hội tụ tới cực tiểu địa phương.

## Bài tập
1. (Dễ) Tính $J$ của ví dụ nếu cụm là $\{1,2\}$ và $\{3,10,11,12\}$ với tâm là trung bình của mỗi cụm.
2. (Vừa) Chạy lab với $K=2,3,4,5$ (bản sklearn) và vẽ inertia theo $K$.
3. (Khó) Cài đặt khởi tạo k-means++ và so sánh với khởi tạo ngẫu nhiên.

## Tóm tắt
K-Means luân phiên gán điểm vào tâm gần nhất và cập nhật tâm bằng trung bình, giảm dần inertia.
