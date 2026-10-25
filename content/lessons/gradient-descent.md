**Cấp độ:** Beginner · **Kiến thức tiên quyết:** đạo hàm, Linear Regression.

**Mục tiêu:** hiểu quy tắc cập nhật của Gradient Descent, vai trò của learning rate và khác biệt giữa Batch, SGD, Mini-batch.

## Vấn đề thực tế
Hầu hết mô hình học máy được huấn luyện bằng cách tìm tham số $\theta$ làm hàm mất mát $L(\theta)$ nhỏ nhất. Với mô hình lớn, ta không thể giải trực tiếp, nên cần một thuật toán lặp cải thiện tham số từng bước.

## Trực giác
Hãy tưởng tượng bạn đứng trên sườn đồi trong sương mù và muốn xuống thung lũng. Bạn chỉ cảm nhận được độ dốc dưới chân, nên mỗi lần bước một đoạn ngắn theo hướng dốc xuống nhất. Gradient chính là "độ dốc" đó, learning rate là độ dài bước chân.

## Công thức
$$\theta \leftarrow \theta - \eta \, \nabla_\theta L(\theta)$$

Trong đó $\theta$ là vector tham số, $\eta>0$ là learning rate, $\nabla_\theta L$ là vector đạo hàm riêng của $L$ theo từng tham số. Gradient chỉ hướng làm $L$ tăng nhanh nhất, nên ta đi theo hướng ngược lại (dấu trừ).

Với Linear Regression $\hat y = wx+b$ và $L=\frac1N\sum_i(wx_i+b-y_i)^2$:
$$\frac{\partial L}{\partial w}=\frac{2}{N}\sum_i (wx_i+b-y_i)\,x_i,\qquad \frac{\partial L}{\partial b}=\frac{2}{N}\sum_i (wx_i+b-y_i)$$

![Hoạt ảnh Gradient Descent trên parabol](/img/gradient-descent.svg)

## Ví dụ từng bước
Lấy $L(\theta)=\theta^2$, nên $\nabla L = 2\theta$. Chọn $\theta_0=4$, $\eta=0.1$:
- $\theta_1 = 4 - 0.1\cdot 8 = 3.2$
- $\theta_2 = 3.2 - 0.1\cdot 6.4 = 2.56$

Mỗi bước nhân $\theta$ với $1-2\eta=0.8$, nên $\theta_t = 4\cdot 0.8^t \to 0$. Vì $|1-2\eta|<1$ khi và chỉ khi $0<\eta<1$, learning rate $\eta\ge 1$ làm thuật toán không hội tụ trong ví dụ này.

## Ba biến thể
- **Batch GD:** dùng toàn bộ $N$ mẫu để tính gradient mỗi bước: ổn định nhưng chậm khi dữ liệu lớn.
- **SGD:** dùng 1 mẫu mỗi bước: nhanh, nhiễu, loss dao động.
- **Mini-batch GD:** dùng một lô nhỏ (ví dụ 32 mẫu): cân bằng, là lựa chọn phổ biến trong Deep Learning.

## Code và cách chạy
Bài thực hành `Linear Regression` ở trang **Code Lab** (`labs/linear_regression/scratch.py`) cài đặt đúng công thức trên bằng NumPy; kết quả kỳ vọng $w\approx2,\ b\approx0$. Ở trang **Playground**, kéo learning rate lên cao để thấy loss phân kỳ.

## Lỗi thường gặp
- Learning rate quá lớn: loss tăng hoặc thành `inf`/`nan`. Hãy giảm $\eta$.
- Learning rate quá nhỏ: hội tụ rất chậm.
- Đặc trưng khác thang đo: nên chuẩn hóa để các tham số hội tụ cùng tốc độ.

## Ưu điểm, hạn chế
Đơn giản, áp dụng được cho mọi hàm khả vi. Với hàm không lồi (mạng nơ-ron) nó có thể dừng ở cực tiểu địa phương hoặc điểm yên ngựa. Các bộ tối ưu như Momentum, RMSprop, Adam cải tiến cách cập nhật.

## Bài tập
1. (Dễ) Với $L=\theta^2$, $\eta=0.25$, $\theta_0=4$, tính $\theta_1,\theta_2$.
2. (Vừa) Chạy lab với learning rate khác nhau và ghi lại số epoch để MSE < 0.01.
3. (Khó) Tự cài mini-batch GD với batch size 8 và so sánh đường cong loss với Batch GD.

## Tóm tắt
Gradient Descent lặp lại $\theta \leftarrow \theta-\eta\nabla L$. Learning rate quyết định tốc độ và độ ổn định.
