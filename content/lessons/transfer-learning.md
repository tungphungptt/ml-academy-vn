**Cấp độ:** Advanced · **Tầng:** Intermediate · **Tiên quyết:** Thực hành CNN thật trên CPU với Digits, Optimizers.
**Mục tiêu:** hiểu khi nào và làm thế nào tái sử dụng mô hình đã huấn luyện sẵn (pretrained).

## Vấn đề thực tế
Huấn luyện mạng sâu từ đầu cần nhiều dữ liệu và tính toán. Các lớp đầu của mạng đã học đặc trưng tổng quát (cạnh, kết cấu) dùng lại được cho bài toán mới.

## Hai chiến lược
**Trích xuất đặc trưng (feature extraction):** đóng băng toàn bộ phần thân đã pretrained, chỉ huấn luyện lớp đầu ra mới. **Fine-tuning:** mở khóa một phần hoặc toàn bộ thân và huấn luyện tiếp với learning rate nhỏ (thường nhỏ hơn cho phần thân so với phần đầu ra mới) để không phá hỏng đặc trưng đã học. Ít dữ liệu: ưu tiên đóng băng; nhiều dữ liệu và khác miền hơn: fine-tune nhiều lớp hơn.

![Đóng băng thân và huấn luyện lớp mới](/img/transfer-learning.svg)

## Ví dụ từng bước
Thay lớp phân loại cuối của một mạng có đặc trưng 512 chiều bằng lớp tuyến tính cho 10 lớp mới: số tham số cần huấn luyện là $512\cdot10+10=5130$, rất nhỏ so với toàn mạng.

## Code và cách chạy
```python
print(512 * 10 + 10)
```
Kết quả kỳ vọng (đã chạy cục bộ): `5130`.

Mẫu PyTorch/torchvision (**chưa được chạy trong môi trường phát triển**; cần `pip install torch torchvision` và Internet để tải trọng số):
```python snippet
import torch.nn as nn
from torchvision import models
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
for p in model.parameters():
    p.requires_grad = False                      # đóng băng thân mạng
model.fc = nn.Linear(model.fc.in_features, 10)   # lớp đầu ra mới, được huấn luyện
```

## Lỗi thường gặp
Quên chuẩn hóa ảnh theo đúng thống kê mà mô hình pretrained dùng; dùng learning rate lớn khi fine-tune; quên đưa mô hình sang chế độ `eval()` khi suy luận (ảnh hưởng BatchNorm, Dropout); bỏ qua giấy phép của trọng số pretrained.

## Ưu điểm, hạn chế
Cần ít dữ liệu và thời gian. Hiệu quả giảm nếu miền dữ liệu quá khác miền pretrained.

## Bài tập
1. (Dễ) Đếm tham số lớp đầu ra mới cho 5 lớp từ đặc trưng 2048 chiều. 2. (Vừa) So sánh đóng băng và fine-tune trên tập dữ liệu nhỏ. 3. (Khó) Dùng learning rate khác nhau cho thân và đầu ra bằng `param_groups`.

## Tóm tắt
Tái sử dụng đặc trưng đã học: thay đầu ra, đóng băng hoặc fine-tune tùy lượng dữ liệu.

## Điều kiện áp dụng và kiểm tra kết luận
requires_grad=False chỉ ngăn gradient của tham số, không ngăn BatchNorm running stats cập nhật khi model.train(). Khi feature extraction với ít dữ liệu, cần quản lý train/eval của thân riêng; chỉ optimizer những tham số cần học. Fine-tuning nên dùng LR nhỏ cho thân, có thể khác LR head qua param_groups. Tiền xử lý phải khớp pretrained model và license của weights/dataset phải được kiểm tra; không giả định mọi pretrained checkpoint được tái phân phối tự do. Thí nghiệm checkpoint tự huấn luyện trên Digits bên dưới tránh tải pretrained ngoài, nhưng không thay thế đánh giá transfer khác miền trên ImageNet.

## Đáp án và tiêu chí chấm
1. Head 2048→5 có $2048\cdot5+5=10245$ tham số. (2 điểm).
2. Giữ cùng dữ liệu và validation protocol, pretrain chỉ trên train, so frozen/fine-tune với baseline và ghi số tham số trainable. Không freeze một backbone khởi tạo ngẫu nhiên rồi mô tả nó là pretrained. (3 điểm).
3. Một group cho head LR lớn hơn và một group cho backbone LR nhỏ hơn, chỉ gồm tham số requires_grad phù hợp. Kiểm tra backbone weights không đổi khi freeze; BatchNorm/Dropout mode cũng phải được quản lý. (5 điểm).

## Nguồn tham khảo
- [Stanford CS231n: Transfer Learning](https://cs231n.github.io/transfer-learning/).
- [PyTorch Tutorials: Transfer Learning](https://docs.pytorch.org/tutorials/).

## Thực nghiệm feature extraction và fine-tuning trên CPU
Chạy `python labs/transfer_cpu/library.py` tại gốc repository, hoặc mở [lab transfer](/lab?lab=transfer_cpu). Script pretrain CNN phân loại 10 chữ số **chỉ trên train**, rồi chuyển cùng miền sang nhãn chẵn/lẻ (`digit % 2`). Không tải pretrained weights; đây là chuyển nhiệm vụ cùng miền, không phải bằng chứng về transfer ImageNet sang miền khác.

Giữ split 1.149 train / 288 validation / 360 test của CNN. Head mới có $128\cdot2+2=258$ tham số; backbone có 80 tham số. Huấn luyện head đóng băng 12 epoch rồi fine-tune 12 epoch với backbone LR=0,001, head LR=0,005. Validation chọn checkpoint mỗi giai đoạn; script assert toàn bộ weights backbone không đổi ở giai đoạn frozen. Chỉ sau khi chọn checkpoint mới đo test của hai giao thức đã định trước.

Kết quả CPU thực đo: frozen accuracy **0,9167**, fine-tune **0,9306**; assertion backbone không đổi đạt. Các số này ở một seed/split, không chứng minh cải thiện có ý nghĩa thống kê. Nếu lựa chọn giữa hai giao thức dựa trên test rồi lặp lại thí nghiệm, cần test mới. Với CNN có BatchNorm/Dropout, frozen weights vẫn chưa đủ: cần quản lý mode của backbone như phần trên.
