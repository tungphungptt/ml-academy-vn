**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Embeddings, Transformer architecture, Text classification.
**Mục tiêu:** nối tokenizer, embedding, causal Transformer và next-token loss; phân biệt pretraining, fine-tuning và inference; đọc giới hạn của một language model.

## Từ chuỗi chữ đến bài toán dự đoán
Một mô hình sinh văn bản không nhận trực tiếp khái niệm “câu hỏi”. Tokenizer chuyển chuỗi thành token IDs; embedding ánh xạ mỗi ID sang vector; Transformer tạo biểu diễn phụ thuộc ngữ cảnh; lớp đầu ra cho phân phối trên token tiếp theo. Khi sinh, mô hình chọn/lấy mẫu một token, thêm vào prefix rồi lặp lại.

ID là chỉ số trong vocabulary, không có thứ tự ngữ nghĩa: token 100 không nhất thiết gần token 101 hơn token 900. Embedding tĩnh của một ID được tra trước khi qua Transformer. Contextual embedding sau attention thay đổi theo câu: cùng một từ có thể có vector khác trong hai ngữ cảnh. Cần dùng tokenizer và special tokens phù hợp với checkpoint; đổi bảng ID tùy tiện sẽ làm sai ý nghĩa trọng số.

## Token không đồng nghĩa từ, ký tự hay byte
BPE, WordPiece và Unigram là những họ tokenization khác nhau. BPE học các phép gộp cặp phổ biến từ corpus sau normalization/pre-tokenization; bản dùng byte và các cách xử lý khoảng trắng cũng khác nhau. Một từ tiếng Việt có thể thành nhiều token. Không có hệ số cố định chuyển số ký tự thành token cho mọi tokenizer/ngôn ngữ.

```python
import unicodedata
text = "Học máy"
print(len(text), len(text.encode("utf-8")), len(unicodedata.normalize("NFD", text)))
```

Kết quả: `7 10 9`. Ba số là ký tự Unicode dạng NFC, byte UTF-8 và ký tự dạng NFD, **không phải token count của một LLM**. Muốn đếm token thật, dùng tokenizer đúng revision của mô hình. Chuẩn hóa dữ liệu cần nhất quán với tokenizer; không tùy tiện bỏ dấu tiếng Việt để giảm số token.

![Pipeline token IDs, embedding, causal Transformer và logits](/img/llm-foundations.svg)

## Mục tiêu next-token và teacher forcing
Với chuỗi $x_1,\ldots,x_T$, causal language model phân tích:

$$
p_\theta(x_{1:T})=\prod_{t=1}^{T}p_\theta(x_t\mid x_{<t}),\qquad
L=-\frac1M\sum_{t\in\mathcal V}\log p_\theta(x_t\mid x_{<t}).
$$

$\mathcal V$ là các target hợp lệ, $M=|\mathcal V|>0$; bỏ padding và vị trí bị mask theo objective. Nếu một batch không còn target hợp lệ, không chia cho 0: cần bỏ batch hoặc báo lỗi dữ liệu theo protocol, thay vì xem NaN là loss hợp lệ. Khi học bằng teacher forcing, prefix dùng token thật và target dịch một vị trí. Causal mask ngăn nhìn tương lai. Inference tự hồi quy dùng prefix đã sinh, nên lỗi có thể tích lũy. Một số API tự shift labels nội bộ; đọc hợp đồng trước, không shift hai lần.

Ví dụ hai token đích được gán xác suất 0.5 và 0.25:

```python
from math import log, exp
probabilities = [0.5, 0.25]
nll = -sum(log(p) for p in probabilities) / len(probabilities)
print(round(nll, 4), round(exp(nll), 4))
```

Kết quả: `1.0397 2.8284`. Perplexity là $e^L$ khi dùng log tự nhiên trên cùng protocol. Không so perplexity giữa tokenizer, corpus, cách mask hoặc normalization khác rồi kết luận mô hình nào tốt hơn. Ví dụ này tính loss, không huấn luyện một LLM.

## Pretraining, fine-tuning và sử dụng mô hình
Pretraining học từ corpus lớn theo một objective như next-token prediction. Supervised fine-tuning dùng ví dụ tác vụ/chỉ dẫn; preference optimization là một giai đoạn khác với giả định và dữ liệu riêng. Không gộp mọi cách post-training thành một thuật toán duy nhất, cũng không gọi việc thêm tài liệu vào prompt là fine-tuning.

Ở inference, temperature điều chỉnh phân phối và top-k/top-p giới hạn tập lấy mẫu. Temperature thấp không biến xác suất token thành xác suất một mệnh đề đúng. Greedy decoding thường dễ lặp lại hơn sampling, nhưng không bảo đảm tái lập bitwise giữa phần cứng/runtime hoặc bảo đảm sự thật. Cần quản lý context budget, stop tokens, truncation, KV cache và độ trễ.

## Giới hạn và mở rộng đa phương thức
Mô hình có thể sinh câu trôi chảy mà sai, lẫn nguồn hoặc lặp dữ liệu nhạy cảm. Kiến thức trong weights không tự cập nhật khi một tài liệu thay đổi. Một câu trả lời tự tin không phải chứng cứ mô hình đã tra nguồn. [RAG](/learn/rag-vector-search) thêm truy xuất ở ngoài mô hình; [đánh giá và an toàn](/learn/llm-evaluation-security) kiểm tra pipeline đầy đủ.

Trong hệ đa phương thức, ảnh/âm thanh có thể được encoder chuyển thành chuỗi biểu diễn rồi kết hợp với text theo kiến trúc riêng. Không phải mọi mô hình đều “biến ảnh thành từ”. Bài này cung cấp nền để đọc interface input/output, chưa huấn luyện hoặc benchmark mô hình thị giác-ngôn ngữ.

## Lỗi thường gặp và hiểu lầm
“Một từ bằng một token”, “embedding ID càng lớn càng quan trọng”, “loss thấp chứng minh hiểu đúng thế giới” và “fine-tuning luôn cập nhật dữ kiện đáng tin” đều bỏ qua những điều kiện cần kiểm tra.

## Bài tập tự đánh giá
1. Viết input/target cho `[BOS, A, B, EOS]` khi dùng next-token prediction.
2. Nếu một vị trí target có probability 0.1, NLL tại vị trí đó là bao nhiêu?
3. Vì sao so hai perplexity khác tokenizer là không đủ? Nêu protocol thay thế.

## Đáp án và tiêu chí chấm
1. Input `[BOS,A,B]`, target `[A,B,EOS]`, causal mask; kiểm tra API có tự shift không (2 điểm).
2. $-\ln0.1\approx2.3026$; không phải xác suất mô hình trả lời đúng cả câu (3 điểm).
3. Dùng cùng tập tác vụ, giữ prompt/decoding/version, đánh giá chất lượng theo rubric và tài nguyên; chỉ so perplexity khi cùng đơn vị token/protocol phù hợp (5 điểm).

## Tổng kết
Tokenizer tạo ID, embedding tạo vector, Transformer ngữ cảnh hóa và head dự đoán token. Likelihood và decoding không phải bảo đảm một claim đúng; đánh giá tác vụ và nguồn vẫn cần thiết.

## Nguồn tham khảo
- [Hugging Face: BPE tokenization](https://huggingface.co/learn/llm-course/chapter6/5).
- [Hugging Face: Training a causal language model](https://huggingface.co/learn/llm-course/chapter7/6).
- [Google MLCC: Introduction to LLMs](https://developers.google.com/machine-learning/crash-course/llm).

Đối chiếu ngày 27/10/2026. Tokenization, likelihood và causal masking là nền tảng; recipe post-training và kiến trúc đa phương thức vẫn phát triển.
