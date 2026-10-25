**Cấp độ:** Intermediate · **Tiên quyết:** Embeddings, Logistic Regression.
**Mục tiêu:** xây một bộ phân loại cảm xúc văn bản đơn giản bằng TF-IDF và Logistic Regression, và nhìn đúng giới hạn của nó.

## Vấn đề thực tế
Phân loại một nhận xét là tích cực hay tiêu cực. Quy trình chung: tiền xử lý văn bản → vector hóa → mô hình phân loại → đánh giá. Với Deep Learning, bước vector hóa được thay bằng embedding học được và mô hình bằng RNN hoặc Transformer.

![Pipeline phân loại văn bản](/img/text-classification.svg)

## Ví dụ từng bước
Một tập **đồ chơi** gồm 8 câu tiếng Việt có nhãn (4 tích cực, 4 tiêu cực). TF-IDF biến mỗi câu thành vector; Logistic Regression học trọng số cho từng từ (từ như "hay", "xuất sắc" nghiêng về tích cực, "dở", "tệ" nghiêng về tiêu cực). Dự đoán câu mới dựa trên các từ đã gặp.

## Code và cách chạy
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
tr = ["phim rất hay", "diễn viên xuất sắc", "nội dung hấp dẫn", "tôi rất thích phim này",
      "phim rất dở", "diễn viên diễn tệ", "nội dung nhàm chán", "tôi không thích phim này"]
y = [1, 1, 1, 1, 0, 0, 0, 0]
p = make_pipeline(TfidfVectorizer(), LogisticRegression(max_iter=1000)).fit(tr, y)
te = ["phim hay xuất sắc", "nội dung dở tệ"]
print(p.predict(te).tolist(), p.predict_proba(te)[:, 1].round(2).tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `[1, 0] [0.6, 0.42]`.

Cả hai dự đoán đúng, nhưng xác suất chỉ $0.6$ và $0.42$ (gần $0.5$): với 8 câu huấn luyện, mô hình rất kém chắc chắn. Đây chỉ là ví dụ minh họa cơ chế, **không phải** bằng chứng về chất lượng; muốn đánh giá thật cần tập dữ liệu lớn, chia train/test và dùng cross-validation.

## Lỗi thường gặp
Fit TF-IDF trên cả tập test; không tách từ tiếng Việt (từ ghép như "diễn viên" bị tách đôi theo khoảng trắng); đánh giá trên tập quá nhỏ; bỏ qua phủ định ("không thích" có từ "thích" nhưng mang nghĩa tiêu cực, TF-IDF từ đơn dễ nhầm).

## Hạn chế
TF-IDF không hiểu thứ tự và ngữ cảnh; mô hình ngôn ngữ tiền huấn luyện (Transformer) xử lý tốt hơn nhưng cần tài nguyên và code PyTorch chưa có trong giáo trình này.

## Bài tập
1. (Dễ) Thêm 2 câu huấn luyện mới và dự đoán lại. 2. (Vừa) Dùng `ngram_range=(1, 2)` và xem cách xử lý "không thích". 3. (Khó) Tìm một tập dữ liệu cảm xúc tiếng Việt công khai, chia train/test và báo cáo F1.

## Tóm tắt
TF-IDF + Logistic Regression là baseline nhanh cho phân loại văn bản; hiểu giới hạn của nó trước khi dùng mô hình sâu.
