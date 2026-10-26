**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** PCA, Bayes, Maximum Likelihood và MAP.
**Mục tiêu:** phân biệt giảm chiều không giám sát với Linear Discriminant Analysis có giám sát; hiểu giả định Gaussian chung covariance.

## Phương sai lớn không nhất thiết giúp phân lớp
Hai lớp có thể kéo dài rất mạnh theo trục ngang nhưng khác nhau chủ yếu theo trục dọc. PCA giữ trục phương sai lớn sẽ bỏ tín hiệu phân loại. LDA dùng nhãn để tìm hướng có khoảng cách giữa các lớp lớn so với độ phân tán trong lớp. LDA ở đây là Linear Discriminant Analysis, không phải Latent Dirichlet Allocation cho chủ đề văn bản.

## Fisher criterion và giới hạn số chiều
Với trung bình lớp $\mu_c$ và trung bình chung $\mu$:
$$S_W=\sum_c\sum_{i:y_i=c}(x_i-\mu_c)(x_i-\mu_c)^\top,\quad S_B=\sum_c n_c(\mu_c-\mu)(\mu_c-\mu)^\top.$$
Với hai lớp, tối đa hóa tỷ số $w^\top S_Bw/(w^\top S_Ww)$; nếu $S_W$ khả nghịch, hướng tối ưu tỷ lệ với $S_W^{-1}(\mu_1-\mu_0)$. Nên giải hệ thay vì tự nghịch đảo. Với $C$ lớp, số chiều phân biệt không quá $\min(d,C-1)$ vì rank của $S_B$ không quá $C-1$.

## LDA như classifier xác suất
Giả sử các lớp có phân phối Gaussian và cùng covariance $\Sigma$. So sánh log posterior cho điểm tuyến tính:
$$\delta_c(x)=x^\top\Sigma^{-1}\mu_c-\tfrac12\mu_c^\top\Sigma^{-1}\mu_c+\log\pi_c.$$
Chọn lớp có $\delta_c$ lớn nhất. Nếu cho phép covariance khác nhau theo lớp, ta được QDA với ranh giới bậc hai, không còn giả định LDA. Số chiều lớn/ít mẫu có thể làm covariance suy biến; shrinkage cải thiện ước lượng nhưng vẫn cần validation.

## Thực hành CPU trên Iris
Iris tích hợp scikit-learn có 150 mẫu × 4 đặc trưng, không tải mạng. Pipeline được fit chỉ trên train. Hai chiều là trần vì có ba lớp. Bản này kiểm tra shape và tính hữu hạn; accuracy là quan sát trên một split nhỏ, không phải bảo đảm.
```python
import numpy as np
from sklearn.datasets import load_iris
from sklearn.discriminant_analysis import LinearDiscriminantAnalysis
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
X, y = load_iris(return_X_y=True)
tr, te = train_test_split(np.arange(len(y)), test_size=.3, random_state=42, stratify=y)
p = make_pipeline(StandardScaler(), LinearDiscriminantAnalysis(n_components=2))
p.fit(X[tr], y[tr])
Z = p.transform(X[te])
assert Z.shape == (45, 2) and np.isfinite(Z).all()
print(Z.shape, round(p.score(X[te], y[te]), 3))
```
Kết quả kỳ vọng (đã chạy CPU): `(45, 2) 0.978`.

## Lỗi thường gặp và trường hợp sử dụng
Fit LDA trước khi chia dữ liệu là target leakage: nó dùng nhãn. Không đặt `n_components=3` cho Iris ba lớp. Solver `lsqr` hỗ trợ shrinkage cho classification nhưng không cung cấp transform; không đổi solver rồi mặc định code giảm chiều vẫn chạy. LDA phù hợp baseline dữ liệu số nhỏ/vừa với giả định covariance gần hợp lý; không thay thế mô hình phi tuyến khi phân phối khác xa Gaussian.

## Bài tập tự đánh giá
1. Bài toán 4 lớp, 20 đặc trưng giảm bằng LDA tối đa bao nhiêu chiều?
2. PCA và LDA khác nhau ở việc sử dụng nhãn như thế nào?
3. Với dữ liệu ít mẫu hơn số chiều, đề xuất một pipeline đánh giá LDA shrinkage và giải thích giới hạn solver.

## Đáp án và tiêu chí chấm
1. $\min(20,4-1)=3$ (2 điểm).
2. PCA tối đa phương sai không dùng nhãn; LDA cân đối phân tán giữa/trong lớp bằng nhãn, nên phải fit trong fold train (3 điểm).
3. Dùng CV phân tầng trên train, tiền xử lý và `LinearDiscriminantAnalysis(solver='lsqr', shrinkage='auto')` trong pipeline, giữ test riêng. `lsqr` là classifier không transform; nếu cần transform phải dùng solver phù hợp như `eigen` và kiểm tra số chiều (5 điểm).

## Tổng kết
LDA tối ưu khả năng tách lớp thay vì phương sai chung. Điều kiện covariance và giới hạn $C-1$ là các phần cốt lõi của thuật toán.

## Nguồn tham khảo
- [ML cơ bản: Linear Discriminant Analysis](https://machinelearningcoban.com/2017/06/30/lda/) — đọc snapshot nguồn được ghi trong audit.
