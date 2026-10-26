**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Logistic Regression.
**Mục tiêu:** hiểu luật cập nhật Perceptron và điều kiện hội tụ.

## Vấn đề thực tế
Perceptron là mô hình nơ-ron đơn giản nhất: phân loại hai lớp bằng một siêu phẳng, nền tảng của mạng nơ-ron.

## Công thức
Nhãn $y\in\{-1,+1\}$, dự đoán $\hat y=\operatorname{sign}(\mathbf w^\top\mathbf x+b)$. Với mỗi mẫu bị phân loại sai, tức $y(\mathbf w^\top\mathbf x+b)\le0$:
$$
\mathbf w\leftarrow\mathbf w+y\,\mathbf x,\qquad b\leftarrow b+y
$$
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

## Điều kiện áp dụng và kiểm tra kết luận
Đầu vào vector số, nhãn −1/+1, score tuyến tính; cập nhật cả điểm score $=0$ theo convention trong bài. Với learning rate $\eta>0$ có thể viết $w\leftarrow w+\eta yx$, $b\leftarrow b+\eta y$. Bảo đảm hữu hạn số lỗi cần dữ liệu khả tách có margin dương và norm input hữu hạn; nó không bảo đảm tối ưu xác suất hoặc generalization. Khi không khả tách, đặt budget, pocket/averaging hoặc dùng loss khác; không chạy vòng lặp vô hạn chờ một điều kiện không thể đạt. Bias có thể gộp vào vector bằng cách thêm tọa độ 1.

## Đáp án và tiêu chí chấm
1. Sau hai mẫu ví dụ, $w=(1,2)$, $b=1$. Với $x=(2,1)$, $y=-1$: score $=5$ nên cập nhật thành $w=(-1,1)$, $b=0$. (2 điểm).
2. Đổi seed của dữ liệu/thứ tự phải ghi rõ thứ gì đổi; số epoch phụ thuộc thứ tự và margin, không phải hằng số đặc trưng của mọi Perceptron. (3 điểm).
3. XOR đòi hai đỉnh chéo cùng lớp. Nếu hai điểm (0,0),(1,1) ở một phía và (1,0),(0,1) phía kia, cộng các bất đẳng thức dẫn tới mâu thuẫn. Nêu giả định nhãn và bias để chứng minh không có siêu phẳng. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Perceptron](https://scikit-learn.org/stable/modules/linear_model.html#perceptron).
- [Dive into Deep Learning: Multilayer Perceptrons](https://d2l.ai/chapter_multilayer-perceptrons/index.html).
