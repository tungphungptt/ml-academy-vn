**Cấp độ:** Advanced · **Tầng:** Intermediate · **Tiên quyết:** LLM foundations, Transfer Learning, Không gian vector và SVD.
**Mục tiêu:** tính shape/số tham số của LoRA, hiểu giới hạn lượng tử hóa và phân biệt ví dụ đại số với một thí nghiệm fine-tuning hoàn chỉnh.

## Khi không đủ tài nguyên để cập nhật mọi trọng số
Một tổ chức muốn mô hình trả lời theo định dạng nghiệp vụ, nhưng không cần học lại toàn bộ ngôn ngữ. Full fine-tuning cập nhật nhiều weights và cần lưu gradient, optimizer states, activation. PEFT chỉ huấn luyện một phần/thành phần bổ sung; LoRA là một phương pháp phổ biến, không phải tên gọi chung cho mọi PEFT.

Trước khi chọn fine-tuning, kiểm tra prompt đơn giản hoặc RAG có giải quyết nhu cầu không. Định dạng/phong cách và tác vụ nhất quán có thể phù hợp fine-tuning; dữ kiện thay đổi thường cần nguồn cập nhật. Fine-tuning không tự loại hallucination hoặc thay thế kiểm tra giấy phép, dữ liệu và đánh giá.

## LoRA: cập nhật hạng thấp
Với $W_0\in\mathbb R^{d_{out}\times d_{in}}$ cố định, LoRA cơ bản đặt:

$$
W=W_0+\frac{\alpha}{r}BA,\quad
A\in\mathbb R^{r\times d_{in}},\quad B\in\mathbb R^{d_{out}\times r}.
$$

Một layer có $r(d_{in}+d_{out})$ tham số adapter thay vì $d_{in}d_{out}$ weights gốc, chưa tính bias hay module khác được mở huấn luyện. Cách thường dùng là khởi tạo $A$ ngẫu nhiên, $B=0$ để delta ban đầu bằng 0; đây không phải việc chạy SVD trên chính ma trận trọng số rồi giữ vài singular value. Biến thể LoRA có thể đổi scaling/khởi tạo; luôn ghi đúng cấu hình.

![Một nhánh trọng số cố định và một nhánh cập nhật LoRA](/img/efficient-finetuning.svg)

## Kiểm chứng số tham số và phép merge
Với ma trận $4096\times4096$, rank 8 cho 65.536 tham số adapter so với 16.777.216 weights của layer. Con số này chỉ thuộc layer đã chọn, không phải tỷ lệ bộ nhớ của cả hệ thống.

```python
import numpy as np
din, dout, rank = 4096, 4096, 8
full, adapter = din*dout, rank*(din+dout)
print(full, adapter, round(100*adapter/full, 6))
W = np.arange(12, dtype=float).reshape(3, 4) / 10
A = np.array([[1., 0., -1., 0.25]])
B = np.array([[0.1], [0.2], [-0.1]])
x = np.array([1., 2., 3., 4.])
scale = 2.0
separate = W @ x + scale * (B @ (A @ x))
merged = (W + scale * B @ A) @ x
print(bool(np.allclose(separate, merged)))
```

Kết quả: `16777216 65536 0.390625` và `True`. Ví dụ kiểm tra đại số của merge, **không train adapter hay chạy một LLM**. Merge làm thay đổi artifact triển khai; cần base model, tokenizer, revision và adapter đúng cặp. Lượng tử hóa có thể khiến merge/re-quantize không tương đương số học chính xác như float toy này.

## Quantization và QLoRA khác nhau ở đâu?
Quantization biểu diễn số bằng ít mức hơn. Mô hình đối xứng đơn giản dùng $q=\operatorname{clip}(\operatorname{round}(w/s),-Q,Q)$ và $\hat w=sq$. Scale, zero point, bit-width, granularity và outlier ảnh hưởng sai số. Không phải mọi “4-bit” đều dùng cùng codebook hoặc cùng compute dtype.

```python
import numpy as np
w = np.array([-1., -0.4, 0.2, 0.9])
Q = 7
scale = np.max(np.abs(w)) / Q
q = np.clip(np.rint(w/scale), -Q, Q).astype(int)
restored = scale * q
print(q.tolist(), restored.round(4).tolist())
print(round(float(np.max(np.abs(w-restored))), 4))
```

Kết quả: `[-7, -3, 1, 6] [-1.0, -0.4286, 0.1429, 0.8571]` và `0.0571`. Đây là uniform quantization toy, **không phải NF4**. QLoRA kết hợp base model lượng tử hóa cố định với adapter huấn luyện; paper gốc còn mô tả NF4, double quantization và paged optimizers. Không suy “4-bit” nghĩa là gradient, activation và mọi phép nhân đều chạy 4-bit.

## Thiết kế thí nghiệm thực tế
Giữ train/validation/test tách theo người dùng/nguồn/thời gian phù hợp, tránh câu gần trùng lọt giữa split. So base model, prompt/RAG baseline và adapter trên cùng rubric. Ghi target modules, rank, alpha, dropout, learning rate, seed, dtype, batch/accumulation, tokenizer và license. Báo chất lượng, peak memory và latency thật; giảm weights không bảo đảm tăng tốc trên mọi backend.

Adapter nhỏ vẫn có thể ghi nhớ dữ liệu riêng tư hoặc làm giảm năng lực khác. Khi triển khai, khóa base revision, kiểm thử load/reload và rollback, không chỉ giữ một file adapter không nguồn gốc. Ví dụ tải mô hình nhiều GB/GPU không được trình bày như code đã kiểm chứng trong browser của NeuralClone.

## Lỗi thường gặp khi diễn giải kết quả
Phép merge cho cùng output trong ví dụ chỉ kiểm tra đẳng thức đại số, không chứng minh adapter cải thiện chất lượng. Rank thấp không đồng nghĩa mô hình không thể ghi nhớ dữ liệu; base model đóng băng vẫn cần kiểm tra license và điều kiện sử dụng. Khi so quantization, phải giữ cùng tập đánh giá và đo cả chất lượng lẫn tài nguyên trên backend đích, thay vì dùng tỷ lệ số tham số làm tỷ lệ tăng tốc.

## Bài tập tự đánh giá
1. Tính số tham số adapter cho $d_{in}=1024,d_{out}=2048,r=4$.
2. Vì sao giảm bit-width weights không giảm mọi loại bộ nhớ cùng tỷ lệ?
3. Viết protocol phân biệt lợi ích LoRA với việc đổi prompt hoặc thêm dữ liệu.

## Đáp án và tiêu chí chấm
1. $4(1024+2048)=12\,288$, chưa tính bias/module khác (2 điểm).
2. Còn activation, KV cache, gradient/optimizer adapter, scale/metadata và workspace kernel; phụ thuộc runtime (3 điểm).
3. Giữ base/split/prompt/eval, thay một yếu tố, đo chất lượng và tài nguyên, không tuning trên test; ghi revision và recipe để tái lập (5 điểm).

## Tổng kết
LoRA giảm số tham số cập nhật ở các layer được chọn; quantization giảm độ chính xác biểu diễn theo một recipe riêng. Đo chất lượng và tài nguyên thực, không biến phép tính toy thành tuyên bố đã train LLM.

## Nguồn tham khảo
- [LoRA, Hu và cộng sự](https://arxiv.org/abs/2106.09685).
- [QLoRA, Dettmers và cộng sự](https://arxiv.org/abs/2305.14314).
- [Hugging Face PEFT: LoRA, nhánh main](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora).
- [Transformers: bitsandbytes quantization](https://huggingface.co/docs/transformers/quantization/bitsandbytes).

Đối chiếu ngày 27/10/2026. Link PEFT main là tài liệu đang phát triển; API/version/backend cần pin khi làm thí nghiệm thật, không coi ví dụ đại số này là benchmark paper.
