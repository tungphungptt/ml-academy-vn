**Cấp độ:** Beginner · **Tiên quyết:** Linear Regression, Logistic Regression.
**Mục tiêu:** hiểu và chọn hàm mất mát: MSE, MAE, Huber, Binary Cross-Entropy, Cross-Entropy.

## Vấn đề thực tế
Hàm mất mát biến "mô hình sai bao nhiêu" thành một con số để thuật toán tối ưu giảm dần. Chọn loss khác nhau nghĩa là chọn cách "phạt" lỗi khác nhau.

## Công thức
Với sai số $e=\hat y-y$:
$$\text{MSE}=e^2,\qquad \text{MAE}=|e|,\qquad \text{Huber}_\delta=\begin{cases}\tfrac12e^2&|e|\le\delta\\ \delta\big(|e|-\tfrac12\delta\big)&|e|>\delta\end{cases}$$
$$\text{BCE}=-\big[y\ln p+(1-y)\ln(1-p)\big],\qquad \text{CE}=-\ln p_y$$
MSE phạt rất nặng lỗi lớn (nhạy với ngoại lai); MAE phạt đều hơn (bền hơn nhưng gradient không đổi); Huber kết hợp cả hai. BCE dùng cho phân loại nhị phân với $p$ là xác suất dự đoán lớp 1; CE dùng cho đa lớp, $p_y$ là xác suất của lớp đúng.

![So sánh MSE, MAE và Huber](/img/loss-functions.svg)

## Ví dụ từng bước
$y=3,\hat y=5$ ($e=2$): MSE (dạng $e^2$) $=4$, MAE $=2$, Huber với $\delta=1$ $=1\cdot(2-0.5)=1.5$. BCE khi $y=1,p=0.8$: $-\ln0.8\approx0.2231$; khi $y=0,p=0.8$: $-\ln0.2\approx1.6094$ (dự đoán tự tin nhưng sai bị phạt nặng). Với 4 sai số $(1,1,1,10)$: MSE trung bình $=25.75$, MAE trung bình $=3.25$: một ngoại lai chi phối MSE.

## Code và cách chạy
```python
from math import log
e = 2
print([e ** 2, abs(e), 1 * (abs(e) - 0.5), round(-log(0.8), 4), round(-log(0.2), 4)])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[4, 2, 1.5, 0.2231, 1.6094]`.
```python
import numpy as np
e = np.array([1.0, 1.0, 1.0, 10.0])
print(float(np.mean(e ** 2)), float(np.mean(np.abs(e))))
```
Kết quả kỳ vọng (đã chạy cục bộ): `25.75 3.25`.

## Lỗi thường gặp
Dùng MSE cho phân loại; đưa softmax rồi lại đưa vào loss đã gồm softmax; quên rằng loss tối ưu không nhất thiết là metric báo cáo (ví dụ tối ưu CE nhưng báo cáo F1).

## Bài tập
1. (Dễ) Tính MAE và MSE của $e=-3$. 2. (Vừa) Vẽ Huber với $\delta=1$ và $\delta=2$. 3. (Khó) Chứng minh gradient của BCE theo $z$ (logit) là $p-y$.

## Tóm tắt
MSE nhạy ngoại lai, MAE bền, Huber dung hòa; BCE/CE là loss chuẩn cho phân loại.
