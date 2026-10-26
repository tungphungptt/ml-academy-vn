**Cấp độ:** Beginner · **Tầng:** Core · **Kiến thức tiên quyết:** đạo hàm, Linear Regression · **Tiên quyết:** Linear Regression, Loss Functions: MSE, MAE, Huber, Cross-Entropy, Đạo hàm và gradient.

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

## Điều kiện áp dụng và kiểm tra kết luận
Điều kiện khả vi không tự bảo đảm một learning rate bất kỳ làm loss giảm. Với gradient L-Lipschitz và giả định thích hợp, có các giới hạn bước ổn định; hàm không lồi không có bảo đảm cực tiểu toàn cục chung. SGD là gradient từ một mẫu; mini-batch lấy trung bình gradient trong batch và nên xáo trộn train theo epoch nếu giả định dữ liệu cho phép. Batch nhỏ không tự rẻ hơn cho cùng chất lượng, vì nhiều update/epoch hơn. Để so sánh, báo cả số update, số lượt duyệt dữ liệu, thời gian và loss; đừng chỉ so “epoch”. Lab hồi quy cũ có 3 điểm, nên batch size 8 trên chính dữ liệu đó chỉ là Batch GD, không minh họa mini-batch thật.

## Đáp án và tiêu chí chấm
1. Với η=0.25, hệ số mỗi bước là 0.5, nên θ1=2 và θ2=1. (2 điểm).
2. Giữ dữ liệu/seed và tiêu chí dừng MSE<0.01, ghi số update lẫn epoch, phát hiện phân kỳ thay vì ép score hợp lệ. (3 điểm).
3. Tạo ít nhất 64 điểm train; batch size 8 cho 8 update/epoch. Gradient dùng mean của batch, không chia N toàn tập thêm một lần. Shuffle train và vẽ loss sau cùng số update hoặc báo rõ trục epoch khác số update. (5 điểm).

## Nguồn tham khảo
- [Stanford CS231n: Optimization](https://cs231n.github.io/optimization-1/).
- [scikit-learn User Guide: SGD](https://scikit-learn.org/stable/modules/sgd.html).

## Thực nghiệm Batch, SGD và mini-batch từ đầu
Đoạn NumPy này dùng 64 mẫu tự sinh, cập nhật mean gradient trong từng batch. Mỗi cấu hình chạy 25 epoch nhưng **không có cùng số update**, nên đây là minh họa cơ chế, không phải benchmark tốc độ công bằng:
```python
import numpy as np
rng = np.random.default_rng(71)
x = rng.normal(size=64); y = 2*x + .1*rng.normal(size=64)
result = []
for batch_size in (1, 8, 64):
    shuffle = np.random.default_rng(72)
    w, b, steps = 0., 0., 0
    for epoch in range(25):
        ids = shuffle.permutation(len(x))
        for start in range(0,len(x),batch_size):
            pick = ids[start:start+batch_size]
            error = w*x[pick]+b-y[pick]
            w -= .03 * 2*np.mean(error*x[pick])
            b -= .03 * 2*np.mean(error)
            steps += 1
    mse = float(np.mean((w*x+b-y)**2))
    assert np.isfinite(mse) and mse < np.mean(y**2)
    result.append((batch_size, steps, round(mse,4)))
print(result)
```
Kết quả kỳ vọng (đã chạy CPU): `[(1, 1600, 0.0071), (8, 200, 0.0071), (64, 25, 0.3715)]`. Bộ ba là batch size, số update và MSE train. Cùng 25 epoch nhưng số update khác nhau; khi so sánh convergence cần thêm budget update/time và validation, không chọn batch size bằng test.
