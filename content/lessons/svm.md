**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Logistic Regression, Tập lồi, hàm lồi và điều kiện tối ưu.
**Mục tiêu:** hiểu lề (margin), hinge loss và kernel trick.

## Vấn đề thực tế
Nhiều siêu phẳng cùng tách được hai lớp. SVM chọn siêu phẳng có **lề lớn nhất**, thường tổng quát hóa tốt hơn.

## Công thức
Siêu phẳng $\mathbf w^\top\mathbf x+b=0$; khoảng cách từ $\mathbf x$ tới nó là $|\mathbf w^\top\mathbf x+b|/\lVert\mathbf w\rVert$ và độ rộng giữa hai mặt mức $f=\pm1$ là $2/\lVert\mathbf w\rVert$; đây là lề SVM khi đã cố định chuẩn tắc bằng các constraint. SVM lề mềm tối thiểu hóa
$$
\tfrac12\lVert\mathbf w\rVert^2+C\sum_i\max\big(0,\,1-y_i(\mathbf w^\top\mathbf x_i+b)\big)
$$
với $y_i\in\{-1,+1\}$; $C$ cân bằng giữa lề rộng và tổng mức độ vi phạm lề. Kernel (ví dụ RBF) cho phép ranh giới phi tuyến mà không tính tường minh không gian đặc trưng cao chiều.

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

## Điều kiện áp dụng và kiểm tra kết luận
Công thức độ rộng $2/\lVert w\rVert$ nói về dải giữa $f(x)=-1$ và $f(x)=1$. Nó là margin chuẩn tắc của SVM khi đã cố định scale bằng các ràng buộc $y_if(x_i)\ge1$; một $w,b$ tùy ý không tự là nghiệm SVM hoặc margin tối ưu trên dữ liệu.

Hard margin yêu cầu khả tách; soft margin đưa slack $\xi_i\ge0$ và $y_if(x_i)\ge1-\xi_i$, phạt $C\sum_i\xi_i$. Hinge loss là dạng loại slack tương ứng.

Kernel $K(x,z)=\phi(x)^\top\phi(z)$ phải thỏa các điều kiện kernel hợp lệ (Gram PSD cho các tập hữu hạn), không phải mọi hàm similarity.

Với nhiều lớp, SVC dùng one-vs-one nội bộ; LinearSVC mặc định one-vs-rest, không đồng nhất hai solver. Decision score không tự là probability đã calibration.

## Objective và dự đoán đa lớp
Với soft margin chuẩn, primal là
$$
\min_{w,b,\xi}\frac12\|w\|^2+C\sum_i\xi_i,\qquad y_i(w^\top x_i+b)\ge1-\xi_i,\quad\xi_i\ge0.
$$
Loại slack cho dạng hinge tương đương. Với kernel hợp lệ, decision function dùng support vectors:
$$
f(x)=\sum_i\alpha_i y_i K(x_i,x)+b.
$$
Hệ số dual có $0\le\alpha_i\le C$ và $\sum_i\alpha_i y_i=0$ trong bài toán chuẩn; phần lớn điểm có alpha bằng 0 không tham gia dự đoán. $C$ điều khiển đánh đổi norm và slack theo quy ước tổng loss, nên không so số C trực tiếp khi một thư viện dùng mean loss.

Với $K$ lớp, one-vs-rest học $K$ bài nhị phân; one-vs-one học $K(K-1)/2$ bài từng cặp rồi tổng hợp. Đây là chiến lược mở rộng, không đổi kernel thành multiclass kernel; shape decision scores của API có thể được biến đổi sau huấn luyện. Kernel RBF giúp ranh giới cong nhưng tốn bộ nhớ/thời gian theo số mẫu và nhạy với scale/gamma; linear thường phù hợp dữ liệu thưa nhiều chiều.

## Đáp án và tiêu chí chấm
1. Trong chuẩn tắc, $\lVert(6,8)\rVert=10$ nên độ rộng giữa hai biên $\pm1$ là 0.2. Cần nói rõ chuẩn tắc, không chỉ khoảng cách một điểm tới hyperplane. (2 điểm).
2. Dùng cùng pipeline scaling và train/validation splitter để so linear/RBF; C và gamma chọn trên train CV, test dùng cuối. (3 điểm).
3. GridSearchCV bọc Pipeline(StandardScaler, SVC), tên tham số như svc__C. Nêu khoảng log-scale, budget, cùng folds và class-weight nếu mục tiêu cần; không chọn theo test. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Support Vector Machines](https://scikit-learn.org/stable/modules/svm.html).
