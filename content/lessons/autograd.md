**Cấp độ:** Intermediate · **Tiên quyết:** Backpropagation, Đạo hàm và gradient.
**Mục tiêu:** hiểu automatic differentiation: xây đồ thị tính toán rồi lan truyền gradient ngược.

## Vấn đề thực tế
Tự suy ra gradient bằng tay cho mạng lớn là bất khả thi. Autograd ghi lại các phép toán khi tính tiến, rồi áp dụng chain rule tự động khi gọi `backward()`.

## Công thức và ý tưởng
Mỗi phép toán biết đạo hàm cục bộ của nó. Với $f=a\cdot b+c$: $\partial f/\partial a=b$, $\partial f/\partial b=a$, $\partial f/\partial c=1$. Khi một biến dùng nhiều lần, gradient được **cộng dồn**. Đi theo thứ tự đảo của sắp xếp topo, mỗi nút chuyển gradient của mình về các nút con.

![Đồ thị autograd cho f = a·b + c](/img/autograd.svg)

## Ví dụ từng bước
$a=2,\ b=-3,\ c=10$: $f=2\cdot(-3)+10=4$; gradient: $\partial f/\partial a=-3$, $\partial f/\partial b=2$, $\partial f/\partial c=1$.

## Code và cách chạy
Autograd tối giản tự cài đặt (chỉ cộng và nhân):
```python
class V:
    def __init__(s, v, ch=()):
        s.v, s.g, s.ch, s.bw = v, 0.0, ch, lambda: None
    def __add__(s, o):
        r = V(s.v + o.v, (s, o))
        def bw(): s.g += r.g; o.g += r.g
        r.bw = bw; return r
    def __mul__(s, o):
        r = V(s.v * o.v, (s, o))
        def bw(): s.g += o.v * r.g; o.g += s.v * r.g
        r.bw = bw; return r
    def backward(s):
        order, seen = [], set()
        def topo(n):
            if id(n) not in seen:
                seen.add(id(n))
                for c in n.ch: topo(c)
                order.append(n)
        topo(s); s.g = 1.0
        for n in reversed(order): n.bw()
a, b, c = V(2.0), V(-3.0), V(10.0); f = a * b + c; f.backward()
print(f.v, [a.g, b.g, c.g])
```
Kết quả kỳ vọng (đã chạy cục bộ): `4.0 [-3.0, 2.0, 1.0]`.

Tương đương trong PyTorch (**chưa được chạy trong môi trường phát triển**, cần `pip install torch`): 
```python
import torch
a = torch.tensor(2.0, requires_grad=True); b = torch.tensor(-3.0, requires_grad=True); c = torch.tensor(10.0, requires_grad=True)
f = a * b + c; f.backward(); print(f.item(), a.grad.item(), b.grad.item(), c.grad.item())
```

## Lỗi thường gặp
Quên `zero_grad()` nên gradient cộng dồn qua các bước; gọi `backward()` hai lần trên cùng đồ thị; dùng `.detach()` hoặc `no_grad()` sai chỗ khi suy luận.

## Ưu điểm, hạn chế
Chính xác tới sai số số học (khác sai phân số học), tổng quát cho mọi phép toán khả vi. Tốn bộ nhớ để lưu giá trị trung gian.

## Bài tập
1. (Dễ) Tính tay gradient của $f=a\cdot b$ tại $a=3,b=4$. 2. (Vừa) Thêm phép trừ cho lớp `V`. 3. (Khó) Thêm `tanh` và kiểm tra bằng sai phân số học.

## Tóm tắt
Autograd ghi đồ thị tính toán và áp dụng chain rule ngược; gradient của biến dùng nhiều lần được cộng dồn.
