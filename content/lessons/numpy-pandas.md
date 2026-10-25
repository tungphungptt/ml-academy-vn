**Cấp độ:** Beginner · **Tiên quyết:** Python cơ bản.
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
