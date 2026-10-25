**Cấp độ:** Intermediate · **Tiên quyết:** Perceptron, Logistic Regression.
**Mục tiêu:** hiểu lề (margin), hinge loss và kernel trick.

## Vấn đề thực tế
Nhiều siêu phẳng cùng tách được hai lớp. SVM chọn siêu phẳng có **lề lớn nhất**, thường tổng quát hóa tốt hơn.

## Công thức
Siêu phẳng $\mathbf w^\top\mathbf x+b=0$; khoảng cách từ $\mathbf x$ tới nó là $|\mathbf w^\top\mathbf x+b|/\lVert\mathbf w\rVert$ và lề là $2/\lVert\mathbf w\rVert$. SVM lề mềm tối thiểu hóa
$$\tfrac12\lVert\mathbf w\rVert^2+C\sum_i\max\big(0,\,1-y_i(\mathbf w^\top\mathbf x_i+b)\big)$$
với $y_i\in\{-1,+1\}$; $C$ cân bằng giữa lề rộng và số điểm vi phạm. Kernel (ví dụ RBF) cho phép ranh giới phi tuyến mà không tính tường minh không gian đặc trưng cao chiều.

![Siêu phẳng và lề của SVM](/img/svm.svg)

## Ví dụ từng bước
$\mathbf w=(3,4),b=-5$: $\lVert\mathbf w\rVert=5$, lề $=2/5=0.4$; điểm $(3,4)$ cách siêu phẳng $|9+16-5|/5=4$. Hinge loss: $y=1,f=0.5\Rightarrow0.5$; $y=1,f=2\Rightarrow0$; $y=-1,f=0.5\Rightarrow1.5$.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
X, y = load_iris(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
print(round(SVC(kernel="rbf").fit(Xa, ya).score(Xb, yb), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.956`. Tập test chỉ có 45 mẫu nên chênh lệch vài điểm phần trăm giữa các mô hình chưa có ý nghĩa thống kê.

## Lỗi thường gặp
Không chuẩn hóa đặc trưng; để $C$ hoặc `gamma` quá lớn gây overfit; dùng SVM kernel cho dữ liệu hàng triệu mẫu (chậm).

## Ưu điểm, hạn chế
Hiệu quả khi số chiều lớn, dữ liệu vừa. Khó mở rộng cho dữ liệu rất lớn, không cho xác suất trực tiếp.

## Bài tập
1. (Dễ) Tính lề với $\mathbf w=(6,8)$. 2. (Vừa) So sánh kernel `linear` và `rbf` trên Iris. 3. (Khó) Dùng GridSearchCV chọn $C$ và `gamma`.

## Tóm tắt
SVM tối đa hóa lề, dùng hinge loss và kernel cho ranh giới phi tuyến.
