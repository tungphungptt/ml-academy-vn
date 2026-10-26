**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Perceptron, Activation Functions.
**Mục tiêu:** hiểu forward pass của MLP và tensor shape.

## Vấn đề thực tế
Perceptron không giải được XOR. Xếp nhiều lớp có hàm kích hoạt phi tuyến cho phép học ranh giới phức tạp.

## Công thức
$$
\mathbf h=\phi(\mathbf x W_1+\mathbf b_1),\qquad \hat y=\mathbf h W_2+\mathbf b_2
$$
$\mathbf x$ có shape $(N,D)$, $W_1$ có shape $(D,H)$, $\mathbf h$ có shape $(N,H)$, $W_2$ có shape $(H,K)$. $\phi$ là hàm kích hoạt (ReLU: $\max(0,z)$). Không có $\phi$ thì nhiều lớp tuyến tính chỉ tương đương một lớp.

![Sơ đồ mạng MLP 2-3-1](/img/mlp.svg)

## Ví dụ từng bước
$x=(1,2)$, $W_1=\begin{pmatrix}1&0&-1\\0&1&1\end{pmatrix}$: $xW_1=(1,2,1)$; ReLU giữ nguyên. Với $W_2=(1,1,1)^\top$, $b=0$: $\hat y=1+2+1=4$.

## Code và cách chạy
Bài **MLP PyTorch (XOR)** trong Code Lab (`labs/mlp_torch/library.py`) minh họa forward, loss, backward, optimizer. Cần PyTorch nên chạy local (`pip install torch`); đã kiểm tra trên PyTorch 2.14.1+cpu: `loss=0.0002 pred=[0, 1, 1, 0]`. Đây là fit bốn điểm XOR, không phải test generalization.

## Lỗi thường gặp
Sai shape giữa các lớp; quên hàm kích hoạt phi tuyến; learning rate quá lớn.

## Ưu điểm, hạn chế
Xấp xỉ được hàm phức tạp; cần nhiều dữ liệu, khó diễn giải, nhiều siêu tham số.

## Bài tập
1. (Dễ) Tính $\hat y$ với $x=(2,0)$. 2. (Vừa) Đổi số neuron ẩn và quan sát loss. 3. (Khó) Thêm một lớp ẩn và ghi lại shape từng tensor.

## Tóm tắt
MLP = các lớp tuyến tính xen kẽ hàm kích hoạt phi tuyến.

## Điều kiện áp dụng và kiểm tra kết luận
Đầu vào mỗi hàng là mẫu; các lớp tuyến tính xen phi tuyến học các feature trung gian. Với multiclass, head xuất logits K chiều và loss CE; binary có thể dùng một logit+BCEWithLogitsLoss. Universal approximation là kết quả tồn tại trong các điều kiện thích hợp, không nói một mạng nhỏ/lần SGD sẽ tìm ra hàm tốt với ít dữ liệu. XOR trong lab là kiểm tra biểu diễn/huấn luyện trên bốn điểm, không phải một test generalization có ý nghĩa. Có thể tái lập loss/prediction của lab CPU, nhưng không xem train accuracy 1.0 là chứng minh mạng đã giải mọi bài toán phi tuyến.

## Đáp án và tiêu chí chấm
1. $x=(2,0)$ cho hidden trước activation $(2,0,-2)$, ReLU thành $(2,0,0)$, đầu ra $\hat y=2$. (2 điểm).
2. Ghi seed, loss, hidden width và số update. Quan sát hội tụ trên XOR, không chọn hidden width dựa trên một tập test chưa được định nghĩa. (3 điểm).
3. Ví dụ $D\to H_1\to H_2\to K$ cho batch $N$ có shape $(N,H_1)$, $(N,H_2)$, $(N,K)$; số tham số mỗi Linear là $d_{\mathrm{in}}d_{\mathrm{out}}+d_{\mathrm{out}}$. Cần activation giữa cả hai lớp ẩn. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Multilayer Perceptrons](https://d2l.ai/chapter_multilayer-perceptrons/index.html).
