**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Vector và ma trận, KNN.
**Mục tiêu:** biểu diễn văn bản thành vector: Bag-of-Words, TF-IDF và ý tưởng embedding.

## Vấn đề thực tế
Mô hình chỉ xử lý số, nên cần biến câu chữ thành vector sao cho các văn bản giống nhau có vector gần nhau.

## Công thức
**Bag-of-Words:** đếm số lần mỗi từ trong từ điển xuất hiện. **TF-IDF:** nhấn mạnh từ đặc trưng của văn bản và giảm trọng số từ xuất hiện ở hầu hết văn bản:
$$
\text{tfidf}(t,d)=\text{tf}(t,d)\cdot\text{idf}(t),\qquad \text{idf}(t)=\ln\frac{1+N}{1+\text{df}(t)}+1
$$
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
TF-IDF đơn giản, mạnh làm baseline. Không nắm trật tự từ và ngữ nghĩa; embedding học từ dữ liệu lớn khắc phục điểm này nhưng cần huấn luyện (xem [lab embedding user/item](/learn/neural-recommendation), không nhầm với embedding từ ngữ).

## Bài tập
1. (Dễ) Tính cosine của $(1,0)$ và $(1,1)$. 2. (Vừa) Thêm một câu mới và xem ma trận tương đồng. 3. (Khó) Huấn luyện Logistic Regression phân loại cảm xúc trên TF-IDF.

## Tóm tắt
TF-IDF biểu diễn văn bản theo từ trùng khớp; embedding là bảng tra vector học được.

## Điều kiện áp dụng và kiểm tra kết luận
TF-IDF là một biểu diễn sparse phụ thuộc vocabulary/IDF fit trên train; token chưa thấy có thể bị bỏ qua. Embedding là bảng vector được tối ưu theo một objective cụ thể, không tự có ngữ nghĩa nếu chưa huấn luyện. Word2vec/CBOW/skip-gram học quan hệ ngữ cảnh theo objective khác supervised classifier; embedding contextual của Transformer còn phụ thuộc cả câu. Padding ID và unknown ID cần chính sách rõ, đặc biệt khi tính loss/pooling. [Lab embedding recommender](/learn/neural-recommendation) thực sự học các hàng user/item, nhưng không được gọi nhầm là word embedding hoặc biểu diễn có ngữ nghĩa từng chiều.

## Đáp án và tiêu chí chấm
1. $\cos\theta=\frac{1\cdot1+0\cdot1}{1\cdot\sqrt2}=\frac1{\sqrt2}\approx0.7071$. (2 điểm).
2. Nếu đang đánh giá, transform câu mới bằng vectorizer fit train; chỉ refit khi chủ động huấn luyện phiên bản mới và đánh giá lại. So số feature và zero-vector cho câu không có token biết trước. (3 điểm).
3. Dùng pipeline TF-IDF+Logistic Regression, split theo nguồn người viết/thời gian nếu cần, metric macro F1 cho imbalance, chọn n-gram/threshold bằng train CV; không tuyên bố toy 8 câu là benchmark. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Text feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction).
