**Cấp độ:** Intermediate · **Tiên quyết:** Logistic Regression.
**Mục tiêu:** hiểu softmax, cross-entropy đa lớp và gradient $p-y$.

## Vấn đề thực tế
Phân loại nhiều hơn hai lớp (ví dụ chữ số 0-9) cần một phân phối xác suất trên $K$ lớp.

## Công thức
$$p_k=\frac{e^{z_k}}{\sum_j e^{z_j}},\qquad L=-\ln p_y,\qquad \frac{\partial L}{\partial z_k}=p_k-\mathbb 1[k=y]$$
$z_k=\mathbf w_k^\top\mathbf x+b_k$ là điểm của lớp $k$, $y$ là lớp đúng. Để tránh tràn số, trừ $\max_j z_j$ khỏi mọi $z$ trước khi lấy mũ (kết quả không đổi).

![Logits và xác suất softmax](/img/softmax-regression.svg)

## Ví dụ từng bước
$z=(2,1,0)$, lớp đúng là 0: $p\approx(0.6652,0.2447,0.0900)$, $L=-\ln0.6652\approx0.4076$, gradient theo $z$ là $(-0.3348,0.2447,0.0900)$: tăng $z_0$, giảm hai điểm còn lại.

## Code và cách chạy
```python
import numpy as np
z = np.array([2.0, 1.0, 0.0]); e = np.exp(z - z.max()); p = e / e.sum()
print(p.round(4).tolist())
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.6652, 0.2447, 0.09]`.

## Lỗi thường gặp
Tính softmax không ổn định số; dùng softmax rồi lại đưa vào loss đã gồm softmax (như `CrossEntropyLoss` của PyTorch nhận logits).

## Ưu điểm, hạn chế, so sánh
Mở rộng tự nhiên của Logistic Regression ($K=2$ cho kết quả tương đương). Vẫn là ranh giới tuyến tính. Chưa có lab riêng cho bài này.

## Bài tập
1. (Dễ) Tính softmax của $(0,0,0)$. 2. (Vừa) Kiểm tra softmax không đổi khi cộng hằng số vào $z$. 3. (Khó) Cài huấn luyện softmax regression bằng gradient $p-y$.

## Tóm tắt
Softmax chuẩn hóa điểm thành xác suất; gradient của cross-entropy theo logits là $p-y$.
