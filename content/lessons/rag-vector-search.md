**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** LLM foundations, Text classification, Vector và ma trận.
**Mục tiêu:** xây sơ đồ RAG có nguồn và quyền truy cập; tính cosine/Recall@k; tách lỗi truy xuất khỏi lỗi trả lời.

## Vì sao không chỉ hỏi mô hình?
Một trợ lý cần trả lời chính sách học tập vừa cập nhật. Dữ kiện trong weights có thể cũ; fine-tuning không phải cơ chế đồng bộ tài liệu tức thời. Retrieval-Augmented Generation đưa một bước tìm nguồn vào trước khi tạo câu trả lời. Mô hình nhận câu hỏi cùng các đoạn liên quan; đầu ra cần được kiểm tra xem có dựa trên những đoạn đó không.

RAG trong ứng dụng ngày nay là một họ thiết kế rộng. Paper gốc kết hợp bộ truy xuất dense với mô hình sinh trong một recipe cụ thể; không phải mọi hệ “tìm vài đoạn rồi chèn vào prompt” đều đang huấn luyện theo objective của paper. Có nguồn trong context cũng không tự bảo đảm mô hình dùng đúng nguồn.

## Hai pipeline, hai loại lỗi
Offline: thu thập tài liệu được phép, lưu provenance/version, parse, chia chunk, tạo representation rồi lập chỉ mục. Online: xác thực người dùng, áp quyền, truy xuất, có thể rerank, chọn context phù hợp budget, tạo câu trả lời có dẫn nguồn hoặc từ chối khi thiếu chứng cứ.

![Pipeline truy xuất có ranh giới quyền và kiểm tra bằng chứng](/img/rag-vector-search.svg)

Chunk quá nhỏ dễ mất điều kiện đi kèm; quá lớn tốn context và mang nhiều nội dung không liên quan. Overlap có thể giảm mất mạch nhưng tăng gần trùng. Lưu document ID, vị trí, phiên bản và thời điểm hiệu lực; không chỉ lưu vector. Khi xóa/cập nhật nguồn, cả index và cache cần được xử lý theo cùng version.

## Lexical search, dense vector và hybrid
TF-IDF/BM25 là baseline từ vựng: hữu ích với thuật ngữ, mã lỗi và tên riêng. Dense embeddings cố gắng biểu diễn ngữ nghĩa, nhưng chất lượng phụ thuộc model/domain/ngôn ngữ. Hybrid kết hợp tín hiệu; không có một cấu hình luôn tối ưu.

Với $q,d\ne0$, cosine similarity là $q^\top d/(\|q\|\|d\|)$. Khi hai vector đã chuẩn hóa L2, cosine bằng dot product. ANN tăng tốc tìm kiếm gần đúng nhưng có thể bỏ sót neighbor; cần đo retrieval recall và latency. Không lẫn “recall của chỉ mục ANN so với exact search” với “Recall@k theo relevance do người đánh giá gán”. Cosine không phải xác suất nguồn đúng.

## Ví dụ tính được, không giả lập một LLM
Ba vector dưới đây được **đặt bằng tay** để kiểm tra hình học, không phải embedding đã train. Hai document được gán relevant cho truy vấn minh họa; top-2 chỉ lấy được một trong hai.

```python
import numpy as np
ids = np.array(["split", "adapter", "causal"])
vectors = np.array([[1., 0.], [0.8, 0.6], [0., 1.]])
q = np.array([1., 0.])
scores = (vectors @ q) / (np.linalg.norm(vectors, axis=1)*np.linalg.norm(q))
ranked = ids[np.argsort(-scores, kind="stable")][:2].tolist()
relevant = {"split", "causal"}
recall = len(set(ranked) & relevant) / len(relevant)
print(ranked, round(recall, 2))
```

Kết quả: `['split', 'adapter'] 0.5`. Với nhiều query, lấy macro-average theo query và báo cả nhóm khó; nếu relevance chưa được gán đủ, recall đo được chỉ phản ánh bộ nhãn hiện có. Truy vấn không có tài liệu relevant làm mẫu số Recall bằng 0: cần công bố cách xử lý, đánh giá khả năng từ chối riêng và không âm thầm coi Recall là 0 hoặc 1. [Code Lab TF-IDF](/lab?lab=rag_retrieval) chạy truy xuất văn bản thật trên corpus nhỏ tự biên soạn; nó không gọi mô hình sinh hay tuyên bố đã tạo một trợ lý hoàn chỉnh.

## Thiết kế đánh giá có ích
Giữ tập truy vấn kiểm thử ngoài quá trình chọn chunk size, embedding và reranker. Với retrieval, dùng Recall@k, reciprocal rank/MRR hoặc nDCG khi có nhãn phù hợp; định nghĩa rõ relevance ở mức document hay chunk. Với generation, đánh giá đúng câu hỏi, độ hỗ trợ của từng claim, nguồn trích có tồn tại và phiên bản có hiệu lực không. Thêm case không có đáp án, tài liệu mâu thuẫn, tiếng Việt có dấu, truy vấn khác cách diễn đạt và nội dung cài chỉ dẫn độc hại.

Một câu trả lời có citation vẫn có thể trích sai đoạn hoặc suy diễn quá nguồn. Trích ID hợp lệ là điều kiện cần, không phải semantic entailment. Đo chi phí và latency toàn pipeline; không chỉ thời gian tạo embedding.

## Ranh giới bảo mật cần có
Áp ACL ở nơi truy xuất/trước khi dữ liệu vào context, không gửi tài liệu cấm cho mô hình rồi nhờ nó giữ bí mật. Cache phải có phạm vi quyền và version đúng. Retrieved text là dữ liệu không tin cậy, không được biến thành system instruction hay cấp quyền gọi tool. Không đặt secrets trong prompt. Tài liệu có quyền truy cập hợp lệ vẫn có thể chứa nội dung sai hoặc prompt injection; xem [đánh giá và an toàn LLM](/learn/llm-evaluation-security).

## Bài tập tự đánh giá
1. Nếu hai vector đã L2-normalize, phép đo nào thay cosine được?
2. Top-3 chứa 2 tài liệu relevant trong tổng 4 tài liệu relevant: Recall@3 bằng bao nhiêu?
3. Retriever tìm đúng nguồn nhưng câu trả lời thêm một điều kiện không có trong nguồn: cần sửa phần nào?

## Đáp án và tiêu chí chấm
1. Dot product; nêu điều kiện norm khác 0 và chuẩn hóa cả hai phía (2 điểm).
2. $2/4=0.5$; Precision@3 là $2/3$, hai metric khác nhau (3 điểm).
3. Kiểm tra lựa chọn context, prompt/decoding và đánh giá claim-to-source; có thể từ chối hoặc yêu cầu người duyệt. Không kết luận chỉ cần tăng k là đủ (5 điểm).

## Tổng kết
RAG thêm truy xuất và provenance, không tự chứng minh câu trả lời đúng. Tách retrieval/generation eval, áp quyền trước context và giữ khả năng từ chối khi thiếu bằng chứng.

## Nguồn tham khảo
- [Retrieval-Augmented Generation, Lewis và cộng sự](https://arxiv.org/abs/2005.11401).
- [scikit-learn: Text feature extraction](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction).
- [Indirect Prompt Injection, Greshake và cộng sự](https://arxiv.org/abs/2302.12173).

Đối chiếu ngày 27/10/2026. Retrieval là nền tảng ổn định; cấu hình RAG và biện pháp giảm lỗi cần đánh giá theo ứng dụng.
