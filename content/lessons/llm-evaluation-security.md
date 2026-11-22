**Cấp độ:** Advanced · **Tầng:** Core · **Tiên quyết:** RAG và vector search, Metrics, Data leakage.
**Mục tiêu:** lập bộ eval có rubric và trường hợp từ chối; phân biệt hallucination với prompt injection; đặt kiểm soát quyền ở ngoài mô hình.

## Trả lời hay chưa đủ để đưa vào sử dụng
Một trợ lý trả lời trôi chảy có thể bịa nguồn, tiết lộ dữ liệu hoặc thực hiện hành động ngoài ý muốn. Chất lượng không chỉ là similarity với một câu mẫu. Trước khi chọn model, xác định người dùng, nhiệm vụ, dữ liệu được phép, hành động được phép, loại lỗi không chấp nhận và cơ chế chuyển người duyệt.

**Hallucination** là đầu ra không đúng hoặc không được chứng cứ yêu cầu hỗ trợ, tùy định nghĩa đánh giá. **Prompt injection** là nội dung cố thay đổi chỉ dẫn/hành vi của hệ thống qua đầu vào hoặc nguồn được đọc. Không phải mọi hallucination do tấn công; một tài liệu có chứa câu “bỏ qua hướng dẫn” cũng không tự chứng minh hệ thống đã bị chiếm quyền. Cần quan sát hành vi và ranh giới thực thi.

## Tách các tầng đánh giá
Một bảng eval nên có câu hỏi, quyền người dùng, nguồn hợp lệ/version, kỳ vọng có/không trả lời, rubric, nhóm dữ liệu và tiêu chí chấm. Tách development set để sửa prompt/retriever khỏi test cuối; loại gần trùng và kiểm tra contamination khi có thể. Giữ phiên bản model, tokenizer, prompt, index, decoding và thời điểm chạy.

Chấm riêng task correctness, groundedness, citation validity, refusal khi thiếu nguồn, rò rỉ dữ liệu, tool authorization và latency/chi phí. Exact match chỉ phù hợp một số đầu ra chuẩn hóa; không chấm câu mở chỉ bằng khớp từ. LLM-as-judge có thể giúp mở rộng đánh giá, nhưng cần đối chiếu với người, kiểm tra bias thứ tự/độ dài và rủi ro judge bị nội dung đầu ra dẫn dắt. Judge agreement không phải ground truth.

![Dữ liệu không tin cậy đi qua mô hình nhưng không vượt ranh giới cấp quyền](/img/llm-evaluation-security.svg)

## Coverage và độ chính xác có điều kiện
Nếu hệ thống được phép từ chối, báo ít nhất coverage (tỷ lệ có trả lời) cùng chất lượng trên các câu đã trả lời. Chỉ giữ câu dễ có thể tăng accuracy mà làm sản phẩm không hữu ích; chỉ tăng coverage có thể tăng lỗi không được hỗ trợ.

Ví dụ dưới là **ba ca giả định được người soạn gán rubric**, không phải benchmark model. Nó kiểm tra cách tổng hợp, không tự đánh giá ngữ nghĩa:

```python
cases = [
    {"answered": True, "correct": True, "supported": True},
    {"answered": True, "correct": False, "supported": False},
    {"answered": False, "correct": False, "supported": False},
]
answered = [c for c in cases if c["answered"]]
coverage = len(answered) / len(cases)
accuracy = sum(c["correct"] for c in answered) / len(answered)
unsupported = sum(not c["supported"] for c in answered) / len(answered)
print(round(coverage, 4), round(accuracy, 4), round(unsupported, 4))
```

Kết quả: `0.6667 0.5 0.5`. Production cần xử lý mẫu số 0, báo số ca, uncertainty và slice; không so tỷ lệ từ ba ca như kết quả thống kê đáng tin. Một câu “không biết” hợp lệ trong case unanswerable không nên bị gộp với trả lời sai bằng một rubric mơ hồ.

## Prompt injection là vấn đề ranh giới tin cậy
Trong RAG, website/tài liệu có thể chứa chỉ dẫn yêu cầu bỏ chính sách, gọi tool hoặc gửi dữ liệu. Cách giảm rủi ro cần nhiều lớp: phân biệt instruction với dữ liệu, giới hạn context được phép, kiểm tra schema output, xác thực lại tool arguments, allowlist hành động, sandbox và log có bảo vệ. Đừng đặt API key vào prompt hoặc để model tự quyết định người dùng có quyền gì.

Pseudocode sau mô tả một boundary, **không phải bộ lọc prompt injection đã được chứng minh đầy đủ**:

```text
proposal = model(untrusted_context, user_question)
validate_schema(proposal)
principal = authenticated_request.user
authorize(principal, proposal.operation, proposal.resource)
if operation_has_external_effect:
    require_explicit_user_approval_for_the_concrete_action()
execute_with_minimum_scoped_permissions(proposal)
```

Quyền phải đến từ session/policy đáng tin, không từ một trường `role=admin` trong output model. Delimiter hay một câu system prompt không thay thế authorization. Regex chặn một vài cụm từ cũng không xử lý mọi cách mã hóa, ngôn ngữ hoặc tấn công nhiều bước.

## Bộ kiểm thử tối thiểu và vận hành
Thêm case tài liệu giả mạo instruction; nguồn đúng nhưng chứa dữ liệu riêng tư; câu hỏi yêu cầu vượt ACL; citation không tồn tại; output JSON sai schema; tool argument có resource ngoài phạm vi; nội dung vô hại chỉ thảo luận về tấn công. Ca sau giúp tránh chặn quá mức. Đánh giá end-to-end trong sandbox bằng dữ liệu giả lập được ghi rõ, không gửi dữ liệu người dùng thật cho một dịch vụ đánh giá ngoài khi chưa có quyền.

Theo dõi regression theo phiên bản và xem lỗi thủ công. Đổi model, prompt hoặc index đều có thể làm thay hành vi. Cơ chế báo lỗi, rollback và tắt hành động nguy hiểm cần tồn tại ngoài mô hình. Bài này không cung cấp một chứng nhận an toàn hay một tỷ lệ “chống injection” phổ quát.

## Bài tập tự đánh giá
1. Hệ trả lời 40/100 câu và đúng 36 câu trong số đó: coverage và accuracy có điều kiện?
2. Vì sao một citation ID có trong context chưa chứng minh claim đúng?
3. Thiết kế kiểm thử boundary xác nhận server từ chối yêu cầu vượt quyền trong các ca đã định nghĩa; không suy ra an toàn trên mọi đầu vào.

## Đáp án và tiêu chí chấm
1. Coverage 0.4; accuracy trên câu đã trả lời 0.9. Cần đánh giá refusal riêng, không chỉ báo 90% (2 điểm).
2. ID đúng không bảo đảm đoạn trích hỗ trợ claim, còn cần version/ngữ cảnh và kiểm tra nội dung (3 điểm).
3. Cho model đề xuất operation/resource không được phép bằng dữ liệu kiểm thử; server policy phải từ chối độc lập output, không thực hiện tác dụng ngoài và có log an toàn (5 điểm).

## Tổng kết
Báo coverage, chất lượng có điều kiện và các slice quan trọng; kiểm tra cả nội dung và tác dụng của tool. Model đề xuất hành động, còn quyền thực thi thuộc hệ thống đáng tin.

## Nguồn tham khảo
- [Indirect Prompt Injection, Greshake và cộng sự](https://arxiv.org/abs/2302.12173).
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).
- [Model Cards for Model Reporting](https://arxiv.org/abs/1810.03993).

Đối chiếu ngày 27/10/2026. Ranh giới quyền là nguyên tắc kỹ thuật; đánh giá LLM và phòng chống injection vẫn là lĩnh vực đang phát triển, cần kiểm tra theo threat model cụ thể.
