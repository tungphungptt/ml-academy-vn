**Cấp độ:** Advanced · **Tiên quyết:** MLP, PCA, Backpropagation.
**Mục tiêu:** hiểu autoencoder, lỗi tái tạo, và mối liên hệ với PCA.

## Vấn đề thực tế
Cần biểu diễn nén của dữ liệu không nhãn (giảm chiều, khử nhiễu, phát hiện bất thường).

## Công thức
Encoder $\mathbf z=f_\theta(\mathbf x)$ nén đầu vào về mã (bottleneck) có chiều nhỏ; decoder $\hat{\mathbf x}=g_\phi(\mathbf z)$ khôi phục:
$$L=\frac1N\sum_i\lVert\mathbf x_i-g_\phi(f_\theta(\mathbf x_i))\rVert^2$$
Nếu encoder và decoder tuyến tính và dùng loss bình phương, autoencoder học cùng không gian con với PCA. Thêm hàm kích hoạt phi tuyến cho phép học đa tạp cong. Phát hiện bất thường: mẫu có lỗi tái tạo lớn bất thường so với dữ liệu bình thường.

![Cấu trúc autoencoder](/img/autoencoder.svg)

## Ví dụ từng bước
Dữ liệu $(1,1),(2,2),(3,3)$ nằm trên một đường thẳng nên mã 1 chiều tái tạo hoàn hảo (lỗi $0$). Với Iris (4 chiều), PCA giữ $k$ thành phần cho lỗi tái tạo trung bình: $k=1:0.0856$, $k=2:0.0253$, $k=3:0.0059$: càng nhiều chiều mã, lỗi càng nhỏ.

## Code và cách chạy
Đây là đường cơ sở tuyến tính (PCA) cho autoencoder:
```python
from sklearn.datasets import load_iris
from sklearn.decomposition import PCA
import numpy as np
X = load_iris().data
errs = []
for k in (1, 2, 3):
    p = PCA(k).fit(X); errs.append(round(float(np.mean((X - p.inverse_transform(p.transform(X))) ** 2)), 4))
print(errs)
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.0856, 0.0253, 0.0059]`.

Autoencoder phi tuyến bằng PyTorch (**chưa được chạy trong môi trường phát triển**, cần `pip install torch`; hãy kiểm tra shape và loss khi chạy):
```python
import torch, torch.nn as nn
net = nn.Sequential(nn.Linear(4, 8), nn.ReLU(), nn.Linear(8, 2), nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 4))
opt = torch.optim.Adam(net.parameters(), lr=1e-2)
X = torch.randn(150, 4)  # thay bằng dữ liệu thật đã chuẩn hóa
for _ in range(200):
    opt.zero_grad(); loss = ((net(X) - X) ** 2).mean(); loss.backward(); opt.step()
```

## Lỗi thường gặp
Bottleneck quá rộng khiến mạng học hàm đồng nhất (không học được gì có ích); không chuẩn hóa dữ liệu; đánh giá chất lượng biểu diễn chỉ bằng lỗi tái tạo.

## Ưu điểm, hạn chế
Linh hoạt, học không giám sát. Cần dữ liệu và tinh chỉnh; mã học được không đảm bảo có cấu trúc dễ diễn giải (VAE bổ sung ràng buộc xác suất lên không gian mã).

## Bài tập
1. (Dễ) Tính lỗi tái tạo của PCA 4 chiều trên Iris (kỳ vọng 0). 2. (Vừa) Thêm nhiễu vào đầu vào (denoising autoencoder). 3. (Khó) Dùng lỗi tái tạo để phát hiện bất thường.

## Tóm tắt
Autoencoder nén rồi khôi phục dữ liệu; phiên bản tuyến tính tương đương PCA.
