**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Vector và ma trận.
**Mục tiêu:** hiểu đạo hàm, gradient, chain rule và kiểm tra bằng sai phân số học.

## Vấn đề thực tế
Huấn luyện mô hình cần biết thay đổi nhỏ của tham số làm hàm mất mát thay đổi bao nhiêu: đó là đạo hàm.

## Công thức
$$
f'(x)=\lim_{h\to0}\frac{f(x+h)-f(x)}{h},\qquad \nabla f=\Big(\frac{\partial f}{\partial x_1},\dots,\frac{\partial f}{\partial x_n}\Big),\qquad \frac{d}{dx}f(g(x))=f'(g(x))\,g'(x)
$$
Với chuẩn Euclid và gradient khác 0, gradient chỉ hướng tăng nhanh nhất tại chỗ. Chain rule là nền tảng của backpropagation.

![Tiếp tuyến của parabol](/img/derivatives.svg)

## Ví dụ từng bước
$f(x)=x^2\Rightarrow f'(x)=2x$. Với $f(g)=g^2,\ g=3x+1$: $\frac{d}{dx}=2(3x+1)\cdot3$, tại $x=1$ bằng $24$. Với $f(x,y)=x^2+3y$ tại $(1,2)$: $\nabla f=(2x,3)=(2,3)$.


## Đọc độ nhạy từ một phép thay đổi nhỏ

Bạn cần phân biệt ba câu hỏi: hàm đang có giá trị bao nhiêu, nó thay đổi bao nhiêu khi dịch đầu vào một đoạn hữu hạn, và nó nhạy thế nào ngay tại điểm đang xét. Ba câu trả lời này lần lượt là $f(x)$, hiệu $f(x+h)-f(x)$ và đạo hàm $f'(x)$. Đừng dùng giá trị loss để đoán gradient: hai vị trí có cùng loss vẫn có thể có gradient trái dấu.

Với $f(x)=x^2$, đặt $x=1$ và $h=0.5$. Ta có $f(1)=1$, $f(1.5)=2.25$, nên hiệu là $1.25$ nhưng độ dốc cát tuyến là $1.25/0.5=2.5$. Tiếp tuyến tại $x=1$ có độ dốc $2$. Khác biệt không phải lỗi code: cát tuyến nhìn một khoảng hữu hạn, còn tiếp tuyến mô tả biến thiên tại chỗ.

Tự khai triển, không cần nhớ máy móc:

$$
\frac{(x+h)^2-x^2}{h}=2x+h,\qquad
\frac{(x+h)^2-(x-h)^2}{2h}=2x.
$$

Sai phân trung tâm trả đúng đạo hàm của đa thức bậc hai trong số học chính xác, kể cả khi $h$ chưa nhỏ. Đây **không** phải tính chất của mọi hàm. Độ chính xác $O(h^2)$ thường nêu cho sai phân trung tâm cần hàm đủ trơn quanh điểm xét; trong máy tính còn có sai số làm tròn. [CS231n, Computing the gradient](https://cs231n.github.io/optimization-1/#computing-the-gradient) giải thích đánh đổi này. Với $h=0$ phép chia không xác định, vì thế thí nghiệm từ chối giá trị đó.

## Thí nghiệm đạo hàm gắn với code

```neuralclone
derivative
```

Hãy giữ $x=1$, đưa $h$ từ 0.5 xuống 0.01: sai phân tiến đi từ 2.5 xuống 2.01; sai phân trung tâm gần 2. Sau đó đặt $x=-1$: đạo hàm thành −2 dù giá trị hàm vẫn bằng 1. Chấm đánh dấu là điểm đang xét, nét đứt nối hai điểm đo, đường cam là tiếp tuyến. Bảng là phương án đọc đầy đủ nếu không nhìn hình.

Trong “Xem code”, `quadratic` tạo `value`, `plus`, `minus` rồi tính ba độ dốc. Đó cũng là các biến dùng để vẽ hình. Python tải về dùng hàm cùng tên: `quadratic(1, .5)` cho `value=1`, `plus=2.25`, `minus=0.25`, `forward=2.5`, `central=2`, `derivative=2`. Không có thuật toán học hay dữ liệu ngẫu nhiên ở đây.

## Từ đạo hàm một biến đến chain rule

Đặt $u=3x+1$, $z=u^2$. Tại $x=1$, forward cho $u=4,z=16$. Nếu dịch x rất nhỏ một lượng $\Delta x$, u đổi xấp xỉ $3\Delta x$; z đổi xấp xỉ $2u\cdot3\Delta x=24\Delta x$. Vì vậy phải nhân cả hai độ nhạy, không dừng ở $2u=8$. [CS231n, Compound expressions](https://cs231n.github.io/optimization-2/#compound-expressions-with-chain-rule) trình bày cách nối các đạo hàm cục bộ.

Trong nhiều biến, đạo hàm riêng giữ các biến còn lại cố định. Gradient là vector các đạo hàm riêng của **một đầu ra vô hướng**. Với chuẩn Euclid và gradient khác 0, hướng đơn vị tăng nhanh nhất tại chỗ là $\nabla f/\|\nabla f\|_2$; bước dài theo hướng ấy không được bảo đảm còn tăng nhanh nhất. Nếu gradient bằng 0, kết luận về một hướng duy nhất không còn áp dụng.

Tự kiểm tra: (1) $x=-1,h=.5$ cho sai phân tiến bao nhiêu? (2) Tại sao giảm h không đổi kết quả lý thuyết của sai phân trung tâm trong ví dụ này? (3) Tại sao đáp án 8 cho chain rule ở trên sai? Đáp án: −1.5; hai hạng bậc hai đối xứng triệt tiêu; 8 quên nhân đạo hàm của u theo x bằng 3. Chuyển sang [hồi quy](/learn/linear-regression) để thấy độ nhạy theo từng tham số, rồi [backpropagation](/learn/backpropagation) để nối nhiều phép tính.

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
Khi hàm đủ trơn quanh điểm xét, sai phân trung tâm có sai số cắt cụt $O(h^2)$, dùng để kiểm tra gradient tự tính nhưng chậm với nhiều tham số.

## Bài tập
1. (Dễ) Đạo hàm của $x^3$ tại $x=2$. 2. (Vừa) Tính $\nabla f$ của $f=x^2y$ tại $(1,2)$. 3. (Khó) Dùng chain rule tính đạo hàm của $\sigma(wx+b)$ theo $w$.

## Tóm tắt
Đạo hàm đo độ nhạy; gradient gom các đạo hàm riêng; chain rule nối các lớp tính toán.

## Điều kiện áp dụng và kiểm tra kết luận
Với hàm vector, đạo hàm là Jacobian; gradient thường dành cho hàm vô hướng theo nhiều đầu vào. Chain rule nhiều biến nhân các Jacobian theo thứ tự phù hợp với convention hàng/cột, không phải nhân mọi số không xét shape. Kiểm tra sai phân trung tâm từng tham số có chi phí tỷ lệ số chiều, nên chỉ dùng mạng nhỏ. Tránh điểm gãy như ReLU tại 0 khi so với đạo hàm cổ điển. Chọn epsilon phải cân bằng sai số cắt cụt và làm tròn; số nhỏ hơn không luôn chính xác hơn.

## Đáp án và tiêu chí chấm
1. Đạo hàm của $x^3$ là $3x^2$, tại $x=2$ bằng 12. (2 điểm).
2. Với $f=x^2y$, $\nabla f=(2xy,x^2)$, tại $(1,2)$ là $(4,1)$. (3 điểm).
3. Đặt $z=wx+b$: $\partial\sigma(z)/\partial w=\sigma(z)(1-\sigma(z))x$. Nêu rõ giữ x,b cố định khi lấy đạo hàm theo w và kiểm tra một giá trị hữu hạn bằng sai phân. (5 điểm).

## Nguồn tham khảo
- [Stanford CS231n: Optimization (gradient và chain rule)](https://cs231n.github.io/optimization-1/).

## Nguồn cho phần thí nghiệm và đào sâu

- [CS231n: Optimization (part 1)](https://cs231n.github.io/optimization-1/) — Stanford CS231n course notes. Phần đã đọc: Computing the gradient numerically with finite differences, Effect of step size, Gradient descent. Truy cập 28/10/2026.
- [CS231n: Backpropagation, Intuitions](https://cs231n.github.io/optimization-2/) — Stanford CS231n course notes. Phần đã đọc: Simple expressions and interpretation of the gradient, Compound expressions with chain rule, Intuitive understanding of backpropagation. Truy cập 28/10/2026.
