**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Logistic Regression.
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
Mở rộng tự nhiên của Logistic Regression ($K=2$ cho kết quả tương đương). Vẫn là ranh giới tuyến tính. Có [lab Softmax riêng](/lab?lab=softmax_regression) với bản NumPy và scikit-learn ở cuối bài.

## Bài tập
1. (Dễ) Tính softmax của $(0,0,0)$. 2. (Vừa) Kiểm tra softmax không đổi khi cộng hằng số vào $z$. 3. (Khó) Cài huấn luyện softmax regression bằng gradient $p-y$.

## Tóm tắt
Softmax chuẩn hóa điểm thành xác suất; gradient của cross-entropy theo logits là $p-y$.

## Điều kiện áp dụng và kiểm tra kết luận
Các lớp loại trừ lẫn nhau cần phân phối softmax tổng bằng 1. Multi-label là bài toán khác: có thể dùng sigmoid độc lập và BCE. Với K=2, xác suất chỉ phụ thuộc chênh lệch hai logits, tương ứng sigmoid của chênh lệch đó, không phải mọi bộ trọng số đều duy nhất. Cộng cùng hằng vào logits không đổi phân phối. Khi xác suất rất nhỏ, tính CE bằng log-sum-exp trực tiếp ổn định hơn tính softmax rồi log; nhãn phải thuộc đúng K lớp.

## Đáp án và tiêu chí chấm
1. Softmax (0,0,0)=(1/3,1/3,1/3). (2 điểm).
2. Thử cộng 1000 nhưng phải trừ max trước exp; so hai vector bằng allclose thay vì bằng tuyệt đối cho float. (3 điểm).
3. Với X shape N×D, W D×K: logits=XW, P stable softmax, Y one-hot. Gradient Xᵀ(P−Y)/N; bias là mean(P−Y). Kiểm tra tổng probability và gradient bằng sai phân trên một bài nhỏ, rồi split dữ liệu trước fit. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Logistic regression (multinomial)](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression).
- [Dive into Deep Learning: Softmax Regression](https://d2l.ai/chapter_linear-classification/index.html).

## Thực hành hai cách triển khai
[Code Lab Softmax](/lab?lab=softmax_regression) có NumPy from scratch và scikit-learn. Iris 150 mẫu, chia phân tầng 105 train / 45 test, seed 42; StandardScaler chỉ fit trên train. Scratch trừ max logits, tính mean gradient của cross-entropy rồi cập nhật toàn batch; bản thư viện có regularization L2 mặc định nên không phải hai solver cho cùng một objective.

Chạy `python labs/softmax_regression/scratch.py` và `python labs/softmax_regression/library.py`. Thực đo accuracy test tương ứng **0,867** và **0,911**. Không dùng chênh lệch trên 45 mẫu để kết luận thư viện luôn tốt hơn; muốn chọn LR/regularization cần validation/CV trên train. Bài tập mở rộng: kiểm tra gradient finite-difference tại một bộ weights nhỏ, rồi so sánh cả hai với cùng penalty và ngân sách tối ưu.
