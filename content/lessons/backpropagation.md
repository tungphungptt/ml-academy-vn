**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** MLP, Đạo hàm và gradient.
**Mục tiêu:** tính gradient qua mạng bằng chain rule.

## Vấn đề thực tế
Mạng có hàng triệu tham số cần gradient của loss theo từng tham số. Backpropagation tính tất cả chỉ với một lượt đi ngược, tái sử dụng kết quả trung gian.

## Công thức
Với $L=\tfrac12(\hat y-t)^2$, $\hat y=w_2h$, $h=\operatorname{ReLU}(a)$, $a=w_1x$:
$$
\frac{\partial L}{\partial w_1}=\frac{\partial L}{\partial \hat y}\cdot\frac{\partial \hat y}{\partial h}\cdot\frac{\partial h}{\partial a}\cdot\frac{\partial a}{\partial w_1}=(\hat y-t)\cdot w_2\cdot\mathbb 1[a>0]\cdot x
$$

![Đồ thị tính toán forward và backward](/img/backpropagation.svg)

## Ví dụ từng bước
$x=1,w_1=2,w_2=3,t=5$. Forward: $a=2,h=2,\hat y=6,L=0.5$. Backward: $\partial L/\partial\hat y=1$; $\partial L/\partial w_2=1\cdot h=2$; $\partial L/\partial h=1\cdot w_2=3$; vì $a>0$, $\partial L/\partial w_1=3\cdot1\cdot x=3$. Kiểm tra bằng sai phân số học cho $3.0$ và $2.0$, khớp.


## Forward lưu gì, backward dùng lại điều gì?

Mục tiêu là tự tính được hai gradient, chỉ rõ nguồn gốc mỗi thừa số và nhận ra khi nào phép kiểm tra bằng sai phân không thích hợp. Cần hiểu [đạo hàm và chain rule](/learn/derivatives), phép nhân vô hướng, cùng [MLP](/learn/mlp). Mạng minh họa có một đầu vào, một neuron ReLU, một đầu ra tuyến tính; không có bias để giữ phép tính ngắn.

Biến x là đầu vào giữ cố định; t là target giữ cố định; w₁,w₂ là hai tham số cần đạo hàm. a là giá trị trước activation, h là activation, ŷ là dự đoán, e=ŷ−t là residual. Loss dùng **nửa bình phương** của một mẫu, khác MSE trung bình không có 1/2 trong bài hồi quy.

Tại x=1, w₁=2, w₂=3, t=5: a=2, h=2, ŷ=6, e=1, L=0.5. Backward bắt đầu với $\partial L/\partial L=1$:

1. Qua bình phương: $\partial L/\partial\hat y=e=1$.
2. Qua phép nhân w₂h: gradient tới w₂ bằng $e h=2$; gradient tới h bằng $e w_2=3$.
3. Qua ReLU đang hoạt động: $\partial h/\partial a=1$, nên gradient tới a bằng 3.
4. Qua w₁x: gradient tới w₁ bằng $3x=3$.

“Gradient tới h” và “đạo hàm cục bộ của h theo a” là hai đại lượng khác nhau; nhân chúng mới được gradient tới a. [CS231n: Backpropagation](https://cs231n.github.io/optimization-2/) giải thích luồng đạo hàm cục bộ này. Nếu một giá trị đi vào nhiều nhánh rồi nhập lại, phải **cộng** đóng góp từ các nhánh, không chỉ chọn một đường.

## Chọn nút, sửa trọng số, kiểm tra lại

```neuralclone
backprop
```

Chọn “Nút h” để nối `dh=error*w2` với `gate` và `da=dh*gate`; chọn “Nút a” để xem `dw1=da*x`. Các nút chọn có thể thao tác bằng Tab/Enter; không cần kéo cạnh nhỏ. Bảng và output vẫn trình bày đủ số khi không nhìn SVG. Đây là forward/backward của một mạng cố định, **chưa có bước optimizer**.

Thử ba tình huống có đáp án biết trước. Đổi t=6: e=0 nên loss và cả hai gradient bằng 0. Đặt lại rồi đổi w₁=−2: a<0, h=0, ŷ=0, L=12.5; gradient tới h là −15 nhưng gate=0 nên gradient theo w₁ bằng 0, và gradient theo w₂ cũng bằng 0 vì h=0. Loss lớn không đồng nghĩa mọi tham số đều nhận gradient lớn.

Đổi w₁=0: a=0 là điểm gãy. Minh họa chọn gate=0, phù hợp quy ước đạo hàm của ReLU trong PyTorch; đó không phải khẳng định hàm ReLU có đạo hàm cổ điển ở 0. [Autograd mechanics, gradients for non-differentiable functions](https://docs.pytorch.org/docs/2.14/notes/autograd.html#gradients-for-non-differentiable-functions) mô tả quy tắc của framework. Không suy quy tắc của mọi toán tử max từ riêng ReLU.

## Đào sâu: kiểm tra gradient mà không nhầm với huấn luyện

Với epsilon=10⁻⁵, tính loss tại w₁+epsilon và w₁−epsilon, giữ w₂,x,t cố định, rồi chia hiệu cho 2epsilon. Ở cấu hình mặc định kết quả gần 3; làm tương tự với w₂ được gần 2. Sai khác tuyệt đối và tương đối được kiểm tra trong test. Nếu perturbation đi qua điểm gãy a=0, phép sai phân trộn hai nhánh và không còn là kiểm tra đạo hàm cổ điển tại điểm ấy.

Python tải về chạy `backprop(1,2,3,5)` trả toàn bộ a,h,prediction,error,loss,dh,gate,da,dw1,dw2. `loss.backward()` trong PyTorch tính gradient; optimizer mới là phần sử dụng chúng để đổi tham số. Thay vì nghĩ backward “tự học”, hãy nối nó với [Gradient Descent](/learn/gradient-descent). Khi dùng batch, phải thống nhất sum/mean và hệ số 1/2 trước khi đối chiếu số.

Tự kiểm tra: đáp án 3 cho gradient w₂ đang nhầm với gradient h; đáp án 6 đang lấy dự đoán làm gradient. Với t=6, tại sao loss bằng 0 mà h vẫn bằng 2? Vì forward activation không phụ thuộc target; chỉ residual/loss/backward thay đổi. Quiz bên dưới giữ câu hỏi và định danh cũ, bổ sung giải thích để phân biệt các nhầm lẫn này.

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

## Điều kiện áp dụng và kiểm tra kết luận
Backprop là reverse-mode differentiation của đồ thị tính toán, không phải phép lấy sai phân từng trọng số. Đạo hàm từ nhiều nhánh được cộng ở nút dùng chung; theo từng đường, Jacobian nhân với adjoint. Công thức được viết theo scalar để tránh nhầm transpose; khi vector hóa cần kiểm tra convention hàng/cột và broadcast bias.

ReLU không khả vi tại 0, framework chọn một subgradient theo quy ước; finite-difference test nên tránh điểm gãy. Nhớ chia loss theo batch cùng convention trước khi so gradient tự cài với framework.

## Đáp án và tiêu chí chấm
1. Nếu $t=6$ thì $\hat y-t=0$, $L=0$ và cả hai gradient theo $w_1,w_2$ đều bằng 0. (2 điểm).
2. Đặt epsilon vừa phải, tính sai phân mỗi trọng số trên cùng input; so sai số tuyệt đối lẫn tương đối. Không yêu cầu bitwise bằng nhau và không kiểm tra đúng tại ReLU 0. (3 điểm).
3. Tính delta lớp cuối, truyền ngược delta qua W và đạo hàm activation; dW là activation trước chuyển vị nhân delta theo convention batch hàng. Trình bày shapes và tổng gradient qua bias, không chỉ gọi backward rồi nhận là đã suy ra. (5 điểm).

## Nguồn tham khảo
- [Stanford CS231n: Backpropagation](https://cs231n.github.io/optimization-2/).

## Nguồn cho phần thí nghiệm và đào sâu

- [CS231n: Backpropagation, Intuitions](https://cs231n.github.io/optimization-2/) — Stanford CS231n course notes. Phần đã đọc: Simple expressions and interpretation of the gradient, Compound expressions with chain rule, Intuitive understanding of backpropagation. Truy cập 28/10/2026.
- [Autograd mechanics — PyTorch 2.14 documentation](https://docs.pytorch.org/docs/2.14/notes/autograd.html) — PyTorch contributors. Phần đã đọc: Gradients for non-differentiable functions. Truy cập 28/10/2026.
