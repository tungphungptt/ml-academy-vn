**Cấp độ:** Intermediate · **Tiên quyết:** Vector và ma trận, KNN.
**Mục tiêu:** hiểu collaborative filtering dựa trên người dùng.

## Vấn đề thực tế
Gợi ý phim, sản phẩm: ta có ma trận đánh giá người dùng × mục, phần lớn ô bị trống, và cần dự đoán các ô trống.

## Công thức
Collaborative filtering theo người dùng: tính độ tương đồng giữa hai người dùng trên các mục họ cùng đánh giá (ví dụ cosine), rồi dự đoán đánh giá của người dùng $u$ cho mục $i$ bằng trung bình có trọng số từ những người tương tự đã đánh giá $i$:
$$\hat r_{ui}=\frac{\sum_{v}\operatorname{sim}(u,v)\,r_{vi}}{\sum_{v}\operatorname{sim}(u,v)}$$
Content-based filtering thì dùng đặc trưng của mục thay vì hành vi của người dùng khác.

![Dự đoán đánh giá còn thiếu](/img/recommendation.svg)

## Ví dụ từng bước
Ba người dùng, mục 1 và 2 cả ba đều đánh giá: $u_1=(5,4)$, $u_2=(4,5)$, $u_3=(1,2)$. Mục 3: $u_2$ cho 2, $u_3$ cho 5, $u_1$ chưa đánh giá. $\operatorname{sim}(u_1,u_2)=40/41\approx0.9756$, $\operatorname{sim}(u_1,u_3)=13/\sqrt{41\cdot5}\approx0.908$. Dự đoán: $\frac{0.9756\cdot2+0.908\cdot5}{0.9756+0.908}\approx3.446$.

## Code và cách chạy
```python
import numpy as np
u = np.array([[5, 4], [4, 5], [1, 2]], float)
cs = lambda a, b: a @ b / np.linalg.norm(a) / np.linalg.norm(b)
s = [cs(u[0], u[1]), cs(u[0], u[2])]
print([round(float(v), 4) for v in s], round(float((s[0] * 2 + s[1] * 5) / sum(s)), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.9756, 0.908] 3.446`.

## Lỗi thường gặp
Không trừ trung bình của từng người dùng (có người luôn chấm cao); khởi động lạnh (cold start) với người dùng hoặc mục mới; ma trận quá thưa nên độ tương đồng không đáng tin.

## Ưu điểm, hạn chế
Không cần biết nội dung mục, dễ giải thích. Khó mở rộng với hàng triệu người dùng; phân rã ma trận (matrix factorization) là hướng mở rộng phổ biến nhưng chưa được trình bày trong bài này.

## Bài tập
1. (Dễ) Tính $\operatorname{sim}$ giữa $(1,0)$ và $(0,1)$. 2. (Vừa) Thêm người dùng thứ tư và dự đoán lại. 3. (Khó) Chuẩn hóa đánh giá bằng cách trừ trung bình người dùng trước khi tính similarity.

## Tóm tắt
Dự đoán đánh giá còn thiếu bằng trung bình có trọng số theo độ tương đồng giữa người dùng.
