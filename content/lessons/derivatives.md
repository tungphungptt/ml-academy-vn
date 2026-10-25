**Cấp độ:** Beginner · **Tiên quyết:** hàm số, đại số cơ bản.
**Mục tiêu:** hiểu đạo hàm, gradient, chain rule và kiểm tra bằng sai phân số học.

## Vấn đề thực tế
Huấn luyện mô hình cần biết thay đổi nhỏ của tham số làm hàm mất mát thay đổi bao nhiêu: đó là đạo hàm.

## Công thức
$$f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h},\qquad \nabla f=\Big(\frac{\partial f}{\partial x_1},\dots,\frac{\partial f}{\partial x_n}\Big),\qquad \frac{d}{dx}f(g(x))=f'(g(x))\,g'(x)$$
Gradient chỉ hướng làm $f$ tăng nhanh nhất. Chain rule là nền tảng của backpropagation.

![Tiếp tuyến của parabol](/img/derivatives.svg)

## Ví dụ từng bước
$f(x)=x^2\Rightarrow f'(x)=2x$. Với $f(g)=g^2,\ g=3x+1$: $\frac{d}{dx}=2(3x+1)\cdot3$, tại $x=1$ bằng $24$. Với $f(x,y)=x^2+3y$ tại $(1,2)$: $\nabla f=(2x,3)=(2,3)$.

## Code và cách chạy
```python
f = lambda t: (3 * t + 1) ** 2
h = 1e-5
print(round((f(1 + h) - f(1 - h)) / (2 * h), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `24.0`.

## Lỗi thường gặp
Quên nhân $g'(x)$ trong chain rule; chọn $h$ quá nhỏ gây sai số làm tròn; nhầm đạo hàm riêng với đạo hàm toàn phần.

## Ưu điểm, hạn chế của kiểm tra số học
Sai phân trung tâm có sai số $O(h^2)$, dùng để kiểm tra gradient tự tính nhưng chậm với nhiều tham số.

## Bài tập
1. (Dễ) Đạo hàm của $x^3$ tại $x=2$. 2. (Vừa) Tính $\nabla f$ của $f=x^2y$ tại $(1,2)$. 3. (Khó) Dùng chain rule tính đạo hàm của $\sigma(wx+b)$ theo $w$.

## Tóm tắt
Đạo hàm đo độ nhạy; gradient gom các đạo hàm riêng; chain rule nối các lớp tính toán.
