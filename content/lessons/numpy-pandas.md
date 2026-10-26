**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Python cho ML.
**Mục tiêu:** dùng NumPy (broadcasting, chuẩn hóa), pandas (groupby) và Matplotlib để làm việc với dữ liệu.

## Vấn đề thực tế
Dữ liệu thật nằm trong bảng; ta cần đọc, làm sạch, tóm tắt và vẽ nhanh trước khi huấn luyện mô hình.

## Khái niệm chính
**Broadcasting:** NumPy tự "kéo giãn" các chiều có kích thước 1 để cộng/nhân mảng khác shape, ví dụ $(3,1)+(1,4)\to(3,4)$. **Chuẩn hóa z-score:** $z=(x-\mu)/\sigma$ đưa đặc trưng về trung bình 0, độ lệch chuẩn 1 (bước tiền xử lý quan trọng cho KNN, SVM, Gradient Descent). **pandas:** `DataFrame` là bảng; `groupby` gom nhóm rồi tính thống kê.

![Quy tắc broadcasting](/img/numpy-pandas.svg)

## Ví dụ từng bước
$x=(2,4,6)$: $\mu=4$, $\sigma=\sqrt{8/3}\approx1.633$, nên $z\approx(-1.2247,0,1.2247)$. Bảng có nhóm `a` với giá trị 1 và 3, nhóm `b` với giá trị 5: trung bình theo nhóm là $2$ và $5$.

## Code và cách chạy
```python
import numpy as np
x = np.array([2.0, 4.0, 6.0])
print(((x - x.mean()) / x.std()).round(4).tolist(), (np.arange(3).reshape(3, 1) + np.arange(4).reshape(1, 4)).shape)
```
Kết quả kỳ vọng (đã chạy cục bộ): `[-1.2247, 0.0, 1.2247] (3, 4)`.
```python
import pandas as pd
df = pd.DataFrame({"g": ["a", "a", "b"], "v": [1, 3, 5]})
print(df.groupby("g")["v"].mean().to_dict())
```
Kết quả kỳ vọng (đã chạy cục bộ): `{'a': 2.0, 'b': 5.0}`.

Vẽ biểu đồ với Matplotlib (chạy local, cần `pip install matplotlib`):
```python
import matplotlib.pyplot as plt
plt.plot([1, 2, 3], [2, 4, 6], marker="o"); plt.xlabel("x"); plt.ylabel("y"); plt.show()
```

## Lỗi thường gặp
Chuẩn hóa trên toàn bộ dữ liệu trước khi chia train/test (rò rỉ dữ liệu: chỉ fit trên tập train); sửa `DataFrame` gốc ngoài ý muốn (dùng `.copy()`); `std` của NumPy mặc định chia cho $N$, còn pandas chia cho $N-1$.

## Ưu điểm, hạn chế
Vector hóa nhanh và ngắn gọn. Dữ liệu lớn hơn RAM cần công cụ khác.

## Bài tập
1. (Dễ) Chuẩn hóa $(1,3,5)$. 2. (Vừa) Tính trung bình theo nhóm cho bảng 6 dòng tự tạo. 3. (Khó) Viết hàm chuẩn hóa fit trên train và áp dụng cho test.

## Tóm tắt
Broadcasting, chuẩn hóa và groupby là ba công cụ cơ bản nhất khi chuẩn bị dữ liệu.

## Điều kiện áp dụng và kiểm tra kết luận
Broadcasting căn shape từ bên phải: mỗi cặp chiều phải bằng nhau hoặc một chiều bằng 1. `(3,)` không tự là vector cột `(3,1)`. Trong dữ liệu bảng, index và thứ tự cột phải nhất quán giữa fit và predict. Khi chuẩn hóa, cột hằng có $\operatorname{std}=0$ cần được xử lý; không chia mù quáng. Với Matplotlib trong server/CI, dùng backend không GUI, lưu figure rồi đóng để không giữ bộ nhớ; biểu đồ EDA dùng train và không thay thế metric đánh giá.

## Đáp án và tiêu chí chấm
1. Với $(1,3,5)$, trung bình $=3$, độ lệch chuẩn tổng thể $=\sqrt{8/3}$, nên $z\approx(-1.2247,0,1.2247)$. Nếu dùng std mẫu thì kết quả khác: phải ghi ddof. (2 điểm).
2. Một ví dụ hợp lệ: nhóm a có 1,3,5 cho trung bình $=3$; nhóm b có 2,4,6 cho trung bình $=4$. Kiểm tra cả index nhóm và giá trị. (3 điểm).
3. Viết fit trả mean/std train, transform dùng lại chúng cho test. Kiểm tra $\operatorname{std}=0$, số cột và giá trị thiếu; không fit lại khi transform test. (5 điểm).

## Nguồn tham khảo
- [NumPy: Absolute Beginners Guide](https://numpy.org/doc/stable/user/absolute_beginners.html).
- [pandas User Guide](https://pandas.pydata.org/docs/user_guide/index.html).
- [Matplotlib User Guide](https://matplotlib.org/stable/users/index.html).
