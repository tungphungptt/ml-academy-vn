**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Perceptron, Đạo hàm và gradient.
**Mục tiêu:** biết các hàm kích hoạt phổ biến và ưu nhược điểm của từng loại.

## Vấn đề thực tế
Không có hàm kích hoạt phi tuyến, nhiều lớp tuyến tính chỉ tương đương một lớp. Hàm kích hoạt quyết định mạng biểu diễn được gì và gradient chảy qua mạng thế nào.

![Đồ thị sigmoid, tanh và ReLU](/img/activations.svg)

## Công thức
$$
\sigma(x)=\frac1{1+e^{-x}},\quad \tanh(x),\quad \operatorname{ReLU}(x)=\max(0,x),\quad \text{LeakyReLU}(x)=\max(\alpha x,x),\quad \text{GELU}(x)=x\,\Phi(x)
$$
$\Phi$ là hàm phân phối tích lũy của phân phối chuẩn tắc. Dạng $\max(\alpha x,x)$ ở trên giả định $0\le\alpha\le1$; định nghĩa tổng quát của Leaky ReLU là x khi x≥0 và αx khi x<0. Đạo hàm sigmoid: $\sigma'(x)=\sigma(x)(1-\sigma(x))$, lớn nhất là $0.25$ tại $x=0$. Đây chỉ là một yếu tố trong gradient toàn mạng. ReLU có đạo hàm 1 khi $x>0$ và 0 khi $x<0$; một đầu vào âm riêng lẻ chưa đủ để kết luận neuron đã “chết”.

## Ví dụ từng bước
$\sigma(0)=0.5$; $\tanh(1)\approx0.7616$; $\operatorname{ReLU}(-2)=0$; $\text{LeakyReLU}(-2)$ với $\alpha=0.01$ là $-0.02$; $\text{GELU}(1)=1\cdot\Phi(1)\approx0.8413$.

## Đọc giá trị hàm và độ dốc cùng một lúc

Đầu ra activation là giá trị forward; đạo hàm quyết định cách gradient backward đi qua điểm đang xét. Hai đại lượng không cùng ý nghĩa. Tại x=0, sigmoid cho đầu ra 0.5 nhưng đạo hàm 0.25. Tại x=−2, Leaky ReLU với α=0.01 cho đầu ra −0.02 và đạo hàm **dương** 0.01: đầu ra âm không có nghĩa độ dốc âm.

```neuralclone
activation
```

Chọn một trong bốn hàm rồi đổi x. Hình là activation chứ không phải đường cong loss hay chất lượng mô hình; điểm đang chọn, bảng và output đều lấy từ `activation(x,kind,alpha)`. Tại x=−2: sigmoid≈0.119203 với đạo hàm≈0.104994; tanh≈−0.964028 với đạo hàm≈0.070651; ReLU bằng 0 với đạo hàm 0; Leaky ReLU α=0.01 bằng −0.02 với đạo hàm 0.01. Thí nghiệm không vẽ GELU; giá trị GELU trong ví dụ trước dùng định nghĩa chính xác $x\Phi(x)$, không thay bằng x·sigmoid(x).

Nếu gradient từ phía sau là g=3, chain rule cho $\partial L/\partial x=g\,f'(x)$. Ở điểm Leaky ReLU vừa nêu, gradient vào là 0.03, không phải −0.06. Nhân với giá trị forward là một lỗi hay gặp. [CS231n, Commonly used activation functions](https://cs231n.github.io/neural-networks-1/#commonly-used-activation-functions) giải thích vai trò đạo hàm cục bộ; các khuyến nghị lịch sử trong ghi chú đó không phải lệnh cấm sigmoid cho mọi đầu ra hiện đại.

## Điểm gãy và quy ước của implementation

ReLU không có đạo hàm cổ điển tại 0 vì độ dốc hai phía là 0 và 1. Thí nghiệm chọn giá trị backward 0 ở đó, giống quy ước đã giải thích trong [Backpropagation](/learn/backpropagation). Không gọi sai phân trung tâm tại điểm gãy là “đáp án đúng” để buộc implementation khớp: với ReLU, phép sai phân ấy cho 0.5 dù đạo hàm cổ điển không tồn tại.

Với Leaky ReLU, thí nghiệm giới hạn α∈[0,1] và chọn backward α tại 0. Nếu α=1, hàm trở thành identity, đạo hàm bằng 1 cả tại 0, nên không còn điểm gãy. [Định nghĩa LeakyReLU của PyTorch](https://docs.pytorch.org/docs/2.15/generated/torch.nn.LeakyReLU.html) viết bằng hai nhánh; cách viết này tránh áp dụng sai dạng max khi α ngoài miền giả định.

## Vì sao một activation chưa giải thích được cả mạng?

Nếu ghép mười sigmoid với các hệ số tuyến tính bằng 1, riêng tích các đạo hàm activation bị chặn bởi $(1/4)^{10}$. Nếu giữa các sigmoid còn nhân trọng số, chain rule cũng nhân các trọng số đó. Ví dụ một lớp $a=\sigma(10x)$ tại x=0 có đạo hàm theo x bằng $10\times0.25=2.5$, lớn hơn 0.25 mà không mâu thuẫn với chặn đạo hàm **theo đầu vào của sigmoid**. Phải nói rõ biến đang lấy đạo hàm.

Neuron ReLU bị chặn trên một mẫu có thể vẫn hoạt động trên mẫu khác. “Chết” thường chỉ tình huống preactivation âm trên toàn miền dữ liệu đang học, làm nhánh đó không nhận gradient qua activation. Leaky ReLU giữ một đường gradient phía âm nhưng không tự khắc phục dữ liệu sai, learning rate quá lớn hoặc mọi vấn đề của mạng sâu.

Tự kiểm tra: f(x)<0 có buộc f′(x)<0 không? **Không**, Leaky ReLU tại −2 là phản ví dụ. Nếu α=1, thay x từ −1 sang 1 có làm thay độ dốc không? **Không**, cả hai phía có độ dốc 1. Một neuron ReLU có output 0 ở một mẫu có chắc đã chết không? **Không**, cần xét các mẫu và miền dữ liệu khác.

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
