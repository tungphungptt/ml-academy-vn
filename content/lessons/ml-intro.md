**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Python cho ML.
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

## Điều kiện áp dụng và kiểm tra kết luận
Học bán giám sát kết hợp ít dữ liệu có nhãn và nhiều dữ liệu chưa nhãn; pseudo-label là một cách nhưng có thể khuếch đại lỗi của mô hình đầu. Học tự giám sát tạo tín hiệu huấn luyện từ cấu trúc dữ liệu, không đồng nghĩa không cần dữ liệu hay không có objective. Semi-supervised khác active learning (chọn mẫu để xin nhãn). Học tăng cường tối ưu reward qua tương tác, không phải classification chỉ vì có nhãn “thưởng”. Luôn xác định đơn vị dự đoán, thời điểm biết feature/target, baseline và metric trước chọn mô hình.

## Đáp án và tiêu chí chấm
1. Năm ví dụ thuộc đúng ba nhóm trong đề: spam và dự đoán vỡ nợ có nhãn là classification; giá nhà và lượng điện tiêu thụ liên tục là regression; nhóm khách hàng chưa có nhãn là clustering. Nêu rõ target/nhãn của mỗi ví dụ. (2 điểm).
2. Luôn đoán lớp 0 cho dữ liệu 90% lớp 0 được accuracy $=0.9$ nhưng recall lớp 1 bằng 0. Chưa chứng minh mô hình hữu ích. (3 điểm).
3. Một đề xuất đạt cần nêu ai dùng dự đoán, feature nào có sẵn lúc predict, target/label tạo ra sao, cách split tránh leakage và baseline liên quan; không chấm theo việc gọi tên một mạng sâu. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Machine learning tutorial (mô tả các dạng bài toán)](https://scikit-learn.org/stable/getting_started.html).
- [Machine Learning cơ bản](https://machinelearningcoban.com/).
