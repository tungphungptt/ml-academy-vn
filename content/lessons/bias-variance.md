**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Linear Regression, Thống kê mô tả và ước lượng tham số.
**Mục tiêu:** phân biệt underfitting và overfitting qua bias và variance, và đọc được chênh lệch giữa lỗi train và test.

## Vấn đề thực tế
Mô hình có lỗi train rất thấp vẫn có thể dự đoán tệ trên dữ liệu mới. Ta cần hiểu vì sao và cách điều chỉnh độ phức tạp của mô hình.

## Công thức
Với nhiễu có phương sai $\sigma^2$, lỗi bình phương kỳ vọng tại một điểm phân rã thành
$$\mathbb E\big[(y-\hat f(x))^2\big]=\underbrace{\big(\mathbb E[\hat f(x)]-f(x)\big)^2}_{\text{bias}^2}+\underbrace{\operatorname{Var}\big(\hat f(x)\big)}_{\text{variance}}+\sigma^2$$
**Bias** là sai lệch hệ thống do mô hình quá đơn giản (underfit); **variance** là độ nhạy với tập huấn luyện cụ thể do mô hình quá linh hoạt (overfit); $\sigma^2$ là nhiễu không giảm được. Tăng độ phức tạp thường giảm bias và tăng variance.

![Lỗi train và test theo độ phức tạp](/img/bias-variance.svg)

## Ví dụ từng bước
Giả sử $\text{bias}^2=0.09$, $\operatorname{Var}=0.04$, $\sigma^2=0.04$: lỗi kỳ vọng $=0.17$. Nếu thêm độ phức tạp làm bias² xuống $0.02$ nhưng variance lên $0.12$, tổng $=0.18$: không có lợi.

## Code và cách chạy
Khớp đa thức bậc $d$ cho $y=\sin(2\pi x)+\text{nhiễu}$ ($\sigma=0.2$, tức $\sigma^2=0.04$) với 30 điểm huấn luyện và 200 điểm kiểm tra; in `(bậc, MSE train, MSE test)`:
```python
import numpy as np
rng = np.random.default_rng(0)
x = np.sort(rng.uniform(0, 1, 30)); y = np.sin(2 * np.pi * x) + rng.normal(0, 0.2, 30)
xt = np.sort(rng.uniform(0, 1, 200)); yt = np.sin(2 * np.pi * xt) + rng.normal(0, 0.2, 200)
r = []
for d in (1, 3, 9, 15):
    c = np.polyfit(x, y, d)
    r.append((d, round(float(np.mean((np.polyval(c, x) - y) ** 2)), 3), round(float(np.mean((np.polyval(c, xt) - yt) ** 2)), 3)))
print(r)
```
Kết quả kỳ vọng (đã chạy cục bộ): `[(1, 0.218, 0.253), (3, 0.029, 0.056), (9, 0.022, 0.049), (15, 0.018, 0.056)]`.

Cách đọc: bậc 1 underfit (cả hai lỗi cao). Lỗi train giảm đều theo bậc, nhưng lỗi test không giảm tiếp sau bậc 9 và tăng lại ở bậc 15 trong khi lỗi train thấp nhất: khoảng cách train–test lớn dần. Với chỉ 30 điểm, hiệu ứng này khá nhẹ; số liệu có thể đổi theo seed.

## Lỗi thường gặp
Chọn độ phức tạp theo lỗi train; kết luận từ một lần chia train/test duy nhất (hãy dùng cross-validation); nghĩ rằng thêm dữ liệu luôn sửa được bias.

## Cách xử lý
Overfit: thêm dữ liệu, regularization (Ridge/Lasso), giảm độ phức tạp, early stopping, dropout. Underfit: mô hình giàu biểu diễn hơn, thêm đặc trưng, giảm regularization.

## Bài tập
1. (Dễ) Tính lỗi kỳ vọng với bias²=0.1, Var=0.05, σ²=0.04. 2. (Vừa) Chạy lại với 100 điểm train và so sánh khoảng cách train–test. 3. (Khó) Ước lượng bias và variance bằng cách huấn luyện lại trên nhiều tập bootstrap.

## Tóm tắt
Lỗi = bias² + variance + nhiễu; chọn độ phức tạp bằng lỗi trên dữ liệu chưa thấy.

## Điều kiện áp dụng và kiểm tra kết luận
Phân rã trong bài lấy kỳ vọng qua các tập train ngẫu nhiên và một quan sát target mới tại cùng x, với nhiễu trung bình 0 và variance hữu hạn. Một cặp train/test score không cho biết trực tiếp từng thành phần bias và variance. Tăng dữ liệu thường giảm variance nhưng không sửa đặc trưng thiếu tín hiệu hoặc mô hình quá hạn chế. Tăng độ phức tạp không luôn tăng test error trong mọi chế độ; quan hệ bias-variance cổ điển là công cụ chẩn đoán có giả định, không phải luật phổ quát cho mọi mạng quá tham số.

## Đáp án và tiêu chí chấm
1. Tổng bằng 0.1+0.05+0.04=0.19. (2 điểm).
2. Giữ noise và miền x, chạy protocol cố định nhiều seed nếu muốn đánh giá độ dao động. Báo cả train/test MSE, không chọn riêng seed có câu chuyện đẹp. (3 điểm).
3. Ở mô phỏng biết f(x), lấy trung bình prediction nhiều bộ train để ước lượng bias² và variance tại grid x cố định. Với dữ liệu thật không biết f, không tự gán các thành phần từ một loss duy nhất. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Underfitting vs. Overfitting](https://scikit-learn.org/stable/auto_examples/model_selection/plot_underfitting_overfitting.html).
