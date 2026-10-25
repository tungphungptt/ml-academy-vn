**Cấp độ:** Intermediate · **Tiên quyết:** Bias-Variance.
**Mục tiêu:** hiểu K-fold cross-validation và dùng nó để chọn mô hình, siêu tham số.

## Vấn đề thực tế
Một lần chia train/test cho ước lượng nhiễu, đặc biệt khi dữ liệu ít. Cross-validation tận dụng toàn bộ dữ liệu để ước lượng ổn định hơn.

## Công thức
Chia dữ liệu thành $K$ phần (fold). Với mỗi $k=1..K$, huấn luyện trên $K-1$ fold, đánh giá trên fold còn lại:
$$\text{CV}=\frac1K\sum_{k=1}^{K}\text{score}_k$$
Dùng `StratifiedKFold` cho phân loại để giữ tỉ lệ lớp. Chọn siêu tham số bằng CV trên tập train; giữ riêng một tập test cuối cùng chỉ để đánh giá một lần.

![Sơ đồ 5-fold cross-validation](/img/kfold.svg)

## Ví dụ từng bước
10 mẫu, $K=3$: các fold có kích thước $4,3,3$. Mỗi mẫu được dùng để kiểm tra đúng một lần và để huấn luyện $K-1$ lần.

## Code và cách chạy
```python
import numpy as np
from sklearn.model_selection import KFold
print([len(te) for _, te in KFold(3).split(np.arange(10))])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[4, 3, 3]`.
```python
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_score
X, y = load_iris(return_X_y=True)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
print(round(float(cross_val_score(LogisticRegression(max_iter=1000), X, y, cv=cv).mean()), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.96`.

## Lỗi thường gặp
Dùng dữ liệu test để chọn tham số rồi báo cáo điểm đó; chuẩn hóa hoặc chọn đặc trưng trước khi chia fold (rò rỉ, xem bài Feature Engineering và Data Leakage); không xáo trộn dữ liệu có thứ tự (nhưng chuỗi thời gian cần `TimeSeriesSplit`, không xáo trộn).

## Ưu điểm, hạn chế
Ước lượng ổn định hơn một lần chia. Tốn thời gian gấp $K$ lần; vẫn có độ lệch nhỏ vì các fold huấn luyện chồng lấn.

## Bài tập
1. (Dễ) Kích thước các fold khi 11 mẫu, $K=4$. 2. (Vừa) Dùng `GridSearchCV` chọn $C$ của SVM trên Iris. 3. (Khó) Tự cài K-fold bằng NumPy.

## Tóm tắt
Cross-validation trung bình điểm trên $K$ lần chia, giúp chọn mô hình mà không dùng tập test.
