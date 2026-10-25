**Cấp độ:** Advanced · **Tiên quyết:** CNN, Optimizers.
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
```python
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
