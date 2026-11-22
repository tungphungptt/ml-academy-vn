# Điều tra Transfer: kết quả Windows và baseline lịch sử

Lượt tiếp sau final polish, ngày **28/10/2026**. Giữ nguyên `content/labs.json`, source lab và output notebook; không sửa expected, không nới tolerance và không lựa chọn cấu hình theo accuracy test.

[Đối chiếu provenance bổ sung](neuralclone-transfer-provenance.json) lưu hash cả CNN/Transfer, baseline notebook/kernel versions và delta logits giữa các lần chạy. Đây là phép tổng hợp artifact đã có, không được tính thành các lượt training mới.

## Kết luận có bằng chứng

Chưa tái hiện được baseline fine-tune **0,9306**. Năm lần chạy có kiểm soát đều có **334/360 mẫu đúng**, frozen **330/360**. Ba lần mặc định trùng toàn bộ checkpoint, logits và predictions. Hai lần tắt oneDNN làm trọng số/logits thay đổi nhưng không làm đổi nhãn dự đoán của bất kỳ mẫu test nào trong phép đối chiếu hiện tại.

Không phát hiện lỗi split, preprocessing, seed, chọn checkpoint hoặc chế độ đánh giá trong các bước đã kiểm tra. **Chưa xác định được nguyên nhân lịch sử của sai lệch.** Handoff không chứa prediction/logit/checkpoint của lần baseline hoặc build/backend metadata đầy đủ; không đủ bằng chứng quy nguyên nhân cho riêng Windows, Python hay oneDNN.

## Nguồn gốc baseline và source

Baseline được lưu trong:

- `content/labs.json`, mục `transfer_cpu.verification.library`: Python 3.12.14, NumPy 2.3.5, pandas 2.2.3, Matplotlib 3.10.8, scikit-learn 1.8.0, PyTorch 2.14.1+cpu.
- `public/notebooks/transfer_cpu_library.ipynb`: source cell và stdout CNN/Transfer.
- `docs/curriculum-notebook-execution.json`: kernel IPython đã thực thi, một cell, stdout fine-tune 0,9306; runtime nbformat 5.10.4, nbclient 0.10.2, ipykernel 6.30.1.
- Báo cáo curriculum trước mô tả môi trường Linux/Python 3.12.14. Đó là bằng chứng lịch sử, không phải lần tái chạy Linux trong lượt này.

Hash source thô ban đầu khác do CRLF trên Windows. Sau chuẩn hóa line ending sang LF:

| Source | SHA-256 LF hiện tại / hash verification / source cell notebook |
| --- | --- |
| Transfer | Cùng `27f9b7547d1d660b992942f7a7224220c95afb07b4b93bf96b8faf235beee811` |
| CNN được pretrain | Cùng `810e7844efad8ea354eb0d2fb108643a5108e7ff2f9e5cf4ea015e72abdd6a02` |

Vì vậy không dùng khác biệt hash CRLF/LF làm bằng chứng thuật toán đã đổi. Không tìm thấy prediction/logit hoặc checkpoint baseline trong các artifact bàn giao đã rà soát. Các checkpoint `.local/transfer-investigation/*/cnn.pt` là **mới tạo trong lượt này**, không giả là checkpoint lịch sử.

## Protocol đã kiểm tra

- Digits đi kèm scikit-learn: 1.797 ảnh 8×8, 10 nhãn. `X.reshape(-1,1,8,8)/16`, tensor float32; nhãn đích là `digit % 2`. Không augmentation trong các lần chạy này.
- Split theo indices, `test_size=.2`, `random_state=17`, stratify theo digit; train/validation chia tiếp `random_state=18`, giữ 1.149/288/360. Train/validation/test không giao nhau. Hash dữ liệu, tensor đã xử lý, nhãn và indices ba split được lưu trong JSON.
- CNN: torch seed 17, NumPy generator 17, AdamW và scheduler như source; checkpoint theo validation, best epoch 16. Checkpoint được tạo trong cùng lần chạy, nạp CPU với `weights_only=True`, reload assertion đạt.
- Transfer: torch seed 53, NumPy generator 53. Head mới train 12 epoch với backbone đóng băng; fine-tune 12 epoch với LR thân 0,001/head 0,005. Freeze assertion đạt. Cả hai checkpoint được xác nhận là trạng thái có validation loss nhỏ nhất, không chọn bằng test.
- Môi trường hiện tại: Windows 11 build 26300, Python 3.12.10, Torch 2.14.1+cpu, CPU AMD/AVX2, một intra-op thread, 8 inter-op threads, deterministic algorithms bật, float32 matmul precision `highest`. NumPy/pandas/Matplotlib/sklearn giống các version baseline ghi; SciPy hiện tại 1.18.1, phiên bản SciPy baseline không được ghi.
- Torch build hiện tại: MSVC, Intel MKL 2026.1, oneDNN 3.12.0; git build ID và toàn bộ cấu hình được lưu. Handoff không lưu các giá trị tương ứng của baseline.
- `net.eval()`, `frozen.eval()` và `torch.no_grad()` khi đo; đếm trực tiếp `argmax(logits) == target`, không suy số mẫu đúng từ accuracy làm tròn ở lần chạy mới.

## Các lần chạy mới

Ma trận được ấn định trước: **3 lần mặc định, 2 lần tắt oneDNN**. Mỗi lần là process riêng, artifacts riêng; instrumentation chỉ quan sát validation/state load và giữ nguyên kết quả số học của các hàm gốc.

| Lần | oneDNN | Đúng/tổng | Frozen đúng/tổng | So với default-1 |
| --- | --- | --- | --- | --- |
| default-1 | Bật | 334/360 | 330/360 | Tham chiếu |
| default-2 | Bật | 334/360 | 330/360 | Cùng data/split/checkpoint/logits/predictions |
| default-3 | Bật | 334/360 | 330/360 | Cùng data/split/checkpoint/logits/predictions |
| mkldnn-off-1 | Tắt | 334/360 | 330/360 | Cùng data/split, checkpoint/logits khác, 0 nhãn khác |
| mkldnn-off-2 | Tắt | 334/360 | 330/360 | Cùng data/split, checkpoint/logits khác, 0 nhãn khác |

Delta logit lớn nhất giữa `mkldnn-off-1` và `default-1` là khoảng **2,03×10⁻⁶**. Giá trị này mô tả đúng các lần chạy đã quan sát, không phải tolerance mới hoặc chứng minh mức sai số tối đa trên nền tảng khác.

Ở `default-1`, checkpoint frozen/fine-tune đều chọn epoch 12; validation loss lần lượt khoảng 0,1706838459 và 0,1332399696. Hash state được kiểm tra tại lúc restore, khớp epoch được chọn. [JSON đầy đủ](neuralclone-transfer-investigation.json) chứa cả timeline, tensor hashes và 360 hàng `{datasetIndex, digit, target, prediction, frozenPrediction, logits}` cho từng lần chạy.

Chạy CLI gốc không instrumentation tiếp tục in 0,9278/0,9167. Chạy notebook bằng kernel riêng trong lượt này cũng cho cùng stdout; notebook **thực thi thành công nhưng strict comparison thất bại**, exit code 1, vì output lịch sử vẫn 0,9306. [Kết quả kernel mới](neuralclone-transfer-notebook-review.json). Không trình bày kết quả 6/7 notebook ở lượt trước thành kết quả vừa chạy; lượt này chạy riêng notebook Transfer.

## So sánh với baseline: điều gì biết và chưa biết

Với 360 mẫu và accuracy baseline in bốn chữ số 0,9306, số nguyên đúng tương ứng là **335/360**. Đây là **suy ra từ số đã làm tròn và kích thước tập test**, không phải raw count mới lấy từ baseline. Số mẫu đúng hiện tại được đếm trực tiếp là **334**.

**Chênh một mẫu đúng không chứng minh chỉ một prediction thay đổi.** Thiếu vector prediction baseline nên chưa thể xác định dataset index nào khác, hoặc có bao nhiêu nhãn đổi qua lại giữa đúng/sai. Không gán một mẫu “gần biên” hiện tại thành mẫu đã đổi trong lịch sử. Giữa năm lần chạy hiện tại, phép join theo `datasetIndex` xác nhận 0 prediction khác nhau; việc này không thay thế so với baseline.

26 index hiện tại dự đoán sai ở default-1, theo thứ tự test: `1253, 1627, 1337, 1611, 607, 912, 818, 122, 1210, 1344, 997, 1737, 1279, 558, 1401, 267, 144, 253, 1233, 374, 693, 237, 1256, 1709, 746, 615`. Đây là metadata của dataset học thuật, không phải dữ liệu người học.

Đã loại được trong phạm vi phép thử: source/dependency CNN khác về nội dung, thiếu/nhầm checkpoint cũ, split giao nhau, nhầm chế độ eval và kết quả Windows thay đổi giữa các process mặc định. Chưa loại được khác biệt build/compiler/backend/nền tảng của baseline vì thiếu metadata tương ứng. Bật/tắt oneDNN trên máy hiện tại **không tái hiện 335/360**, nên không kết luận oneDNN là nguyên nhân lịch sử.

Docker CLI có sẵn nhưng Docker Linux daemon không hoạt động; không tự khởi động dịch vụ hoặc cài subsystem Windows. Chưa có host Linux baseline để replay chính xác. Tài liệu [PyTorch Reproducibility](https://docs.pytorch.org/docs/2.14/notes/randomness.html) nêu phạm vi bảo đảm tái lập; tài liệu đó là bối cảnh, không phải bằng chứng xác định nguyên nhân của ca này.

## Tái hiện

```powershell
$env:PYTHONUTF8='1'
.local/polish-cpu/Scripts/python.exe -X utf8 scripts/investigate_transfer.py
.local/polish-cpu/Scripts/python.exe -X utf8 scripts/check_notebooks.py public/notebooks/transfer_cpu_library.ipynb --report docs/neuralclone-transfer-notebook-review.json
```

Lệnh thứ hai vẫn trả exit code 1 khi so với output lịch sử. Thư viện dùng môi trường đã pin từ runbook CPU; không dùng interpreter của web app. Muốn truy nguyên tiếp cần artifact gốc có predictions/logits, data/split hashes, checkpoint tensors và Torch build/CPU/backend flags. Giữ các artifact mới để các lần sau có thể so theo mẫu thay vì chỉ so accuracy.
