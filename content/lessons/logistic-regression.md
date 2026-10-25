**Cấp độ:** Beginner · **Tiên quyết:** Linear Regression, Gradient Descent.
**Mục tiêu:** hiểu sigmoid, cross-entropy và cách huấn luyện phân loại nhị phân.

## Vấn đề thực tế
Dự đoán một email có phải spam (1) hay không (0). Đầu ra cần là **xác suất** trong $[0,1]$, không phải số thực bất kỳ.

## Trực giác và công thức
Tính điểm tuyến tính $z=\mathbf w^\top\mathbf x+b$ rồi nén vào $(0,1)$ bằng sigmoid:
$$p=\sigma(z)=\frac{1}{1+e^{-z}},\qquad L=-\frac1N\sum_i\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]$$
$y_i\in\{0,1\}$ là nhãn thật, $p_i$ là xác suất dự đoán lớp 1, $N$ là số mẫu. Gradient gọn: $\partial L/\partial \mathbf w=\frac1N\sum_i (p_i-y_i)\mathbf x_i$. Decision boundary là tập $z=0$ (một đường thẳng/siêu phẳng); dự đoán lớp 1 khi $p>0.5$.

![Đường sigmoid và ranh giới quyết định](/img/logistic-regression.svg)

## Ví dụ từng bước
$z=0\Rightarrow p=0.5$; $z=2\Rightarrow p\approx0.8808$. Nếu $y=1$ thì loss $=-\ln0.8808\approx0.1269$. Với $w=0,b=0$, mẫu $x=2,y=1$: $p=0.5$, gradient theo $w$ là $(0.5-1)\cdot2=-1$; với $\eta=0.1$, $w\leftarrow0.1$.

## Code và cách chạy
Bài **Logistic Regression** trong Code Lab (`labs/logistic_regression/`): bản NumPy cho `loss=0.0575 accuracy=0.980`, bản scikit-learn cho `accuracy=0.980`.

## Lỗi thường gặp
Không chuẩn hóa đặc trưng; dùng MSE thay cho cross-entropy; dữ liệu mất cân bằng nên chỉ nhìn accuracy.

## Ưu điểm, hạn chế, so sánh
Đơn giản, cho xác suất, dễ diễn giải. Ranh giới chỉ tuyến tính (trừ khi thêm đặc trưng phi tuyến). Khác Perceptron ở chỗ cho xác suất và có loss khả vi.

## Bài tập
1. (Dễ) Tính $\sigma(-2)$. 2. (Vừa) Chạy lab và đổi learning rate. 3. (Khó) Suy ra gradient $(p-y)x$ từ $L$.

## Tóm tắt
Sigmoid + cross-entropy + gradient descent cho phân loại nhị phân.
