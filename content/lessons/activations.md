**Cấp độ:** Intermediate · **Tiên quyết:** MLP, Đạo hàm và gradient.
**Mục tiêu:** biết các hàm kích hoạt phổ biến và ưu nhược điểm của từng loại.

## Vấn đề thực tế
Không có hàm kích hoạt phi tuyến, nhiều lớp tuyến tính chỉ tương đương một lớp. Hàm kích hoạt quyết định mạng biểu diễn được gì và gradient chảy qua mạng thế nào.

![Đồ thị sigmoid, tanh và ReLU](/img/activations.svg)

## Công thức
$$\sigma(x)=\frac1{1+e^{-x}},\quad \tanh(x),\quad \operatorname{ReLU}(x)=\max(0,x),\quad \text{LeakyReLU}(x)=\max(\alpha x,x),\quad \text{GELU}(x)=x\,\Phi(x)$$
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
1. (Dễ) Tính $\sigma'(0)$. 2. (Vừa) Vẽ 4 hàm kích hoạt bằng Matplotlib. 3. (Khó) Giải thích vì sao gradient qua 10 lớp sigmoid nhỏ hơn $0.25^{10}$.

## Tóm tắt
Hàm kích hoạt đưa tính phi tuyến vào mạng; ReLU là lựa chọn mặc định, sigmoid dễ gây gradient biến mất.
