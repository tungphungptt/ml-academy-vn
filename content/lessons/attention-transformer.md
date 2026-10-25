**Cấp độ:** Advanced · **Tiên quyết:** MLP, softmax, nhân ma trận.
**Mục tiêu:** hiểu scaled dot-product attention. Bài này tập trung vào attention; multi-head và positional encoding chỉ được giới thiệu ngắn.

## Vấn đề thực tế
RNN xử lý tuần tự và khó nhớ phụ thuộc xa. Attention cho mỗi phần tử "nhìn" trực tiếp vào mọi phần tử khác và quyết định cần chú ý bao nhiêu.

## Công thức
$$\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$
$Q$ (query) là thứ đang cần tìm, $K$ (key) là nhãn của từng phần tử, $V$ (value) là nội dung được lấy ra, $d_k$ là chiều của key; chia cho $\sqrt{d_k}$ để tích vô hướng không quá lớn làm softmax bão hòa. Trong self-attention, $Q,K,V$ cùng được tính từ đầu vào. Transformer xếp nhiều lớp gồm multi-head attention và mạng feed-forward, cùng kết nối tắt và chuẩn hóa (Vaswani và cộng sự, 2017).

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
