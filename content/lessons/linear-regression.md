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


## Đọc từng đóng góp vào loss và gradient

Mục tiêu phần thực hành là nhìn thấy **cùng một residual** xuất hiện trong ba nơi: đoạn nối trên hình, bình phương sai số trong loss, và đóng góp vào gradient. Giữ đúng quy ước $e_i=\hat y_i-y_i$. Đổi quy ước dấu của e thì công thức gradient phải đổi theo, trong khi e bình phương không đổi.

Với ba mẫu đã cho và $w=1,b=0$, dự đoán là 1, 2, 3. Residual lần lượt −1, −2, −3; bình phương là 1, 4, 9. Vì $N=3$, MSE bằng $14/3$, không phải 14. Đóng góp của từng mẫu vào $\partial L/\partial w$ là $2e_ix_i/3$: −2/3, −8/3, −6; cộng lại −28/3. Đóng góp vào $\partial L/\partial b$ là $2e_i/3$: −2/3, −4/3, −2; tổng −4. Dấu âm nói rằng tăng w hoặc b **một lượng đủ nhỏ**, giữ tham số kia cố định, sẽ giảm loss tại vị trí này.

Ở đây x và y là số không có đơn vị vật lý, phục vụ minh họa. Nếu y là triệu đồng thì residual có đơn vị triệu đồng, MSE có đơn vị triệu đồng bình phương, còn RMSE trở lại triệu đồng. Không đọc MSE như một tỷ lệ dự đoán đúng. [Google MLCC: Loss](https://developers.google.com/machine-learning/crash-course/linear-regression/loss) phân biệt MSE, MAE và RMSE.

## Thí nghiệm residual, nhãn và hệ số

```neuralclone
linear
```

Đặt w=2, b=0: các residual đều 0. Sau đó chỉ đổi y₃ từ 6 lên 9: hai mẫu đầu vẫn khớp, mẫu cuối có e=−3, nên MSE=3, dw=−6 và db=−2. Đây là cách kiểm tra rằng phép lấy trung bình vẫn chia cho ba mẫu, dù chỉ một mẫu có sai số. Hãy đoán các giá trị trước khi kéo slider.

Hàm `linear(w,b,lastY)` nhận cùng ba tham số mà điều khiển đang hiển thị. Nó trả `rows`, `loss`, `dw`, `db`; hình lấy prediction và y từ rows, bảng lấy từng đóng góp, output lấy tổng. Trục y tự đổi để không giấu dự đoán ngoài khung; so độ lớn loss bằng số thay vì chiều dài pixel giữa hai lần thay scale.

Python chạy độc lập: `linear(2,0,9)` trả `loss=3`, `dw=-6`, `db=-2`. Xem phần Python để đọc cả vòng lặp; không cần NumPy cho ba điểm này. Lab NumPy hiện có vẫn giữ quy ước MSE, nên ở cùng w,b và cùng dữ liệu phải cho gradient tương ứng.

## Vì sao bài này và tài liệu khác có thể lệch hệ số hai

[D2L, mục 3.1.1.2](https://d2l.ai/chapter_linear-regression/linear-regression.html#loss-function) dùng nửa bình phương sai số. Nếu đặt $J=L/2$ thì $\nabla J=\nabla L/2$. Hai hàm có cùng nghiệm cực tiểu, nhưng dùng cùng learning rate sẽ cho hai bước cập nhật khác nhau. Muốn bước giống nhau, learning rate của J phải gấp đôi learning rate của L. Không “sửa” gradient chỉ để một output giống ví dụ dùng quy ước khác.

Đào sâu: đối với MSE này, $L$ là hàm bậc hai lồi theo (w,b), nhưng tính lồi không có nghĩa mọi bước gradient descent đều làm loss giảm. Chọn bước học là nhiệm vụ của [bài tối ưu kế tiếp](/learn/gradient-descent). Khớp ba điểm huấn luyện với loss 0 cũng chưa chứng minh dự đoán tốt ở ngoài khoảng x đã quan sát.

Tự kiểm tra: nếu e=0 nhưng x khác 0 thì đóng góp gradient có bằng 0 không? Có, vì cả $2ex/N$ và $2e/N$ bằng 0. Nếu chỉ đổi dấu e mà giữ nguyên công thức gradient, kết quả tối ưu có còn đúng không? Không: hướng sửa bị đảo, dù cột e² vẫn trông hợp lý. Đây là lý do cần kiểm tra cả bảng residual và gradient, không chỉ loss.

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

## Nguồn cho phần thí nghiệm và đào sâu

- [Linear regression: Loss](https://developers.google.com/machine-learning/crash-course/linear-regression/loss) — Google for Developers, Machine Learning Crash Course. Phần đã đọc: Types of loss, Calculating loss example, Choosing a loss. Truy cập 28/10/2026.
- [Dive into Deep Learning 1.0.3: 3.1 Linear Regression](https://d2l.ai/chapter_linear-regression/linear-regression.html) — Dive into Deep Learning project. Phần đã đọc: 3.1.1.2 Loss Function, equations 3.1.5 and 3.1.6, 3.1.1.4 Minibatch Stochastic Gradient Descent. Truy cập 28/10/2026.
