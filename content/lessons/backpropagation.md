**Cấp độ:** Intermediate · **Tiên quyết:** MLP, đạo hàm, chain rule.
**Mục tiêu:** tính gradient qua mạng bằng chain rule.

## Vấn đề thực tế
Mạng có hàng triệu tham số cần gradient của loss theo từng tham số. Backpropagation tính tất cả chỉ với một lượt đi ngược, tái sử dụng kết quả trung gian.

## Công thức
Với $L=\tfrac12(\hat y-t)^2$, $\hat y=w_2h$, $h=\operatorname{ReLU}(a)$, $a=w_1x$:
$$\frac{\partial L}{\partial w_1}=\frac{\partial L}{\partial \hat y}\cdot\frac{\partial \hat y}{\partial h}\cdot\frac{\partial h}{\partial a}\cdot\frac{\partial a}{\partial w_1}=(\hat y-t)\cdot w_2\cdot\mathbb 1[a>0]\cdot x$$

![Đồ thị tính toán forward và backward](/img/backpropagation.svg)

## Ví dụ từng bước
$x=1,w_1=2,w_2=3,t=5$. Forward: $a=2,h=2,\hat y=6,L=0.5$. Backward: $\partial L/\partial\hat y=1$; $\partial L/\partial w_2=1\cdot h=2$; $\partial L/\partial h=1\cdot w_2=3$; vì $a>0$, $\partial L/\partial w_1=3\cdot1\cdot x=3$. Kiểm tra bằng sai phân số học cho $3.0$ và $2.0$, khớp.

## Code và cách chạy
Trong PyTorch, `loss.backward()` thực hiện đúng quá trình này (autograd). Bài MLP PyTorch trong Code Lab dùng nó; chạy local.

## Lỗi thường gặp
Quên xóa gradient cũ (`opt.zero_grad()`); gradient biến mất/bùng nổ ở mạng sâu; sai dấu hoặc sai shape.

## Hạn chế
Cần lưu giá trị trung gian của forward pass nên tốn bộ nhớ. Luôn kiểm tra gradient bằng sai phân số học khi tự cài đặt.

## Bài tập
1. (Dễ) Tính lại với $t=6$. 2. (Vừa) Kiểm tra gradient bằng sai phân $\frac{L(w+\epsilon)-L(w-\epsilon)}{2\epsilon}$. 3. (Khó) Suy ra gradient cho mạng 2 lớp ẩn.

## Tóm tắt
Forward lưu giá trị, backward nhân dần các đạo hàm cục bộ theo chain rule.
