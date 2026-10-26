**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** MLP, Backpropagation.
**Mục tiêu:** hiểu trạng thái ẩn của RNN và cổng của LSTM.

## Vấn đề thực tế
Dữ liệu chuỗi (văn bản, chuỗi thời gian) có thứ tự và độ dài thay đổi. Mạng cần "bộ nhớ" về các phần tử trước.

## Công thức
RNN: $h_t=\tanh(W_h h_{t-1}+W_x x_t+b)$, cùng trọng số dùng ở mọi bước. Khi lan truyền ngược qua nhiều bước, gradient bị nhân nhiều lần nên dễ biến mất hoặc bùng nổ. LSTM thêm ô nhớ $c_t$ và các cổng $f_t,i_t,o_t\in(0,1)$:
$$
c_t=f_t\odot c_{t-1}+i_t\odot g_t,\qquad h_t=o_t\odot\tanh(c_t)
$$
$f_t$ (cổng quên) quyết định giữ bao nhiêu $c_{t-1}$, $i_t$ (cổng vào) quyết định ghi bao nhiêu thông tin mới $g_t$, $\odot$ là nhân từng phần tử. GRU là biến thể gọn hơn.

![RNN trải theo thời gian](/img/rnn-lstm.svg)

## Ví dụ từng bước
RNN vô hướng $W_h=0.5,W_x=1,b=0$, đầu vào $[1,-1]$, $h_0=0$: $h_1=\tanh(1)\approx0.7616$; $h_2=\tanh(0.5\cdot0.7616-1)\approx-0.5506$. LSTM: $f=0.9,c_{t-1}=2,i=0.5,g=0.4\Rightarrow c_t=1.8+0.2=2.0$.

## Code và cách chạy
```python
import numpy as np
h = 0.0; hs = []
for x in [1.0, -1.0]:
    h = np.tanh(0.5 * h + 1.0 * x)
    hs.append(round(float(h), 4))
print(hs)
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.7616, -0.5506]`.

## Lỗi thường gặp
Quên cắt gradient (gradient clipping) khi huấn luyện chuỗi dài; không xử lý padding trong batch có độ dài khác nhau.

## Ưu điểm, hạn chế
LSTM nhớ phụ thuộc xa tốt hơn RNN thuần. Xử lý tuần tự nên khó song song hóa; Transformer thay thế phần lớn ứng dụng NLP hiện nay.

## Bài tập
1. (Dễ) Tính $h_3$ với $x_3=0.5$. 2. (Vừa) Tính $c_t$ khi $f=0.2$. 3. (Khó) Cài một bước LSTM bằng NumPy với shape rõ ràng.

## Tóm tắt
RNN truyền trạng thái ẩn theo thời gian; LSTM dùng cổng để kiểm soát việc nhớ và quên.

## Điều kiện áp dụng và kiểm tra kết luận
BPTT unroll graph theo thời gian với trọng số dùng chung; gradient là tổng đóng góp từ các bước. LSTM có đường cell giúp truyền thông tin, không bảo đảm nhớ vô hạn khi forget gate nhỏ. GRU dùng reset $r_t$ và update $z_t$, ví dụ một quy ước dùng vector hàng:

$$
\begin{aligned}\tilde h_t&=\tanh\!\left(x_tW_x+(r_t\odot h_{t-1})W_h+b\right),\\h_t&=z_t\odot h_{t-1}+(1-z_t)\odot\tilde h_t.\end{aligned}
$$
Cần nêu convention: PyTorch đặt reset lên hạng tuyến tính hidden trong candidate theo cách có thể khác vị trí phép nhân ở công thức trên, nên không so trực tiếp từng weight khi tự cài. Padding phải được mask/packed hoặc dùng length hợp lệ. [Lab GRU CPU](/learn/sequence-models-cpu) cho dự báo một bước với split theo thời gian.

## Đáp án và tiêu chí chấm
1. Tính từ giá trị chưa làm tròn: $h_3=\tanh(0.5h_2+0.5)\approx0.2210$. (2 điểm).
2. Khi $f=0.2$, $c_{t-1}=2,i=0.5,g=0.4$: $c_t=0.4+0.2=0.6$. (3 điểm).
3. Khai báo shape x,h,c và bốn cổng, sigmoid cho f/i/o, tanh cho candidate; kiểm tra từng phép nhân và output với batch nhỏ. Không quên state c khác state h. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Recurrent Neural Networks](https://d2l.ai/chapter_recurrent-neural-networks/index.html).
- [Dive into Deep Learning: Modern RNNs](https://d2l.ai/chapter_recurrent-modern/index.html).
