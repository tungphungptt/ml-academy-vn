**Cấp độ:** Advanced · **Tầng:** Intermediate · **Tiên quyết:** Softmax Regression, MLP.
**Mục tiêu:** hiểu scaled dot-product attention. Bài này tập trung vào attention; multi-head và positional encoding chỉ được giới thiệu ngắn.

## Vấn đề thực tế
RNN xử lý tuần tự và khó nhớ phụ thuộc xa. Attention cho mỗi phần tử "nhìn" trực tiếp vào mọi phần tử khác và quyết định cần chú ý bao nhiêu.

## Công thức
$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V
$$
$Q$ chứa các vector truy vấn (query), $K$ chứa các vector khóa (key) để so mức liên quan, $V$ chứa các vector giá trị (value) được trộn theo trọng số. Key không phải nhãn lớp trong bài toán có giám sát.

Với $n_q$ truy vấn, $n_k$ khóa, $Q\in\mathbb R^{n_q\times d_k}$, $K\in\mathbb R^{n_k\times d_k}$ và $V\in\mathbb R^{n_k\times d_v}$. Ma trận điểm có shape $(n_q,n_k)$; softmax trên từng hàng tạo trọng số tổng bằng 1, rồi nhân $V$ cho đầu ra shape $(n_q,d_v)$.

Với các thành phần query/key độc lập, trung bình 0 và phương sai 1, phương sai tích vô hướng là $d_k$. Chia cho $\sqrt{d_k}$ đưa phương sai về gần 1, giảm nguy cơ softmax bão hòa; đây là lập luận theo giả định về scale, không chặn mọi đầu vào.

Trong self-attention, $Q,K,V$ cùng được tính từ đầu vào. Transformer xếp nhiều lớp gồm multi-head attention và mạng feed-forward, cùng kết nối tắt và chuẩn hóa (Vaswani và cộng sự, 2017).

![Trọng số attention](/img/attention.svg)

## Ví dụ từng bước
$d_k=2$, $q=(1,0)$, $k_1=(1,0)$, $k_2=(0,1)$. Điểm: $(1,0)/\sqrt2=(0.7071,0)$. Softmax: $(0.6698,0.3302)$. Với $V=\begin{pmatrix}1&2\\3&4\end{pmatrix}$, đầu ra là $0.6698\,v_1+0.3302\,v_2\approx(1.6605,\,2.6605)$.

## Code và cách chạy
```python
import numpy as np
q = np.array([1.0, 0.0]); K = np.array([[1.0, 0.0], [0.0, 1.0]]); V = np.array([[1.0, 2.0], [3.0, 4.0]])
s = K @ q / np.sqrt(2); w = np.exp(s) / np.exp(s).sum()
print(w.round(4).tolist(), (w @ V).round(4).tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.6698, 0.3302] [1.6605, 2.6605]`.

## Lỗi thường gặp
Quên che (mask) các vị trí tương lai khi sinh văn bản; quên chia cho $\sqrt{d_k}$; nhầm chiều khi nhân $QK^\top$.

## Ưu điểm, hạn chế
Song song hóa tốt, nắm phụ thuộc xa. Chi phí tính toán và bộ nhớ tăng theo bình phương độ dài chuỗi.

## Bài tập
1. (Dễ) Tính softmax của $(0,0)$. 2. (Vừa) Đổi $q=(0,1)$ và tính lại đầu ra. 3. (Khó) Cài self-attention cho chuỗi 4 phần tử với ma trận chiếu $W_Q,W_K,W_V$.

## Tóm tắt
Attention là trung bình có trọng số của các value, trọng số lấy từ độ tương đồng giữa query và key.

## Điều kiện áp dụng và kiểm tra kết luận
Attention có query từ nơi cần truy vấn, key/value từ nguồn; self-attention lấy cùng sequence làm nguồn, cross-attention có thể dùng decoder query và encoder key/value. Softmax theo chiều key để mỗi query có một phân phối trọng số. Mask logit bằng −inf trước softmax, không xóa trọng số sau rồi quên chuẩn hóa. Một hàng bị mask hết có thể tạo NaN; cần token/context hợp lệ. Attention không có position là permutation-equivariant: đổi thứ tự input đổi thứ tự output tương ứng, không phải output y nguyên. Bài này giảng cơ chế weighted retrieval; [kiến trúc Transformer](/learn/transformer-architecture) giảng ghép thành mô hình, không lặp lại như một thuật toán khác.

## Đáp án và tiêu chí chấm
1. $\operatorname{softmax}(0,0)=(0.5,0.5)$. (2 điểm).
2. $q=(0,1)$ cho trọng số $\approx(0.3302,0.6698)$, đầu ra $\approx(2.3395,3.3395)$, tổng trọng số $=1$. (3 điểm).
3. $X$ có shape $(4,d)$, $W_Q,W_K,W_V$ cho $Q,K,V$ cùng số token; logits shape $(4,4)$, softmax theo hàng, đầu ra shape $(4,d_v)$. Kiểm tra masked future weight 0 và không tạo hàng all-masked. (5 điểm).

## Nguồn tham khảo
- [Attention Is All You Need (Vaswani và cộng sự)](https://arxiv.org/abs/1706.03762).
- [Dive into Deep Learning: Attention and Transformers](https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html).
