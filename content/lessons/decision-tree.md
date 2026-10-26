**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Metrics đánh giá mô hình, Chuẩn bị dữ liệu: train/validation/test và dữ liệu thiếu.
**Mục tiêu:** hiểu cách cây chọn điểm chia bằng Gini và vì sao cây dễ overfit.

## Vấn đề thực tế
Cần một mô hình dễ giải thích bằng chuỗi câu hỏi "nếu... thì...", ví dụ duyệt hồ sơ vay.

## Trực giác và công thức
Mỗi nút chọn một đặc trưng và ngưỡng để chia dữ liệu thành hai phần "thuần" hơn. Độ không thuần Gini:
$$G=1-\sum_{c}p_c^2,\qquad G_{\text{split}}=\sum_{k}\frac{N_k}{N}G_k$$
$p_c$ là tỉ lệ lớp $c$ trong nút, $N_k$ là số mẫu ở nhánh $k$. Chọn phép chia làm $G_{\text{split}}$ nhỏ nhất.

![Cây quyết định và độ giảm Gini](/img/decision-tree.svg)

## Ví dụ từng bước
Nút có 3 mẫu lớp A và 3 mẫu lớp B: $G=0.5$. Chia thành {3A,1B} và {2B}: $G_1=1-(0.75^2+0.25^2)=0.375$, $G_2=0$. $G_{\text{split}}=\frac46\cdot0.375=0.25$, giảm từ 0.5 xuống 0.25.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
X, y = load_iris(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
print(round(DecisionTreeClassifier(max_depth=3, random_state=0).fit(Xa, ya).score(Xb, yb), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.933`. Chạy được trong Code Lab (dán code vào bài scikit-learn bất kỳ).

## Lỗi thường gặp
Để cây mọc sâu không giới hạn (overfit); quên giới hạn `max_depth`/`min_samples_leaf`.

## Ưu điểm, hạn chế, so sánh
Dễ giải thích, không cần chuẩn hóa. Không ổn định với thay đổi nhỏ của dữ liệu; Random Forest khắc phục bằng cách gộp nhiều cây.

## Bài tập
1. (Dễ) Tính Gini của nút {2A,2B}. 2. (Vừa) Đổi `max_depth` từ 1 đến 6, ghi accuracy. 3. (Khó) Tự cài hàm tìm ngưỡng chia tốt nhất cho một đặc trưng.

## Tóm tắt
Cây chia dữ liệu theo tiêu chí giảm độ không thuần; cần giới hạn độ sâu.

## Điều kiện áp dụng và kiểm tra kết luận
CART của sklearn chia nhị phân; classification có thể dùng Gini hoặc entropy, regression thường giảm squared error. Entropy H=−Σp log₂p (quy ước 0 log 0=0); information gain là entropy cha trừ entropy con có trọng số. ID3 dùng information gain, C4.5 thêm gain ratio để giảm thiên vị thuộc tính nhiều giá trị; không đồng nhất ba tên thuật toán. Cây không cần scale đơn điệu như KNN nhưng dễ overfit và có thể ưu tiên feature nhiều ngưỡng. Cắt tỉa/cost-complexity và giới hạn leaf/depth phải chọn bằng validation.

## Đáp án và tiêu chí chấm
1. Với hai lớp cân bằng, Gini=0.5 và entropy=1 bit. (2 điểm).
2. Đổi max_depth chỉ trên train/validation/CV, ghi train và validation score; không chọn depth theo test. (3 điểm).
3. Sắp mẫu theo một cột, thử midpoint giữa giá trị khác nhau, giữ leaf không rỗng; tính impurity weighted bởi số mẫu. Kiểm tra feature hằng, nhãn thuần và tie-break. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Decision Trees](https://scikit-learn.org/stable/modules/tree.html).
