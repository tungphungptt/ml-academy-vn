**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Perceptron, Đạo hàm và gradient.
**Mục tiêu:** biết các hàm kích hoạt phổ biến và ưu nhược điểm của từng loại.

## Vấn đề thực tế
Không có hàm kích hoạt phi tuyến, nhiều lớp tuyến tính chỉ tương đương một lớp. Hàm kích hoạt quyết định mạng biểu diễn được gì và gradient chảy qua mạng thế nào.

![Đồ thị sigmoid, tanh và ReLU](/img/activations.svg)

## Công thức
$$
\sigma(x)=\frac1{1+e^{-x}},\quad \tanh(x),\quad \operatorname{ReLU}(x)=\max(0,x),\quad \text{LeakyReLU}(x)=\max(\alpha x,x),\quad \text{GELU}(x)=x\,\Phi(x)
$$
$\Phi$ là hàm phân phối tích lũy của phân phối chuẩn. Đạo hàm sigmoid: $\sigma'(x)=\sigma(x)(1-\sigma(x))$, lớn nhất là $0.25$ tại $x=0$, nên qua nhiều lớp gradient dễ **biến mất**. ReLU có đạo hàm 1 khi $x>0$ nhưng bằng 0 khi $x<0$ ("ReLU chết"); Leaky ReLU giữ độ dốc nhỏ $\alpha$ ở phía âm.

## Ví dụ từng bước
$\sigma(0)=0.5$; $\tanh(1)\approx0.7616$; $\operatorname{ReLU}(-2)=0$; $\text{LeakyReLU}(-2)$ với $\alpha=0.01$ là $-0.02$; $\text{GELU}(1)=1\cdot\Phi(1)\approx0.8413$.

## Code và cách chạy
```python
from math import erf, exp, sqrt, tanh
print([round(1 / (1 + exp(0)), 2), round(tanh(1), 4), max(0.0, -2.0), round(-2 * 0.01, 2), round(0.5 * (1 + erf(1 / sqrt(2))), 4)])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.5, 0.7616, 0.0, -0.02, 0.8413]`.

## Lỗi thường gặp
Dùng sigmoid ở mọi lớp ẩn của mạng sâu; quên rằng đầu ra của bài toán phân loại cần sigmoid (nhị phân) hoặc softmax (đa lớp), thường được gộp trong hàm loss.

## Cách chọn
Mặc định lớp ẩn: ReLU (hoặc GELU với Transformer). Lớp đầu ra: tùy bài toán. Tanh có tâm ở 0 nên hay dùng trong RNN.

## Bài tập
1. (Dễ) Tính $\sigma'(0)$. 2. (Vừa) Vẽ 4 hàm kích hoạt bằng Matplotlib. 3. (Khó) Chặn tích 10 đạo hàm sigmoid và giải thích vì sao chưa thể suy cùng chặn cho gradient toàn mạng nếu không xét trọng số.

## Tóm tắt
Hàm kích hoạt đưa tính phi tuyến vào mạng; ReLU là lựa chọn mặc định, sigmoid dễ gây gradient biến mất.

## Điều kiện áp dụng và kiểm tra kết luận
Chặn đạo hàm sigmoid bởi 1/4 chỉ chặn yếu tố activation, không chặn Jacobian toàn lớp nếu trọng số có norm lớn. Norm của tích Jacobian còn phụ thuộc ma trận trọng số, số lớp và các đường cộng/residual. ReLU có thể chết khi preactivation âm cho mọi input; LeakyReLU giữ slope âm nhỏ nhưng không chữa mọi lỗi tối ưu. GELU là lựa chọn thông dụng ở Transformer, không phải luôn hơn ReLU. Đầu ra hồi quy thường là linear; CE dùng logits nên không cần softmax thành một lớp riêng trước loss.

## Đáp án và tiêu chí chấm
1. $\sigma'(0)=0.25$. (2 điểm).
2. Vẽ các hàm trên cùng miền và ghi trục; thêm đạo hàm nếu muốn phân tích gradient, không suy chất lượng mô hình chỉ từ hình activation. (3 điểm).
3. Nếu xét riêng tích 10 đạo hàm sigmoid thì bị chặn bởi $0.25^{10}\approx9.54\times10^{-7}$. Gradient mạng còn có trọng số; chỉ suy bound tương ứng khi đã chặn norm các trọng số (ví dụ ≤1 trong đường đang xét). Nêu phản ví dụ hệ số trọng số lớn, không lặp lại khẳng định sai vô điều kiện. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Multilayer Perceptrons](https://d2l.ai/chapter_multilayer-perceptrons/index.html).
- [Stanford CS231n: Neural Networks](https://cs231n.github.io/neural-networks-1/).
