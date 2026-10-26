**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Automatic Differentiation (Autograd), Optimizers.
**Mục tiêu:** chẩn đoán loss không giảm, NaN và gradient bất thường; chọn khởi tạo, normalization, split và metric có căn cứ.

## Bắt đầu từ hợp đồng, không bắt đầu từ mạng lớn
Kiểm tra một minibatch: shape, dtype, khoảng giá trị, nhãn, số lớp và thứ tự cột. Với CrossEntropyLoss đa lớp, logits có shape $(N,C)$ và nhãn nguyên `long` có shape $(N,)$ trong $[0,C-1]$. Không softmax trước loss. Với BCEWithLogitsLoss, target float phải cùng shape logits. Nếu loss ngay bước đầu không hữu hạn, kiểm tra dữ liệu/target trước khi thay optimizer.

Một batch là số mẫu của một cập nhật; một epoch duyệt hết train, không phải một gradient step. Batch size ảnh hưởng số step, nhiễu và thống kê BatchNorm; khi đổi batch size, lịch learning rate tính theo step không còn cùng ý nghĩa. Ghi learning curves train và validation cùng đơn vị/reduction, đừng so tổng loss của hai tập khác kích thước.

## Khởi tạo và gradient
Khởi tạo mọi neuron giống nhau giữ đối xứng và cản trở học đặc trưng khác nhau. Với ReLU và giả định độc lập/scale thích hợp, He dùng variance gần $2/fan\_in$; Xavier dùng gần $2/(fan\_in+fan\_out)$ cho các activation phù hợp. Đây là kiểm soát scale ban đầu, không phải bảo đảm hội tụ.

Jacobian của mạng là tích các Jacobian lớp: có cả ma trận trọng số và đạo hàm activation. Dù $\sigma'(z)\le1/4$, không thể kết luận gradient toàn mạng nhỏ hơn $4^{-L}$ nếu chưa chặn norm trọng số. Theo dõi norm gradient; clipping đặt sau backward, trước optimizer step. Clipping không chữa dữ liệu NaN hoặc nhãn sai, và không sửa vanishing gradients.

## BatchNorm và LayerNorm
BatchNorm1d trên $(N,C)$ dùng thống kê mỗi cột qua batch; train cập nhật running statistics, eval dùng chúng. BatchNorm2d còn lấy thống kê qua các vị trí không gian. Batch nhỏ hoặc domain shift có thể làm thống kê kém tin cậy. LayerNorm chuẩn hóa các chiều cuối của từng mẫu/token; không dùng running batch statistics. Hai lớp không thể đổi chỗ tùy tiện dù đều chuẩn hóa.

Dropout của PyTorch nhận xác suất **bỏ** `p`; bài regularization dùng ký hiệu xác suất **giữ**. Ví dụ `nn.Dropout(.2)` tương ứng giữ 0,8. `eval()` thay đổi Dropout/BatchNorm nhưng không tự tắt autograd; suy luận vẫn dùng `no_grad()`/`inference_mode()` khi phù hợp.

## Kiểm tra interface chạy được, không phải benchmark
```python
import torch
from torch import nn
torch.manual_seed(5)
x = torch.arange(32, dtype=torch.float32).reshape(8, 4)
bn, ln = nn.BatchNorm1d(4), nn.LayerNorm(4)
a, b = bn(x), ln(x)
assert torch.allclose(a.mean(0), torch.zeros(4), atol=1e-5)
assert torch.allclose(b.mean(1), torch.zeros(8), atol=1e-5)
net = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2))
nn.init.kaiming_normal_(net[0].weight, nonlinearity='relu')
loss = nn.CrossEntropyLoss()(net(x / 32), torch.arange(8) % 2)
assert torch.isfinite(loss)
loss.backward()
norm = nn.utils.clip_grad_norm_(net.parameters(), 1.)
assert torch.isfinite(norm)
print(tuple(a.shape), tuple(b.shape), bool(torch.isfinite(loss)))
```
Kết quả kỳ vọng: `(8, 4) (8, 4) True`. Dữ liệu nhân tạo ở đây chỉ kiểm tra axes/gradient, không đo chất lượng học.

## Checklist thí nghiệm
Nếu train và validation đều cao: thử overfit một batch nhỏ để kiểm tra pipeline/gradient, kiểm tra learning rate, underfit và target. Nếu train thấp nhưng validation cao: kiểm tra leakage/shift, regularization, kích thước dữ liệu và độ phức tạp. Nếu NaN: dừng cập nhật, tìm bước đầu tạo NaN, kiểm tra log/divide/precision và giảm LR sau khi biết nguyên nhân. Không dùng test để chọn các sửa đổi.

Với mất cân bằng, xem phân phối nhãn và confusion matrix, PR-AUC/F1/recall thích hợp; trọng số lớp hoặc sampling chỉ lấy từ train. Không tự tuyên bố một metric “tốt nhất” cho mọi ứng dụng. Seed Python/NumPy/PyTorch, ghi phiên bản/device/thread; seed giống nhau không bảo đảm bitwise giống nhau trên mọi thiết bị/phiên bản.

## Bài tập tự đánh giá
1. Viết shape/dtype target CE cho batch 16, 5 lớp.
2. Giải thích BatchNorm train/eval khác LayerNorm ở đâu.
3. Loss NaN ngay batch đầu: đề xuất thứ tự kiểm tra và một invariant tự động, thay vì đổi ngẫu nhiên optimizer.

## Đáp án và tiêu chí chấm
1. Logits `(16,5)`, target `long` `(16,)`, nhãn 0–4 (2 điểm).
2. Nêu đúng axes, running statistics và dependence vào batch; `eval()` không đồng nghĩa `no_grad()` (3 điểm).
3. Kiểm tra finite input/target, range nhãn, logits, phép log/division rồi loss và gradient. Thêm assertion finite tại bước đầu lỗi; không optimizer step khi sai. Chỉ dùng train/validation để sửa và đánh giá lại (5 điểm).

## Tổng kết
Một vòng huấn luyện đáng tin cần hợp đồng dữ liệu, gradient đúng, axes normalization đúng và giao thức đánh giá tách biệt.

## Nguồn tham khảo
- [D2L: Numerical stability and initialization](https://d2l.ai/chapter_multilayer-perceptrons/numerical-stability-and-init.html).
- [D2L: Transformer, residual và LayerNorm](https://d2l.ai/chapter_attention-mechanisms-and-transformers/transformer.html).
- [PyTorch: optimization tutorial](https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html), đã đọc nguồn chính thức qua GitHub; xem audit.
