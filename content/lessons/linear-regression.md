**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Vector và ma trận, Đạo hàm và gradient, AI, Machine Learning và Deep Learning.
**Mục tiêu:** hiểu mô hình tuyến tính, hàm mất mát MSE và cách tìm tham số.

## Vấn đề thực tế
Cho diện tích nhà và giá bán của vài căn nhà, ta muốn dự đoán giá của một căn nhà mới.

## Mô hình và công thức
$$
\hat y_i=wx_i+b
$$

$$
L(w,b)=\frac1N\sum_{i=1}^N(\hat y_i-y_i)^2
$$

Trong đó $x$ là đặc trưng, $w$ là trọng số (độ dốc), $b$ là bias, $y_i$ là giá trị thật, $N$ là số mẫu.

![Đường hồi quy và sai số](/img/linear-regression.svg)

## Gradient: biết cần sửa trọng số theo hướng nào
Đặt residual (sai số có dấu) $e_i=\hat y_i-y_i$. Dùng chain rule cho bình phương sai số, rồi lấy trung bình:

$$
\begin{aligned}
\frac{\partial L}{\partial w}&=\frac2N\sum_{i=1}^N e_ix_i,\\
\frac{\partial L}{\partial b}&=\frac2N\sum_{i=1}^N e_i.
\end{aligned}
$$

Với $x_i>0$, dự đoán quá cao làm $e_i>0$: bước đi **ngược** gradient sẽ hạ $w$. Với feature âm, cần xét cả dấu $x_i$; không thể suy hướng chỉ từ residual. Khi có $d$ feature, $w\in\mathbb R^d$, $X\in\mathbb R^{N\times d}$, gradient là $\nabla_w L=2X^\top(Xw+b\mathbf1-y)/N$.

> **Lưu ý quy ước:** bài dùng MSE không có hệ số $1/2$. D2L dùng loss mỗi mẫu bằng một nửa bình phương sai số để triệt tiêu hệ số 2 khi đạo hàm. Hai quy ước có cùng nghiệm tối thiểu nhưng gradient và learning rate tương ứng cần được đối chiếu.

## Ví dụ từng bước
Dữ liệu $(x,y)$: $(1,2),(2,4),(3,6)$. Với $w=1,b=0$: residual $\hat y-y$ là $-1,-2,-3$ nên $L=(1+4+9)/3\approx 4{,}67$. Với $w=2,b=0$ thì $L=0$: đây là nghiệm tối ưu.

## Code from scratch
Xem `labs/linear_regression/scratch.py` (chạy: `python labs/linear_regression/scratch.py`, cần NumPy). Kết quả kỳ vọng: $w\approx2$, $b\approx0$.

### Kiểm tra số: loss và gradient phải dùng cùng quy ước
```python
import numpy as np
x = np.array([1., 2., 3.])
y = np.array([2., 4., 6.])
w, b = 1.5, 0.
def mse(w, b):
    return np.mean((w * x + b - y) ** 2)
e = w * x + b - y
grad = np.array([2 * np.mean(e * x), 2 * np.mean(e)])
h = 1e-5
numeric = np.array([(mse(w+h,b)-mse(w-h,b))/(2*h),
                    (mse(w,b+h)-mse(w,b-h))/(2*h)])
assert np.allclose(grad, numeric, atol=1e-8, rtol=0)
print(f"mse={mse(w,b):.4f} dw={grad[0]:.4f} db={grad[1]:.4f}")
```
Kết quả kỳ vọng: `mse=1.1667 dw=-4.6667 db=-2.0000`.

Sai phân trung tâm thay từng tham số một, giữ tham số còn lại cố định. Nó giúp bắt lỗi dấu, thiếu $x_i$ hoặc thiếu $1/N$; không thay thế việc suy đạo hàm. [Mở lab tương ứng](/lab?lab=linear_regression) để quan sát nhiều bước cập nhật; [Gradient Descent](/learn/gradient-descent) giải thích learning rate.

## Lỗi thường gặp
Learning rate quá lớn làm loss tăng thay vì giảm; không chuẩn hóa đặc trưng làm hội tụ chậm.

## Bài tập
1. (Dễ) Tính tay $L$ với $w=1{,}5$. 2. (Vừa) Đổi learning rate và quan sát loss. 3. (Khó) Suy ra gradient của $L$ theo $w$ và $b$.

## Điều kiện áp dụng và kiểm tra kết luận
Đầu vào là ma trận số $X\in\mathbb R^{N\times d}$ và target liên tục $y\in\mathbb R^N$; mô hình tuyến tính theo tham số, không bắt buộc y tuyến tính theo mọi biến gốc. Thêm cột 1 để chứa intercept: $Z=[X,\mathbf1]$, $\theta=(w^\top,b)^\top$. Phương trình chuẩn là $Z^\top Z\theta=Z^\top y$; chỉ viết nghiệm nghịch đảo khi $Z$ có các cột độc lập tuyến tính. `np.linalg.lstsq(Z,y,rcond=None)` dùng solver thích hợp cả khi suy biến; xem [SVD](/learn/linear-algebra-decompositions).

Với nhiễu Gaussian độc lập variance cố định, tối thiểu SSE tương ứng MLE; heteroscedasticity hoặc outlier làm cách diễn giải thống kê và khoảng bất định thay đổi.

Intercept không nên bị phạt như feature nếu quy ước regularization không yêu cầu. OLS nhanh và dễ diễn giải, nhưng extrapolation và feature tương quan mạnh có thể làm hệ số/dự đoán không ổn định.

## Đáp án và tiêu chí chấm
1. Giữ $b=0$, $w=1.5$. Ba residual $e_i=\hat y_i-y_i$ là $-0.5,-1,-1.5$. Vì bình phương loại dấu:

   $$
   \operatorname{MSE}=\frac{0.5^2+1^2+1.5^2}{3}=\frac{3.5}{3}=\frac76\approx1.1667.
   $$
   (2 điểm).
2. Ghi seed, LR, số update, loss hữu hạn và diễn biến hội tụ. LR quá lớn có thể phân kỳ; không chấm chỉ việc thấy một số epoch bất kỳ. (3 điểm).
3. Đặt $e_i=wx_i+b-y_i$. Với MSE trung bình ở trên:

   $$
   \begin{aligned}\frac{\partial L}{\partial w}&=\frac2N\sum_{i=1}^N e_ix_i,\\\frac{\partial L}{\partial b}&=\frac2N\sum_{i=1}^N e_i.\end{aligned}
   $$
   Nêu dấu và mean/sum để không sai hệ số; kiểm tra bằng finite difference. (5 điểm).

## Tóm tắt
Học mô hình tuyến tính cùng điều kiện nghiệm, loss và giao thức đánh giá; solver ổn định quan trọng hơn thao tác nghịch đảo viết tay.

## Nguồn tham khảo
- [scikit-learn User Guide: Linear Models](https://scikit-learn.org/stable/modules/linear_model.html).
- [D2L: Linear Regression — squared loss và gradient](https://d2l.ai/chapter_linear-regression/linear-regression.html).
