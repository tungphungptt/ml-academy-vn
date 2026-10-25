**Cấp độ:** Intermediate · **Tiên quyết:** MLP, ma trận.
**Mục tiêu:** hiểu phép tích chập, padding, stride, pooling và cách tính kích thước.

## Vấn đề thực tế
Ảnh 224×224×3 có hơn 150 nghìn giá trị; MLP nối đầy đủ cần quá nhiều tham số và bỏ qua cấu trúc không gian. CNN dùng bộ lọc nhỏ **chia sẻ trọng số** trượt trên ảnh.

## Công thức
Với đầu vào cạnh $n$, kernel $k$, padding $p$, stride $s$:
$$n_{\text{out}}=\left\lfloor\frac{n+2p-k}{s}\right\rfloor+1$$
Tham số của lớp conv: $k\cdot k\cdot C_{\text{in}}\cdot C_{\text{out}}+C_{\text{out}}$ (cộng bias). Max pooling lấy giá trị lớn nhất trong mỗi cửa sổ, giảm kích thước và tăng tính bất biến với dịch chuyển nhỏ. (Trong thực tế "convolution" của deep learning là cross-correlation, không lật kernel.)

![Hoạt ảnh phép tích chập](/img/conv.svg)

## Ví dụ từng bước
$n=5,k=3$: $p=0,s=1\Rightarrow3$; $p=1,s=1\Rightarrow5$; $p=0,s=2\Rightarrow2$. Conv $3\times3$ từ 1 lên 8 kênh: $3\cdot3\cdot1\cdot8+8=80$ tham số. Đầu vào $\begin{pmatrix}1&2&3\\4&5&6\\7&8&9\end{pmatrix}$, kernel $\begin{pmatrix}1&0\\0&-1\end{pmatrix}$: mỗi ô ra là $x_{i,j}-x_{i+1,j+1}=-4$.

## Code và cách chạy
```python
import numpy as np
x = np.arange(1, 10).reshape(3, 3); k = np.array([[1, 0], [0, -1]])
out = np.array([[(x[i:i+2, j:j+2] * k).sum() for j in range(2)] for i in range(2)])
print(out.tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `[[-4, -4], [-4, -4]]`.

## Lỗi thường gặp
Sai thứ tự shape: PyTorch dùng $(N,C,H,W)$; quên padding làm ảnh co dần; tính sai kích thước đầu vào của lớp fully connected cuối.

## Ưu điểm, hạn chế
Ít tham số, khai thác tính cục bộ, nền tảng của nhận dạng ảnh (xem Stanford CS231n). Cần nhiều dữ liệu và GPU để huấn luyện ảnh lớn; chưa có bài thực hành CNN chạy được trong Code Lab này (cần PyTorch).

## Bài tập
1. (Dễ) Tính $n_{\text{out}}$ với $n=7,k=3,p=1,s=2$. 2. (Vừa) Đếm tham số của conv $5\times5$ từ 3 lên 16 kênh. 3. (Khó) Cài max pooling $2\times2$ bằng NumPy.

## Tóm tắt
Tích chập dùng kernel chia sẻ trọng số; kích thước đầu ra tính bằng $\lfloor(n+2p-k)/s\rfloor+1$.
