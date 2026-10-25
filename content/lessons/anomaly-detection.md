**Cấp độ:** Intermediate · **Tiên quyết:** Xác suất cơ bản, PCA.
**Mục tiêu:** phát hiện giá trị bất thường bằng z-score, IQR và z-score bền vững (median/MAD), và hiểu vì sao ngoại lai có thể "che giấu" chính nó.

## Vấn đề thực tế
Phát hiện giao dịch gian lận, lỗi cảm biến, hoặc dòng log tấn công mạng: các mẫu hiếm khác hẳn phần còn lại và thường không có nhãn.

## Công thức
$$z=\frac{x-\mu}{\sigma},\qquad \text{IQR}=Q_3-Q_1,\qquad \text{ngoại lai nếu } x<Q_1-1.5\,\text{IQR}\ \text{hoặc}\ x>Q_3+1.5\,\text{IQR}$$
$$z^{\text{rob}}=\frac{0.6745\,(x-\operatorname{median})}{\operatorname{MAD}},\qquad \operatorname{MAD}=\operatorname{median}\big(|x_i-\operatorname{median}|\big)$$
Quy tắc thường dùng: $|z|>3$ là bất thường. Vấn đề: $\mu$ và $\sigma$ bị chính ngoại lai kéo lệch.

![Ngoại lai trên trục số](/img/anomaly-detection.svg)

## Ví dụ từng bước
Dữ liệu $(10,11,9,10,12,50)$: $\mu=17$, $\sigma\approx14.79$ nên $z(50)\approx2.23<3$: quy tắc $|z|>3$ **bỏ sót** giá trị 50. IQR: $Q_1=10,Q_3=11.75$, giới hạn trên $14.375$, nên 50 bị phát hiện. Median $=10.5$, MAD $=1$, $z^{\text{rob}}(50)\approx26.64$.

## Code và cách chạy
```python
import numpy as np
x = np.array([10, 11, 9, 10, 12, 50.0])
q1, q3 = np.percentile(x, [25, 75]); lo, hi = q1 - 1.5 * (q3 - q1), q3 + 1.5 * (q3 - q1)
print(round(float(((x - x.mean()) / x.std()).max()), 2), x[(x < lo) | (x > hi)].tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `2.23 [50.0]`.

## Lỗi thường gặp
Dùng ngưỡng 3 một cách máy móc cho dữ liệu ít; dùng z-score khi dữ liệu không xấp xỉ chuẩn; xóa ngoại lai mà không tìm hiểu nguyên nhân (đôi khi đó chính là tín hiệu cần tìm).

## Các hướng khác
Isolation Forest, One-Class SVM, Autoencoder (lỗi tái tạo lớn nghĩa là bất thường). Dữ liệu mất cân bằng nên đánh giá bằng Precision/Recall, không dùng accuracy.

## Bài tập
1. (Dễ) Tính IQR của $(1,2,3,4,100)$. 2. (Vừa) Thêm một ngoại lai thứ hai và xem z-score thay đổi thế nào. 3. (Khó) Dùng `IsolationForest` trên dữ liệu 2 chiều và vẽ vùng bất thường.

## Tóm tắt
z-score nhạy với chính ngoại lai; IQR và median/MAD bền vững hơn.
