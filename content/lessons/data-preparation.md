**Cấp độ:** Beginner · **Tiên quyết:** NumPy, pandas.
**Mục tiêu:** chia dữ liệu train/validation/test, chuẩn hóa đúng cách và xử lý dữ liệu thiếu.

## Vấn đề thực tế
Kết quả chỉ đáng tin nếu đánh giá trên dữ liệu mô hình chưa từng thấy, và tiền xử lý không để thông tin test lọt vào huấn luyện.

## Quy tắc
- **Chia:** train (học tham số), validation (chọn mô hình/siêu tham số), test (đánh giá cuối). Tỉ lệ thường gặp 70/15/15 hoặc dùng cross-validation thay validation.
- **Chuẩn hóa:** $z=(x-\mu_{\text{train}})/\sigma_{\text{train}}$; $\mu,\sigma$ lấy **chỉ từ tập train** rồi áp dụng cho validation và test.
- **Dữ liệu thiếu:** xóa dòng (khi ít), điền trung bình/trung vị (đơn giản), hoặc thêm cột đánh dấu "đã thiếu". Giá trị điền cũng phải tính từ tập train.

![Chia train/validation/test](/img/data-preparation.svg)

## Ví dụ từng bước
1000 mẫu chia 70/15/15 được $700/150/150$. Tập train $(1,2,3)$ có $\mu=2,\sigma\approx0.8165$; mẫu test $4$ được chuẩn hóa thành $(4-2)/0.8165\approx2.4495$. Dữ liệu $(1,\text{thiếu},3,\text{thiếu},5)$ điền trung bình các giá trị có mặt ($=3$) cho $(1,3,3,3,5)$.

## Code và cách chạy
```python
import numpy as np
t = np.array([1.0, 2.0, 3.0]); a = np.array([1, np.nan, 3, np.nan, 5])
print(int(1000 * 0.7), int(1000 * 0.15), round(float((4 - t.mean()) / t.std()), 4), np.where(np.isnan(a), np.nanmean(a), a).tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `700 150 2.4495 [1.0, 3.0, 3.0, 3.0, 5.0]`.

## Lỗi thường gặp
Chuẩn hóa hoặc điền thiếu trên toàn bộ dữ liệu trước khi chia (rò rỉ); xáo trộn dữ liệu chuỗi thời gian; chia ngẫu nhiên khi các dòng của cùng một người/đối tượng xuất hiện ở cả train và test.

## Bài tập
1. (Dễ) Chia 2000 mẫu theo tỉ lệ 80/10/10. 2. (Vừa) Dùng `train_test_split` hai lần để tạo train/val/test. 3. (Khó) Dùng `SimpleImputer` và `StandardScaler` trong Pipeline.

## Tóm tắt
Chia dữ liệu trước, rồi fit mọi bước tiền xử lý chỉ trên tập train.
