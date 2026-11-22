**Cấp độ:** Beginner · **Tầng:** Core · **Kiến thức tiên quyết:** đạo hàm, Linear Regression · **Tiên quyết:** Linear Regression, Loss Functions: MSE, MAE, Huber, Cross-Entropy, Đạo hàm và gradient.

**Mục tiêu:** hiểu quy tắc cập nhật của Gradient Descent, vai trò của learning rate và khác biệt giữa Batch, SGD, Mini-batch.

## Vấn đề thực tế
Hầu hết mô hình học máy được huấn luyện bằng cách tìm tham số $\theta$ làm hàm mất mát $L(\theta)$ nhỏ nhất. Với mô hình lớn, ta không thể giải trực tiếp, nên cần một thuật toán lặp cải thiện tham số từng bước.

## Trực giác
Hãy tưởng tượng bạn đứng trên sườn đồi trong sương mù và muốn xuống thung lũng. Bạn chỉ cảm nhận được độ dốc dưới chân, nên mỗi lần bước một đoạn ngắn theo hướng dốc xuống nhất. Gradient chính là "độ dốc" đó, learning rate là độ dài bước chân.

## Công thức
$$
\theta \leftarrow \theta - \eta \, \nabla_\theta L(\theta)
$$

Trong đó $\theta$ là vector tham số, $\eta>0$ là learning rate, $\nabla_\theta L$ là vector đạo hàm riêng của $L$ theo từng tham số. Gradient chỉ hướng làm $L$ tăng nhanh nhất, nên ta đi theo hướng ngược lại (dấu trừ).

Với Linear Regression $\hat y = wx+b$ và $L=\frac1N\sum_i(wx_i+b-y_i)^2$:
$$
\frac{\partial L}{\partial w}=\frac{2}{N}\sum_i (wx_i+b-y_i)\,x_i,\qquad \frac{\partial L}{\partial b}=\frac{2}{N}\sum_i (wx_i+b-y_i)
$$

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


## Từ gradient đến một bước cập nhật kiểm chứng được

Hãy nối với [hồi quy tuyến tính](/learn/linear-regression): giữ $x=(1,2,3)$, $y=(2,4,6)$, $w=1,b=0$. MSE ban đầu là $14/3$; gradient là $(dw,db)=(-28/3,-4)$. Với $\eta=0.05$, tính **cả hai** tham số mới từ trạng thái cũ:

$$
w_{new}=1-0.05(-28/3)=22/15,\qquad
b_{new}=0-0.05(-4)=1/5.
$$

Dự đoán mới là $5/3,47/15,23/5$; residual là $-1/3,-13/15,-7/5$. Do đó loss mới bằng $127/135\approx0.940741$. Hãy tự cộng ba bình phương rồi chia ba. Bước này nhỏ hơn loss ban đầu, nhưng không được lấy một lần giảm loss làm bảo đảm cho mọi bước học.

[Google MLCC: Gradient descent](https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent) minh họa chuỗi loss → gradient → tham số mới. Ví dụ ở đây dùng dữ liệu nhỏ khác và MSE không có hệ số 1/2. `descent` gọi `linear` đúng một lần cho gradient cũ, sau đó tính w,b mới đồng thời; nó không tính lại db sau khi đã đổi w.

## Phòng thí nghiệm cập nhật từng bước

```neuralclone
descent
```

Đặt lại, bấm “Chạy một bước”: đối chiếu w=1.466667, b=0.2 và loss≈0.940741. Dãy loss lưu cả bước 0. “Phát từng bước” áp dụng chính phép tính ấy cách nhau 600ms, tối đa 30 bước; dừng khi ngoài viewport hoặc tab ẩn. Reduced motion vẫn cho chạy từng bước và đọc toàn bộ số. Tham số được cập nhật bằng float, phần hiển thị mới làm tròn.

Thử learning rate bằng 0: state được quan sát qua thêm một bước nhưng w,b và loss không đổi. Thử 0.5 sau khi đặt lại: w mới bằng $17/3$, b mới bằng 2, loss bằng $2594/27\approx96.074074$, lớn hơn rất nhiều. Không phải gradient bị sai: bước đã đi quá xa. Nếu bước kế tiếp vượt giới hạn số của minh họa, giao diện dừng trước khi áp dụng và thông báo rõ, không ép loss vào một giá trị “đẹp”.

## Đào sâu: ngưỡng ổn định phụ thuộc độ cong

Với bài toán ba điểm này, đặt $\theta=(w,b)^T$. Hessian của MSE là:

$$
H=\begin{pmatrix}28/3&4\\4&2\end{pmatrix},\qquad
\lambda_{max}=\frac{17+\sqrt{265}}3\approx11.092940.
$$

Các sai lệch theo từng hướng riêng được nhân với $1-\eta\lambda$. Vì H xác định dương, một learning rate hằng bảo đảm hội tụ từ mọi điểm ban đầu trong số học chính xác khi $0<\eta<2/\lambda_{max}\approx0.180295$. Đây là kết luận tự suy từ bài toán bậc hai **cụ thể này**, không phải learning rate chuẩn cho mọi mô hình. Bài $L(\theta)=\theta^2$ ở phần trên có độ cong 2, nên điều kiện $0<\eta<1$ khác một cách hợp lý. Đổi scale của x sẽ đổi H và ngưỡng bước học.

[CS231n, effect of step size](https://cs231n.github.io/optimization-1/) giải thích vì sao hướng đi đúng vẫn có thể làm loss tăng khi bước quá dài. Với mạng phi tuyến, điều kiện còn phụ thuộc cấu trúc hàm; không dùng công thức ngưỡng của ba điểm để bảo đảm hội tụ mạng sâu.

Tự kiểm tra: (1) Vì sao eta=0 không phải “hội tụ thành công”? Tham số đứng yên dù gradient có thể khác 0. (2) 30 bước trên ba điểm này tương đương bao nhiêu epoch batch đầy đủ? 30, mỗi bước xem cả ba mẫu; điều này không đúng cho mini-batch. (3) Nếu dùng nửa MSE, Hessian và gradient đều giảm một nửa; ngưỡng bước học tăng gấp đôi. Phần code NumPy cũ phía dưới bổ sung ví dụ nhiều mẫu, nơi cần phân biệt epoch và update.

## Code và cách chạy
Bài thực hành `Linear Regression` ở trang **Code Lab** (`labs/linear_regression/scratch.py`) cài đặt đúng công thức trên bằng NumPy; kết quả kỳ vọng $w\approx2,\ b\approx0$. Ở trang **Playground**, kéo learning rate lên cao để thấy loss phân kỳ.

## Lỗi thường gặp
- Learning rate quá lớn: loss tăng hoặc thành `inf`/`nan`. Hãy giảm $\eta$.
- Learning rate quá nhỏ: hội tụ rất chậm.
- Đặc trưng khác thang đo: nên chuẩn hóa để các tham số hội tụ cùng tốc độ.

## Ưu điểm, hạn chế
Cập nhật dễ cài đặt khi tính được gradient. Khả vi chưa đủ để bảo đảm hội tụ: bước học và tính chất của hàm vẫn quyết định độ ổn định. Với hàm không lồi (mạng nơ-ron) nó có thể dừng ở cực tiểu địa phương hoặc điểm yên ngựa. Các bộ tối ưu như Momentum, RMSprop, Adam cải tiến cách cập nhật.

## Bài tập
1. (Dễ) Với $L=\theta^2$, $\eta=0.25$, $\theta_0=4$, tính $\theta_1,\theta_2$.
2. (Vừa) Chạy lab với learning rate khác nhau và ghi lại số epoch để MSE < 0.01.
3. (Khó) Tự cài mini-batch GD với batch size 8 và so sánh đường cong loss với Batch GD.

## Tóm tắt
Gradient Descent lặp lại $\theta \leftarrow \theta-\eta\nabla L$. Learning rate quyết định tốc độ và độ ổn định.

## Điều kiện áp dụng và kiểm tra kết luận
Điều kiện khả vi không tự bảo đảm một learning rate bất kỳ làm loss giảm. Với gradient L-Lipschitz và giả định thích hợp, có các giới hạn bước ổn định; hàm không lồi không có bảo đảm cực tiểu toàn cục chung.

SGD là gradient từ một mẫu; mini-batch lấy trung bình gradient trong batch và nên xáo trộn train theo epoch nếu giả định dữ liệu cho phép. Batch nhỏ không tự rẻ hơn cho cùng chất lượng, vì nhiều update/epoch hơn.

Để so sánh, báo cả số update, số lượt duyệt dữ liệu, thời gian và loss; đừng chỉ so “epoch”. Lab hồi quy cũ có 3 điểm, nên batch size 8 trên chính dữ liệu đó chỉ là Batch GD, không minh họa mini-batch thật.

## Đáp án và tiêu chí chấm
1. Với $\eta=0.25$, hệ số mỗi bước là 0.5, nên $\theta_1=2$ và $\theta_2=1$. (2 điểm).
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

## Nguồn cho phần thí nghiệm và đào sâu

- [Linear regression: Gradient descent](https://developers.google.com/machine-learning/crash-course/linear-regression/gradient-descent) — Google for Developers, Machine Learning Crash Course. Phần đã đọc: Calculate MSE, Weight derivative, Bias derivative, Move weights and bias. Truy cập 28/10/2026.
- [CS231n: Optimization (part 1)](https://cs231n.github.io/optimization-1/) — Stanford CS231n course notes. Phần đã đọc: Computing the gradient numerically with finite differences, Effect of step size, Gradient descent. Truy cập 28/10/2026.
