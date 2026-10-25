**Cấp độ:** Beginner · **Tiên quyết:** không.
**Mục tiêu:** phân biệt AI, Machine Learning và Deep Learning, và nhận diện các dạng bài toán học máy.

## Vấn đề thực tế
Thay vì viết luật thủ công ("nếu email chứa từ này thì là spam"), ta cho máy học quy luật từ dữ liệu. Machine Learning (ML) là tập con của AI; Deep Learning (DL) là tập con của ML dùng mạng nơ-ron nhiều lớp.

## Các dạng bài toán
- **Học có giám sát:** có nhãn. *Phân loại* (nhãn rời rạc: spam/không spam) và *hồi quy* (nhãn liên tục: giá nhà).
- **Học không giám sát:** không nhãn. *Phân cụm*, *giảm chiều*, *phát hiện bất thường*.
- **Học tăng cường:** tác tử học qua thử và nhận phần thưởng (chưa có bài riêng trong giáo trình này).

## Quy trình chung
Dữ liệu → đặc trưng → mô hình có tham số → hàm mất mát đo sai số → thuật toán tối ưu điều chỉnh tham số → đánh giá trên dữ liệu chưa thấy. Mọi bài sau trong giáo trình đều theo khuôn này.

![Quan hệ giữa AI, ML và DL](/img/ml-intro.svg)

## Ví dụ từng bước
Iris có 150 mẫu cân bằng giữa 3 lớp (mỗi lớp 50). Một "mô hình" luôn đoán lớp phổ biến nhất (baseline) đúng $50/150\approx0.333$. Mô hình thật phải vượt mốc này.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.dummy import DummyClassifier
X, y = load_iris(return_X_y=True)
print(round(DummyClassifier(strategy="most_frequent").fit(X, y).score(X, y), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.333`.

## Lỗi thường gặp
Dùng ML khi luật đơn giản đã đủ; đánh giá trên chính dữ liệu huấn luyện; không có baseline để so sánh.

## Bài tập
1. (Dễ) Phân loại 5 bài toán thành phân loại, hồi quy, phân cụm. 2. (Vừa) Tính baseline cho dữ liệu có 90% lớp 0. 3. (Khó) Mô tả một bài toán thực tế và chọn dạng học phù hợp.

## Tóm tắt
ML học quy luật từ dữ liệu; luôn so mô hình với baseline.
