**Cấp độ:** Intermediate · **Tiên quyết:** Vector và ma trận, KNN.
**Mục tiêu:** biểu diễn văn bản thành vector: Bag-of-Words, TF-IDF và ý tưởng embedding.

## Vấn đề thực tế
Mô hình chỉ xử lý số, nên cần biến câu chữ thành vector sao cho các văn bản giống nhau có vector gần nhau.

## Công thức
**Bag-of-Words:** đếm số lần mỗi từ trong từ điển xuất hiện. **TF-IDF:** nhấn mạnh từ đặc trưng của văn bản và giảm trọng số từ xuất hiện ở hầu hết văn bản:
$$\text{tfidf}(t,d)=\text{tf}(t,d)\cdot\text{idf}(t),\qquad \text{idf}(t)=\ln\frac{1+N}{1+\text{df}(t)}+1$$
(đúng với cài đặt mặc định của scikit-learn; sau đó vector được chuẩn hóa L2). **Embedding:** mỗi từ ứng với một hàng của ma trận $E\in\mathbb R^{V\times d}$ được học trong lúc huấn luyện; tra bảng tương đương nhân vector one-hot với $E$. Độ giống nhau đo bằng cosine.

![Ma trận tương đồng TF-IDF](/img/embeddings.svg)

## Ví dụ từng bước
Ba câu: "học máy rất hay", "học sâu rất hay", "trời hôm nay đẹp" cho ma trận TF-IDF 3×9. Câu 1 và 2 chung các từ "học", "rất", "hay" nên cosine $\approx0.634$; câu 1 và 3 không chung từ nào nên cosine $=0$.

## Code và cách chạy
```python
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
docs = ["học máy rất hay", "học sâu rất hay", "trời hôm nay đẹp"]
M = TfidfVectorizer().fit_transform(docs); S = cosine_similarity(M)
print(M.shape, round(float(S[0, 1]), 3), round(float(S[0, 2]), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `(3, 9) 0.634 0.0`.

## Lỗi thường gặp
Fit TF-IDF trên cả tập test (rò rỉ); bỏ qua tách từ tiếng Việt (từ ghép như "học máy" bị tách thành hai từ ở đây); coi TF-IDF nắm được nghĩa (nó chỉ dựa trên từ trùng nhau, "tốt" và "xuất sắc" không liên quan).

## Ưu điểm, hạn chế
TF-IDF đơn giản, mạnh làm baseline. Không nắm trật tự từ và ngữ nghĩa; embedding học từ dữ liệu lớn khắc phục điểm này nhưng cần huấn luyện (chưa có bài thực hành embedding trong giáo trình này).

## Bài tập
1. (Dễ) Tính cosine của $(1,0)$ và $(1,1)$. 2. (Vừa) Thêm một câu mới và xem ma trận tương đồng. 3. (Khó) Huấn luyện Logistic Regression phân loại cảm xúc trên TF-IDF.

## Tóm tắt
TF-IDF biểu diễn văn bản theo từ trùng khớp; embedding là bảng tra vector học được.
