**Cấp độ:** Advanced · **Tầng:** Intermediate · **Tiên quyết:** PCA, MLP, Backpropagation.
**Mục tiêu:** hiểu autoencoder, lỗi tái tạo, và mối liên hệ với PCA.

## Vấn đề thực tế
Cần biểu diễn nén của dữ liệu không nhãn (giảm chiều, khử nhiễu, phát hiện bất thường).

## Công thức
Encoder $\mathbf z=f_\theta(\mathbf x)$ nén đầu vào về mã (bottleneck) có chiều nhỏ; decoder $\hat{\mathbf x}=g_\phi(\mathbf z)$ khôi phục:
$$L=\frac1N\sum_i\lVert\mathbf x_i-g_\phi(f_\theta(\mathbf x_i))\rVert^2$$
Ở nghiệm tối ưu toàn cục với dữ liệu đã centered (hoặc bias thích hợp), encoder/decoder tuyến tính và squared loss cho cùng không gian con chính với PCA; không bảo đảm mọi lần SGD đạt nghiệm đó. Thêm hàm kích hoạt phi tuyến cho phép học đa tạp cong. Phát hiện bất thường: mẫu có lỗi tái tạo lớn bất thường so với dữ liệu bình thường.

Với batch hàng $X$, encoder $A$ và decoder $B$ tuyến tính cho tái tạo $XAB$ có rank không quá chiều mã $k$. SVD cho chặn dưới của lỗi xấp xỉ hạng $k$; chọn $A=V_k$, $B=V_k^\top$ đạt tái tạo PCA $XV_kV_k^\top$. Đây là suy luận từ bài toán xấp xỉ hạng thấp, không phải khẳng định hai bộ weights bằng nhau. Xem nguồn SVD cụ thể bên dưới.

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

Autoencoder CPU trên Iris thật: [mở lab](/lab?lab=autoencoder_cpu), chạy từ repository root:
```bash
python labs/autoencoder_cpu/library.py
```
Dữ liệu chia 90 train, 30 validation, 30 test; scaler chỉ fit train. Mạng MLP bottleneck 2 chọn best state bằng validation. Trên PyTorch 2.14.1+cpu/sklearn 1.8.0, test MSE ở thang standardized là **0.0279**, PCA hai chiều cùng protocol là **0.0257**: AE không thắng baseline ở lần chạy này. Không so trực tiếp với MSE raw/in-sample của đoạn PCA trước đó.

## Lỗi thường gặp
Bottleneck quá rộng khiến mạng học hàm đồng nhất (không học được gì có ích); không chuẩn hóa dữ liệu; đánh giá chất lượng biểu diễn chỉ bằng lỗi tái tạo.

## Ưu điểm, hạn chế
Linh hoạt, học không giám sát. Cần dữ liệu và tinh chỉnh; mã học được không đảm bảo có cấu trúc dễ diễn giải (VAE bổ sung ràng buộc xác suất lên không gian mã).

## Bài tập
1. (Dễ) Tính lỗi tái tạo của PCA 4 chiều trên Iris (kỳ vọng 0). 2. (Vừa) Thêm nhiễu vào đầu vào (denoising autoencoder). 3. (Khó) Dùng lỗi tái tạo để phát hiện bất thường.

## Tóm tắt
Autoencoder nén rồi khôi phục dữ liệu; phiên bản tuyến tính tương đương PCA.

## Điều kiện áp dụng và kiểm tra kết luận
Tương đương PCA chỉ đúng về không gian con/projection ở nghiệm tối ưu của linear autoencoder với squared reconstruction loss, bottleneck thích hợp và dữ liệu centered (hoặc bias xử lý mean). Không nói trọng số encoder là duy nhất hoặc mọi lần SGD đã đạt global optimum. AE nonlinear học biểu diễn theo objective tái tạo, không tự là mô hình sinh có prior lấy mẫu hợp lệ; VAE thêm mô hình xác suất và KL. Lỗi tái tạo thấp không bảo đảm embedding tốt cho classification hay detector không tái tạo tốt anomaly. [Lab AE CPU](/lab?lab=autoencoder_cpu) dùng Iris thật, scale chỉ train, chọn checkpoint bằng validation rồi so test với PCA cùng pipeline.

## Đáp án và tiêu chí chấm
1. Với PCA đủ 4 chiều trên Iris và cùng convention, reconstruction error chỉ còn sai số float gần 0, không yêu cầu đúng bitwise 0. (2 điểm).
2. Denoising: input train bị nhiễu, target là input sạch, đánh giá trên dữ liệu giữ riêng. Nếu target cũng là cùng nhiễu thì không còn cùng objective khử nhiễu. (3 điểm).
3. Fit trên normal train theo protocol được nêu, chọn threshold bằng validation; đánh giá precision/recall trên anomaly test không dùng để chọn threshold. Reconstruction error lớn là score, không tự là probability anomaly. (5 điểm).

## Nguồn tham khảo
- [ML cơ bản: SVD và xấp xỉ hạng thấp](https://machinelearningcoban.com/2017/06/07/svd/) — hỗ trợ bước chặn lỗi tái tạo trong lập luận trên; đã đọc lại trong final review.
- [Dive into Deep Learning](https://d2l.ai/).
- [scikit-learn: PCA](https://scikit-learn.org/stable/modules/decomposition.html#pca).
