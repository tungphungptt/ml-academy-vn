**Cấp độ:** Intermediate · **Tiên quyết:** Cross-validation, chuẩn hóa dữ liệu.
**Mục tiêu:** nhận ra và tránh rò rỉ dữ liệu (data leakage) khi tiền xử lý và chọn đặc trưng.

## Vấn đề thực tế
Điểm đánh giá cao đến mức khó tin thường do rò rỉ: thông tin từ tập kiểm tra lọt vào quá trình huấn luyện, nên mô hình hoạt động tệ hơn nhiều khi triển khai thật.

## Nguyên tắc
Mọi bước học từ dữ liệu (chuẩn hóa, chọn đặc trưng, PCA, điền giá trị thiếu theo trung bình) phải được **fit chỉ trên phần train** của từng fold, rồi mới áp dụng cho phần kiểm tra. Cách an toàn: đặt tất cả vào một `Pipeline` và đưa pipeline vào cross-validation. Ngoài ra cần tránh các đặc trưng chứa thông tin về nhãn mà lúc dự đoán thật sẽ chưa có (target leakage).

![Rò rỉ dữ liệu so với pipeline đúng](/img/feature-leakage.svg)

## Ví dụ từng bước (thí nghiệm trên dữ liệu nhiễu thuần túy)
Tạo 100 mẫu, 1000 đặc trưng ngẫu nhiên và nhãn ngẫu nhiên: không có gì để học, nên accuracy hợp lý phải quanh 0.5. Chọn 20 đặc trưng tốt nhất bằng toàn bộ dữ liệu rồi mới cross-validation sẽ cho kết quả cao giả tạo; chọn đặc trưng bên trong pipeline cho kết quả đúng.

## Code và cách chạy
```python
import numpy as np
from sklearn.feature_selection import SelectKBest, f_classif
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
rg = np.random.default_rng(0); X = rg.normal(size=(100, 1000)); y = rg.integers(0, 2, 100)
cv = StratifiedKFold(5, shuffle=True, random_state=0); clf = LogisticRegression(max_iter=1000)
leaky = cross_val_score(clf, SelectKBest(f_classif, k=20).fit_transform(X, y), y, cv=cv).mean()
safe = cross_val_score(make_pipeline(SelectKBest(f_classif, k=20), clf), X, y, cv=cv).mean()
print(round(float(leaky), 2), round(float(safe), 2))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.85 0.57`.

Bản rò rỉ báo 0.85 trên dữ liệu không có tín hiệu; bản dùng pipeline cho 0.57, gần mức ngẫu nhiên (với 100 mẫu vẫn dao động quanh 0.5).

## Lỗi thường gặp
Fit `StandardScaler` trên toàn bộ dữ liệu; chọn đặc trưng hoặc tăng cường dữ liệu trước khi chia; có bản sao của cùng một mẫu ở cả train và test; dùng đặc trưng chỉ biết sau khi sự việc xảy ra.

## Feature Engineering ngắn gọn
Biến đổi đặc trưng giúp mô hình học tốt hơn: mã hóa biến phân loại (one-hot), đặc trưng đa thức, log cho phân phối lệch, tổ hợp đặc trưng theo hiểu biết miền. Mọi biến đổi có tham số học từ dữ liệu đều phải tuân thủ nguyên tắc trên.

## Bài tập
1. (Dễ) Liệt kê 3 bước tiền xử lý có thể gây rò rỉ. 2. (Vừa) Chạy lại thí nghiệm với seed khác. 3. (Khó) Tìm một ví dụ target leakage trong bài toán dự đoán bỏ học.

## Tóm tắt
Fit mọi bước học dữ liệu chỉ trên phần train; dùng Pipeline để đảm bảo điều đó.
