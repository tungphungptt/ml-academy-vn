**Cấp độ:** Beginner · **Tầng:** Core · **Kiến thức tiên quyết:** vector, khoảng cách Euclid · **Tiên quyết:** Vector và ma trận, Chuẩn bị dữ liệu: train/validation/test và dữ liệu thiếu, Metrics đánh giá mô hình.

**Mục tiêu:** hiểu KNN phân loại thế nào, tác động của $K$ lên ranh giới quyết định, và khi nào KNN gặp khó.

## Vấn đề thực tế
Bạn có dữ liệu các điểm đã gán nhãn và muốn gán nhãn cho điểm mới. Ý tưởng tự nhiên: "những điểm gần nhau thường cùng nhãn".

## Trực giác
KNN không học tham số nào. Nó nhớ toàn bộ dữ liệu huấn luyện, và khi có điểm mới, nó tìm $K$ điểm gần nhất rồi cho các điểm đó bỏ phiếu.

## Công thức
$$d(\mathbf{x},\mathbf{x}')=\sqrt{\sum_{j=1}^{D}(x_j-x'_j)^2}$$
$$\hat y = \operatorname*{arg\,max}_{c}\ \sum_{i\in \mathcal N_K(\mathbf{x})}\mathbb 1[y_i=c]$$

Trong đó $D$ là số đặc trưng, $\mathcal N_K(\mathbf x)$ là tập $K$ láng giềng gần nhất của $\mathbf x$, $\mathbb 1[\cdot]$ bằng 1 nếu điều kiện đúng và 0 nếu sai.

![Minh họa KNN với K=3](/img/knn.svg)

## Ví dụ từng bước
Dữ liệu: $A(1,1)$ và $B(2,1)$ thuộc lớp 0; $C(4,4)$ và $D(5,4)$ thuộc lớp 1. Điểm cần đoán $q=(3,3)$, $K=3$.
- $d(q,A)=\sqrt{8}\approx2.83$; $d(q,B)=\sqrt5\approx2.24$; $d(q,C)=\sqrt2\approx1.41$; $d(q,D)=\sqrt5\approx2.24$.
- Ba điểm gần nhất là $C, B, D$: lớp 1 có 2 phiếu, lớp 0 có 1 phiếu. Dự đoán: **lớp 1**.

## Ảnh hưởng của K, decision boundary và đánh giá
$K$ nhỏ cho ranh giới lởm chởm, dễ overfit. $K$ lớn làm ranh giới mượt, có thể underfit. Chọn $K$ bằng validation hoặc cross-validation, đánh giá bằng accuracy trên tập test. Hãy tự thử trong trang **Playground** (KNN).

## Code và cách chạy
Xem bài **KNN** trong Code Lab (`labs/knn/`): bản from scratch dùng NumPy và bản dùng `KNeighborsClassifier`. Cả hai cho độ chính xác 1.000 trên dữ liệu mẫu có seed cố định.

## Lỗi thường gặp
- Quên chuẩn hóa đặc trưng: đặc trưng có thang đo lớn sẽ áp đảo khoảng cách.
- Chọn $K$ chẵn với bài toán 2 lớp dễ gây hòa phiếu.
- Dữ liệu nhiều chiều: khoảng cách mất ý nghĩa (curse of dimensionality).

## Ưu điểm, hạn chế
Đơn giản, không cần huấn luyện. Dự đoán chậm khi dữ liệu lớn (phải tính khoảng cách tới mọi mẫu), tốn bộ nhớ, nhạy với nhiễu và thang đo.

## So sánh
Khác Logistic Regression (học ranh giới tuyến tính với tham số), KNN là mô hình dựa trên mẫu (instance-based) và có ranh giới phi tuyến linh hoạt.

## Bài tập
1. (Dễ) Dự đoán lớp của $q=(2,2)$ với $K=1$ trên dữ liệu ví dụ.
2. (Vừa) Chạy lab và đổi $K$ từ 1 đến 15, ghi lại accuracy.
3. (Khó) Thêm một đặc trưng có thang đo lớn gấp 100 lần và quan sát kết quả trước/sau chuẩn hóa.

## Tóm tắt
KNN dự đoán bằng bỏ phiếu của $K$ láng giềng gần nhất; cần chuẩn hóa dữ liệu và chọn $K$ cẩn thận.

## Điều kiện áp dụng và kiểm tra kết luận
KNN giả định các mẫu gần nhau theo metric có ý nghĩa cho nhãn; không giả định ranh giới tuyến tính. Chọn K không quá số mẫu train; tie có thể xảy ra cả khi K lẻ với nhiều lớp, nên quy tắc tie-break phải rõ. KNN regression lấy trung bình thay vì bỏ phiếu. Với chuẩn Euclid, scale khác nhau làm metric đổi; fit scaler trong fold. Khoảng cách trong không gian quá nhiều chiều có thể kém phân biệt, nhưng giảm chiều cũng có thể bỏ tín hiệu. Dự đoán brute force tốn khoảng O(ND) cho một query, không phải “không học tham số” là không có chi phí.

## Đáp án và tiêu chí chấm
1. q=(2,2) gần B=(2,1) nhất (distance=1), dự đoán lớp 0. (2 điểm).
2. Chọn K bằng train/validation hoặc CV. Nếu xem test cho 15 K để chọn K tốt nhất, test đã bị dùng như validation. (3 điểm).
3. Thêm cột thang đo 100× có thể đảo láng giềng; so pipeline fit StandardScaler trên train với bản không scale bằng cùng split. Không chuẩn hóa trước toàn bộ CV. (5 điểm).

## Nguồn tham khảo
- [scikit-learn User Guide: Nearest Neighbors](https://scikit-learn.org/stable/modules/neighbors.html).
- [Stanford CS231n: Image Classification (kNN)](https://cs231n.github.io/classification/).
