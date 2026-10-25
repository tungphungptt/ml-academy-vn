**Cấp độ:** Intermediate · **Tiên quyết:** Perceptron, Logistic Regression.
**Mục tiêu:** hiểu forward pass của MLP và tensor shape.

## Vấn đề thực tế
Perceptron không giải được XOR. Xếp nhiều lớp có hàm kích hoạt phi tuyến cho phép học ranh giới phức tạp.

## Công thức
$$\mathbf h=\phi(\mathbf x W_1+\mathbf b_1),\qquad \hat y=\mathbf h W_2+\mathbf b_2$$
$\mathbf x$ có shape $(N,D)$, $W_1$ có shape $(D,H)$, $\mathbf h$ có shape $(N,H)$, $W_2$ có shape $(H,K)$. $\phi$ là hàm kích hoạt (ReLU: $\max(0,z)$). Không có $\phi$ thì nhiều lớp tuyến tính chỉ tương đương một lớp.

![Sơ đồ mạng MLP 2-3-1](/img/mlp.svg)

## Ví dụ từng bước
$x=(1,2)$, $W_1=\begin{pmatrix}1&0&-1\\0&1&1\end{pmatrix}$: $xW_1=(1,2,1)$; ReLU giữ nguyên. Với $W_2=(1,1,1)^\top$, $b=0$: $\hat y=1+2+1=4$.

## Code và cách chạy
Bài **MLP PyTorch (XOR)** trong Code Lab (`labs/mlp_torch/library.py`) minh họa forward, loss, backward, optimizer. Cần PyTorch nên chạy local (`pip install torch`); mình chưa chạy được file này nên chưa có kết quả kỳ vọng đã xác minh.

## Lỗi thường gặp
Sai shape giữa các lớp; quên hàm kích hoạt phi tuyến; learning rate quá lớn.

## Ưu điểm, hạn chế
Xấp xỉ được hàm phức tạp; cần nhiều dữ liệu, khó diễn giải, nhiều siêu tham số.

## Bài tập
1. (Dễ) Tính $\hat y$ với $x=(2,0)$. 2. (Vừa) Đổi số neuron ẩn và quan sát loss. 3. (Khó) Thêm một lớp ẩn và ghi lại shape từng tensor.

## Tóm tắt
MLP = các lớp tuyến tính xen kẽ hàm kích hoạt phi tuyến.
