**Cấp độ:** Intermediate · **Tiên quyết:** Cross-validation, SVM.
**Mục tiêu:** chọn siêu tham số bằng Grid Search kết hợp cross-validation.

## Vấn đề thực tế
Siêu tham số (như $C$, `gamma` của SVM, độ sâu cây, learning rate) không được học từ dữ liệu mà do ta chọn, và ảnh hưởng lớn tới kết quả.

## Phương pháp
**Grid Search** thử mọi tổ hợp trong lưới, đánh giá từng tổ hợp bằng cross-validation và chọn tổ hợp có điểm trung bình cao nhất. Với $m$ tham số, mỗi tham số $n_i$ giá trị, $K$ fold: số lần huấn luyện là $K\prod_i n_i$. **Random Search** lấy mẫu ngẫu nhiên các tổ hợp, thường hiệu quả hơn khi chỉ một vài tham số thực sự quan trọng. Điểm CV của tổ hợp tốt nhất hơi lạc quan: vẫn cần tập test riêng để đánh giá cuối.

![Lưới siêu tham số](/img/hyperparameter-tuning.svg)

## Ví dụ từng bước
Lưới $C\in\{0.1,1,10\}$ và `gamma` $\in\{\text{scale},0.01\}$ có $6$ tổ hợp; với 5 fold là $30$ lần huấn luyện.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import GridSearchCV, StratifiedKFold
from sklearn.svm import SVC
X, y = load_iris(return_X_y=True)
g = GridSearchCV(SVC(), {"C": [0.1, 1, 10], "gamma": ["scale", 0.01]}, cv=StratifiedKFold(5, shuffle=True, random_state=0)).fit(X, y)
print(g.best_params_, round(float(g.best_score_), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `{'C': 10, 'gamma': 'scale'} 0.967`.

## Lỗi thường gặp
Chọn tham số bằng tập test; lưới quá rộng gây tốn thời gian; quên đưa bước tiền xử lý vào Pipeline (gây rò rỉ dữ liệu); coi chênh lệch nhỏ giữa các tổ hợp là có ý nghĩa.

## Ưu điểm, hạn chế
Đơn giản, dễ lặp lại. Chi phí tăng theo cấp số nhân với số tham số; có thể dùng Random Search hoặc tối ưu Bayes.

## Bài tập
1. (Dễ) Đếm số lần huấn luyện với lưới 4×3 và 10 fold. 2. (Vừa) Thêm `kernel` vào lưới. 3. (Khó) Thay bằng `RandomizedSearchCV` và so sánh thời gian.

## Tóm tắt
Grid Search + cross-validation chọn siêu tham số; giữ tập test cho đánh giá cuối.
