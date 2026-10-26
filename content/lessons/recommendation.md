**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** KNN, Không gian vector, trị riêng và SVD.
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
Không cần biết nội dung mục, dễ giải thích. Khó mở rộng với hàng triệu người dùng; phân rã ma trận (matrix factorization) được trình bày với objective và thực nghiệm trong [bài embedding recommender](/learn/neural-recommendation).

## Content-based: từ đặc trưng tới điểm gợi ý
Giả sử mỗi item có vector TF-IDF thể loại/mô tả $x_i$ và người dùng đã thích một số item. Profile đơn giản $p_u$ là trung bình các vector item đã thích **trong train**. Xếp hạng item chưa xem bằng $p_u^\top x_i/(\|p_u\|\|x_i\|)$; nếu profile/vector bằng 0, dùng fallback popularity thay vì chia cho 0. Với hai đặc trưng “khoa học/âm nhạc”, profile $(1,0)$ cho điểm 1 với item $(1,0)$ và 0 với $(0,1)$. Khác collaborative filtering, cách này có thể gợi ý item mới nếu metadata tồn tại, nhưng user mới vẫn thiếu profile và quá giống lịch sử có thể làm giảm tính đa dạng.

Item-based neighborhood không dùng metadata: biểu diễn item bằng residual rating của các user cùng quan sát; chọn item gần những mục user đã đánh giá để dự đoán. Với overlap quá ít, shrink similarity theo số quan sát hoặc dùng minimum-overlap policy, đánh giá bằng validation. Content-based và collaborative có thể kết hợp, nhưng trọng số lai phải chọn bằng dữ liệu quan sát hợp lệ, không chọn bằng rating test.

## Bài tập
1. (Dễ) Tính $\operatorname{sim}$ giữa $(1,0)$ và $(0,1)$. 2. (Vừa) Thêm người dùng thứ tư và dự đoán lại. 3. (Khó) Chuẩn hóa đánh giá bằng cách trừ trung bình người dùng trước khi tính similarity.

## Tóm tắt
Dự đoán đánh giá còn thiếu bằng trung bình có trọng số theo độ tương đồng giữa người dùng.

## Điều kiện áp dụng và kiểm tra kết luận
Content-based dùng thuộc tính item để tạo profile/tính similarity; item-based neighborhood so các item qua người cùng rating; user-based như ví dụ so user qua item cùng được quan sát. Sau khi trừ user mean, similarity có thể âm: dùng tổng trị tuyệt đối trọng số hoặc policy chọn láng giềng dương, và fallback khi mẫu số gần 0. Không thay rating thiếu bằng 0 để tính cosine như dữ liệu đã quan sát. [Lab embedding](/learn/neural-recommendation) học matrix factorization với loss chỉ trên các rating train, phân biệt warm start, cold start và ranking; không coi RMSE là metric duy nhất cho hệ gợi ý.

## Đáp án và tiêu chí chấm
1. Cosine của hai vector trực giao (1,0),(0,1) bằng 0. (2 điểm).
2. Thêm user thứ tư phải chỉ rõ co-rated items, similarity và rating item cần dự đoán. Không có dữ liệu cụ thể thì không thể bịa một prediction duy nhất. (3 điểm).
3. Tính mean của mỗi user từ rating train quan sát, dùng residual rating; dự đoán μu+Σ sim(u,v)(rvi−μv)/Σ|sim(u,v)| với các láng giềng hợp lệ. Nêu fallback và không dùng rating test trong mean. (5 điểm).

## Nguồn tham khảo
- [Machine Learning cơ bản](https://machinelearningcoban.com/).
