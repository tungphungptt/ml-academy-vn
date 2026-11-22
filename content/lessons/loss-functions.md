**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Linear Regression, Xác suất cơ bản.
**Mục tiêu:** hiểu và chọn hàm mất mát: MSE, MAE, Huber, Binary Cross-Entropy, Cross-Entropy.

## Vấn đề thực tế
Hàm mất mát biến "mô hình sai bao nhiêu" thành một con số để thuật toán tối ưu giảm dần. Chọn loss khác nhau nghĩa là chọn cách "phạt" lỗi khác nhau.

## Công thức
Với sai số $e=\hat y-y$:
$$
\text{MSE}=e^2,\qquad \text{MAE}=|e|,\qquad \text{Huber}_\delta=\begin{cases}\tfrac12e^2&|e|\le\delta\\ \delta\big(|e|-\tfrac12\delta\big)&|e|>\delta\end{cases}
$$
$$
\text{BCE}=-\big[y\ln p+(1-y)\ln(1-p)\big],\qquad \text{CE}=-\ln p_y
$$
MSE phạt rất nặng lỗi lớn (nhạy với ngoại lai); MAE tăng tuyến tính theo độ lớn sai số (đạo hàm bằng dấu của sai số khi khác 0, không khả vi tại 0); Huber kết hợp cả hai. BCE dùng cho phân loại nhị phân với $p$ là xác suất dự đoán lớp 1; CE dùng cho đa lớp, $p_y$ là xác suất của lớp đúng.

![So sánh MSE, MAE và Huber](/img/loss-functions.svg)

Hình dùng đường $\tfrac12e^2$ (nhãn “½·MSE”) để so với nhánh trong của Huber. Công thức và các phép tính MSE trong bài vẫn dùng $e^2$; cần nhân đôi đường màu xanh khi đối chiếu giá trị MSE.

## Ví dụ từng bước
$y=3,\hat y=5$ ($e=2$): MSE (dạng $e^2$) $=4$, MAE $=2$, Huber với $\delta=1$ $=1\cdot(2-0.5)=1.5$. BCE khi $y=1,p=0.8$: $-\ln0.8\approx0.2231$; khi $y=0,p=0.8$: $-\ln0.2\approx1.6094$ (dự đoán tự tin nhưng sai bị phạt nặng). Với 4 sai số $(1,1,1,10)$: MSE trung bình $=25.75$, MAE trung bình $=3.25$: một ngoại lai chi phối MSE.

## Một loss cho một mẫu, một objective cho cả tập

Các biểu thức $e^2$, $|e|$ và Huber ở trên là loss **mỗi mẫu**. Với $N$ mẫu có cùng trọng số, objective trung bình là $L=N^{-1}\sum_i\ell_i$. Không bỏ mẫu dự đoán sai hoặc chia cho số mẫu có lỗi. Chẳng hạn residual $(0,0,3)$ cho MSE bằng $(0+0+9)/3=3$, không phải 9. Khi đổi từ mean sang sum, gradient nhân $N$; giữ nguyên learning rate sẽ đổi độ dài bước cập nhật.

Loss đo sai lệch trên nhãn có sẵn; nó không tự đo khả năng tổng quát hóa. Hai mô hình có cùng train loss vẫn có thể khác validation loss. Với MSE, bình phương còn đổi đơn vị: nếu residual là mét thì MSE là mét vuông. Không so MSE của hai mục tiêu khác đơn vị mà chưa chuẩn hóa ý nghĩa.

## Huber thay đổi lực kéo của ngoại lai thế nào?

Đạo hàm theo residual chính là đạo hàm theo dự đoán khi giữ nhãn cố định, vì $e=\hat y-y$ và $\partial e/\partial\hat y=1$:

$$
\frac{\partial\ell_{Huber}}{\partial e}=
\begin{cases}e,&|e|\le\delta\\\delta\,\operatorname{sign}(e),&|e|>\delta.\end{cases}
$$

Tại $e=2,\delta=1$, Huber bằng 1.5 và đạo hàm bằng 1; MSE bằng 4 và đạo hàm bằng 4; MAE bằng 2 và đạo hàm bằng 1. Với $e=10$, gradient Huber vẫn bằng 1, trong khi gradient MSE tăng lên 20. Huber giới hạn **độ lớn gradient theo residual**, không giới hạn giá trị loss: loss vẫn tăng khi sai số tăng.

Hai nhánh nối tại $|e|=\delta$ với cùng giá trị $\delta^2/2$ và cùng đạo hàm. MAE không có đạo hàm cổ điển tại 0; mọi số trong $[-1,1]$ là subgradient tại đó. Bảng thí nghiệm ghi rõ “không khả vi” thay vì gán nhầm một đạo hàm duy nhất.

```neuralclone
loss
```

Đổi residual qua −δ, 0 và δ; so sánh giá trị loss với đạo hàm, rồi tăng δ. Hình vẽ dùng **MSE đầy đủ $e^2$**, khác hình tĩnh ½·MSE phía trên. Mỗi điểm, bảng và JSON lấy từ `regressionLoss(error, delta)`. Delta phải dương; 0 không phải cấu hình Huber hợp lệ. [Tài liệu HuberLoss của PyTorch](https://docs.pytorch.org/docs/2.15/generated/torch.nn.HuberLoss.html) cũng phân biệt Huber với SmoothL1: nói chung hai loss khác nhau một hệ số δ, chỉ trùng khi δ=1.

## BCE từ logits: giữ đúng số trước khi lấy log

Với $p=\sigma(z)$ và nhãn $y\in\{0,1\}$, thay sigmoid vào BCE rồi thu gọn cho:

$$
\ell(z,y)=\max(z,0)-yz+\log(1+\exp(-|z|)).
$$

Trong biểu thức này, số mũ luôn không dương. Với nhãn nhị phân, phần tuyến tính còn có thể viết thành $\max(-z,0)$ khi y=1 và $\max(z,0)$ khi y=0; code dùng dạng này. `log1p(u)` tính $\log(1+u)$ chính xác hơn khi u rất nhỏ.

Ví dụ $z=1000,y=0$ có loss xấp xỉ 1000, dù sigmoid trên máy đã có thể làm tròn thành 1. Nếu lấy `log(1-p)` từ probability đã làm tròn, phép tính sẽ hỏng. Khi $z=1000,y=1$, loss gần 0; đây là giới hạn số học, không phải lý do bỏ mẫu. [BCEWithLogitsLoss](https://docs.pytorch.org/docs/2.15/generated/torch.nn.BCEWithLogitsLoss.html) gộp sigmoid và BCE để ổn định số. Công thức ở đây không dùng trọng số lớp hoặc label smoothing; các biến thể đó cần diễn giải riêng.

Tự kiểm tra: residual (0,0,3) có MAE trung bình bao nhiêu? **1**. Huber δ=1 tại e=−2 có gradient theo dự đoán bao nhiêu? **−1**, nên bước đi ngược gradient sẽ tăng dự đoán. Đổi mean thành sum mà giữ learning rate có cho cùng update không? **Không**, trừ khi gradient bằng 0 hoặc đã điều chỉnh hệ số tương ứng.

## Code và cách chạy
```python
from math import log
e = 2
def huber(error, delta=1.):
    if delta <= 0:
        raise ValueError("delta must be positive")
    return (0.5 * error ** 2 if abs(error) <= delta
            else delta * (abs(error) - 0.5 * delta))
print([e ** 2, abs(e), huber(e), round(-log(0.8), 4), round(-log(0.2), 4)])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[4, 2, 1.5, 0.2231, 1.6094]`.
```python
import numpy as np
e = np.array([1.0, 1.0, 1.0, 10.0])
print(float(np.mean(e ** 2)), float(np.mean(np.abs(e))))
```
Kết quả kỳ vọng (đã chạy cục bộ): `25.75 3.25`.

## Lỗi thường gặp
Dùng MSE cho phân loại mà mặc định nó có cùng likelihood/gradient như CE; đưa softmax rồi lại đưa vào loss đã gồm softmax; quên rằng loss tối ưu không nhất thiết là metric báo cáo (ví dụ tối ưu CE nhưng báo cáo F1).

## Bài tập
1. (Dễ) Tính MAE và MSE của $e=-3$. 2. (Vừa) Vẽ Huber với $\delta=1$ và $\delta=2$. 3. (Khó) Chứng minh gradient của BCE theo $z$ (logit) là $p-y$.

## Tóm tắt
MSE nhạy ngoại lai, MAE bền, Huber dung hòa; BCE/CE là loss chuẩn cho phân loại.

## Điều kiện áp dụng và kiểm tra kết luận
Loss là objective trong train; metric là tiêu chí báo cáo và có thể không khả vi. Mean và sum khác scale gradient, do đó ảnh hưởng LR/regularization. Với hồi quy, MSE phù hợp conditional mean, MAE phù hợp conditional median dưới cách diễn giải rủi ro tương ứng; Huber chuyển từ quadratic sang linear theo delta. MSE không bị cấm cho classification, nhưng BCE/CE gắn với likelihood Bernoulli/categorical và có đặc tính tối ưu thuận lợi cho logits tuyến tính. Khi dùng PyTorch, CE nhận logits và nhãn index long; BCEWithLogitsLoss nhận logits/target float cùng shape. Không log một probability đã bị underflow về 0 rồi sửa bằng cách bỏ những mẫu “xấu”.

## Đáp án và tiêu chí chấm
1. Với $e=-3$, $\operatorname{MAE}=3$, $\operatorname{MSE}=9$; Huber $\delta=1$ là 2.5 nếu muốn so thêm. (2 điểm).
2. Vẽ trên cùng miền e, ghi delta rõ; hai nhánh phải nối liên tục và có đạo hàm khớp tại $|e|=\delta$. Đây là hình hàm loss, không phải đường cong huấn luyện. (3 điểm).
3. Với $p=\sigma(z)$, $\partial\ell/\partial p=(p-y)/(p(1-p))$ và $\partial p/\partial z=p(1-p)$, suy ra $\partial\ell/\partial z=p-y$. Trung bình qua batch thêm hệ số $1/N$; kiểm tra với logits lớn bằng hàm loss ổn định số. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Linear Regression (loss)](https://d2l.ai/chapter_linear-regression/index.html).
- [Stanford CS231n: Linear Classification](https://cs231n.github.io/linear-classify/).
