**Cấp độ:** Beginner · **Tiên quyết:** vector, tích vô hướng.
**Mục tiêu:** hiểu luật cập nhật Perceptron và điều kiện hội tụ.

## Vấn đề thực tế
Perceptron là mô hình nơ-ron đơn giản nhất: phân loại hai lớp bằng một siêu phẳng, nền tảng của mạng nơ-ron.

## Công thức
Nhãn $y\in\{-1,+1\}$, dự đoán $\hat y=\operatorname{sign}(\mathbf w^\top\mathbf x+b)$. Với mỗi mẫu bị phân loại sai, tức $y(\mathbf w^\top\mathbf x+b)\le0$:
$$\mathbf w\leftarrow\mathbf w+y\,\mathbf x,\qquad b\leftarrow b+y$$
Nếu dữ liệu khả tách tuyến tính, thuật toán dừng sau hữu hạn bước.

![Đường phân tách của Perceptron](/img/perceptron.svg)

## Ví dụ từng bước
Khởi tạo $\mathbf w=(0,0),b=0$. Mẫu $x=(1,2),y=+1$: $0\le0$ nên cập nhật $\mathbf w=(1,2),b=1$. Mẫu $x=(-1,-1),y=-1$: $\mathbf w^\top x+b=-2$, $y\cdot(-2)=2>0$, đã đúng, không cập nhật.

## Code và cách chạy
Bài **Perceptron** trong Code Lab (`labs/perceptron/`): bản NumPy cho `epoch=2 loi_cuoi_epoch=0 accuracy=1.000`. Dữ liệu trong lab được chọn khả tách tuyến tính.

## Lỗi thường gặp
Dùng dữ liệu không khả tách: thuật toán không bao giờ hội tụ (mình đã gặp khi viết lab); quên đổi nhãn về $\{-1,+1\}$.

## Ưu điểm, hạn chế, so sánh
Rất đơn giản và nhanh. Không giải được XOR; không cho xác suất. Logistic Regression khắc phục bằng loss khả vi.

## Bài tập
1. (Dễ) Làm tiếp một bước với $x=(2,1),y=-1$. 2. (Vừa) Đếm số epoch hội tụ khi đổi seed. 3. (Khó) Chứng minh Perceptron không biểu diễn được XOR.

## Tóm tắt
Cập nhật $\mathbf w$ chỉ khi sai; hội tụ nếu dữ liệu khả tách tuyến tính.
