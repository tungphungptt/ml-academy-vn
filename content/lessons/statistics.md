**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Xác suất cơ bản.
**Mục tiêu:** tóm tắt dữ liệu bằng thống kê mô tả, phân biệt phương sai mẫu và tổng thể, và hiểu ước lượng Maximum Likelihood cho phân phối chuẩn.

## Vấn đề thực tế
Trước khi huấn luyện mô hình, ta cần hiểu dữ liệu: giá trị điển hình là bao nhiêu, dữ liệu phân tán ra sao, có lệch hay có ngoại lai không.

## Công thức
$$\bar x=\frac1N\sum_i x_i,\qquad \sigma^2=\frac1N\sum_i(x_i-\bar x)^2,\qquad s^2=\frac1{N-1}\sum_i(x_i-\bar x)^2$$
Trung vị là giá trị ở giữa sau khi sắp xếp (ít nhạy với ngoại lai hơn trung bình). $\sigma^2$ là phương sai tổng thể, $s^2$ là phương sai mẫu (chia $N-1$ để ước lượng không chệch khi chỉ có một mẫu từ tổng thể lớn hơn). **MLE cho phân phối chuẩn:** cực đại hóa log-likelihood của $N$ quan sát cho $\hat\mu=\bar x$ và $\hat\sigma^2=\frac1N\sum(x_i-\bar x)^2$ (chia $N$, nên chệch nhẹ so với $s^2$).

![Biểu đồ chấm với trung bình và trung vị](/img/statistics.svg)

## Ví dụ từng bước
Dữ liệu $(2,4,4,4,5,5,7,9)$: trung bình $5$, trung vị $4.5$, $\sum(x_i-5)^2=32$, nên $\sigma^2=32/8=4$ ($\sigma=2$) và $s^2=32/7\approx4.5714$ ($s\approx2.1381$). MLE cho trung bình và phương sai là $5$ và $4$.

## Code và cách chạy
```python
import numpy as np
x = np.array([2, 4, 4, 4, 5, 5, 7, 9.0])
print(float(x.mean()), float(np.median(x)), float(x.var()), float(x.std()), round(float(x.var(ddof=1)), 4), round(float(x.std(ddof=1)), 4))
```
Kết quả kỳ vọng (đã chạy cục bộ): `5.0 4.5 4.0 2.0 4.5714 2.1381`.

## Lỗi thường gặp
Nhầm `ddof=0` của NumPy với `ddof=1` mặc định của pandas; dùng trung bình khi dữ liệu có ngoại lai nặng (nên xem cả trung vị); chỉ nhìn số tóm tắt mà không vẽ biểu đồ phân phối.

## Bài tập
1. (Dễ) Tính trung vị của $(1,3,3,6,7,8,9)$. 2. (Vừa) Tính $\sigma^2$ và $s^2$ cho $(1,2,3,4)$. 3. (Khó) Suy ra $\hat\mu$ MLE bằng cách đặt đạo hàm log-likelihood bằng 0.

## Tóm tắt
Trung bình, trung vị, phương sai mô tả dữ liệu; MLE của phân phối chuẩn dùng trung bình mẫu và phương sai chia $N$.

## Điều kiện áp dụng và kiểm tra kết luận
Thống kê mô tả phản ánh mẫu đang có; suy luận về quần thể còn phụ thuộc lấy mẫu và bất định. Trung bình/variance có thể không tồn tại với một số phân phối đuôi nặng. Công thức chia N−1 ước lượng không chệch variance trong giả định mẫu IID có variance hữu hạn; độ lệch chuẩn lấy căn không vì thế tự không chệch. Khoảng tin cậy của mean không phải khoảng chứa 95% các điểm dữ liệu. Median/IQR và biểu đồ giúp phát hiện khi một mean che mất phân phối đa đỉnh hoặc ngoại lai.

## Đáp án và tiêu chí chấm
1. Dãy đã sắp xếp có 7 phần tử, median là phần tử thứ 4: 6. (2 điểm).
2. Mean=2.5, tổng bình phương lệch=5. Variance tổng thể=5/4=1.25; variance mẫu=5/3≈1.6667. (3 điểm).
3. Viết log-likelihood Gaussian, lấy đạo hàm và cho Σ(x_i−μ)=0. Phân biệt điều kiện variance dương, MLE variance chia N và ước lượng không chệch chia N−1. (5 điểm).

## Nguồn tham khảo
- [Dive into Deep Learning: Probability and Statistics](https://d2l.ai/chapter_preliminaries/probability.html).
