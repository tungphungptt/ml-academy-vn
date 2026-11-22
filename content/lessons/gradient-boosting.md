**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Decision Tree, Gradient Descent, Cross-validation.
**Mục tiêu:** giải thích boosting tuần tự, tự tính một bước sửa phần dư và chọn số bước bằng validation.

## Một mô hình học từ sai lầm của mô hình trước
Giả sử cần dự đoán tiêu thụ điện từ nhiệt độ và lịch sử sử dụng. Một cây nông khó biểu diễn toàn bộ quan hệ, nhưng có thể sửa một phần sai số còn lại. Boosting cộng nhiều cây theo thứ tự: cây sau nhìn vào điều tổ hợp hiện tại chưa giải thích được.

Random Forest giảm dao động bằng nhiều cây ngẫu nhiên hóa rồi lấy trung bình. Gradient Boosting xây một hàm cộng dần, nên các vòng không hoàn toàn độc lập. Cả hai đều là ensemble; khác biệt nằm ở cách xây thành viên, không chỉ số cây.

## Từ phần dư đến negative gradient
Với $\ell(y,F)=\tfrac12(y-F)^2$, bắt đầu bằng hằng số $F_0=\bar y$. Ở vòng $m$, tính $r_{im}=y_i-F_{m-1}(x_i)$, fit cây hồi quy $h_m$ vào $(x_i,r_{im})$, rồi cập nhật:

$$
F_m(x)=F_{m-1}(x)+\eta h_m(x),\qquad 0<\eta\le1.
$$

$h_m$ là cây sửa sai ở vòng $m$; $\eta$ là learning rate (shrinkage), điều chỉnh mức đóng góp của cây mới. Learning rate nhỏ làm bước sửa dè dặt hơn, không tự bảo đảm validation error giảm.

Với loss khả vi khác, thay phần dư bằng negative gradient $-\partial\ell(y_i,F)/\partial F$ tại predictor hiện tại. Với log-loss, mô hình cộng thường hoạt động trên raw score/logit và có cách tính lá phù hợp; không lấy nhãn trừ xác suất rồi cộng tùy tiện vào xác suất. Ví dụ hồi quy dưới đây không phải classifier đầy đủ.

![Một bước boosting sửa phần dư của dự đoán ban đầu](/img/gradient-boosting.svg)

## Ví dụ tự tính và kiểm chứng
Dữ liệu tự tạo: $x=(0,1,2,3)$, $y=(1,1,3,3)$. Trung bình bằng 2, nên $F_0=(2,2,2,2)$, phần dư $=(-1,-1,1,1)$. Stump chia tại 1.5 khớp phần dư này. Với $\eta=0.5$, dự đoán mới là $(1.5,1.5,2.5,2.5)$: MSE train giảm từ 1 xuống 0.25. Đây không phải kết quả tổng quát hóa.

```python
import numpy as np
x = np.array([0., 1., 2., 3.])
y = np.array([1., 1., 3., 3.])
f0 = np.full_like(y, y.mean())
residual = y - f0
left = x <= 1.5
stump = np.where(left, residual[left].mean(), residual[~left].mean())
f1 = f0 + 0.5 * stump
print(f1.tolist(), float(np.mean((y-f0)**2)), float(np.mean((y-f1)**2)))
```

Kết quả kiểm chứng: `[1.5, 1.5, 2.5, 2.5] 1.0 0.25`.

## Từ ví dụ đến thực hành với thư viện
`GradientBoostingRegressor` và `HistGradientBoostingRegressor` của scikit-learn là hai lựa chọn thực hành. Bản histogram chia giá trị thành bin để tăng hiệu quả; hỗ trợ categorical và xử lý missing cần đọc theo estimator. Không suy từ bốn điểm rằng boosting luôn tốt nhất trên dữ liệu bảng.

Chia train/validation/test trước. Trên train, thử learning rate, số vòng, độ sâu/số lá và kích thước lá tối thiểu. Learning rate nhỏ thường cần nhiều vòng hơn. Dùng early stopping hoặc CV để chọn, rồi chỉ đánh giá cấu hình chốt trên test. Với dữ liệu theo người dùng hoặc thời gian, giữ splitter phù hợp. Không ngẫu nhiên hóa để train nhìn tương lai.

Mã số 0,1,2 của biến phân loại không mặc nhiên biểu diễn thứ tự. Dùng encoder trong Pipeline hoặc hỗ trợ categorical được estimator tài liệu hóa; fit từ train/fold. XGBoost, LightGBM, CatBoost là những triển khai/họ thuật toán khác có lựa chọn riêng, không phải tên đồng nghĩa với một cài đặt trong bài này.

## Lỗi thường gặp và hiểu lầm
- “Boosting chỉ lấy trung bình nhiều cây”: predictor được sửa tuần tự theo objective.
- “Càng nhiều cây càng tốt”: train error có thể giảm trong khi validation xấu đi.
- “Residual luôn là $y-\hat y$”: chỉ đúng với squared loss theo quy ước ở đây.
- “Feature importance chứng minh nguyên nhân”: importance có thể phản ánh tương quan hoặc leakage.

## Bài tập tự đánh giá
1. Đổi $\eta$ thành 0.1 trong ví dụ. Tính MSE mới.
2. Validation MSE thấp nhất ở vòng 80, train MSE vẫn giảm đến vòng 300: chọn gì?
3. Thiết kế so sánh Random Forest và boosting trên tiêu thụ điện theo ngày.

## Đáp án và tiêu chí chấm
1. Dự đoán $(1.9,1.9,2.1,2.1)$, MSE $=0.81$ (2 điểm).
2. Giữ cấu hình/checkpoint vòng 80 theo validation; không chọn lại sau khi xem test (3 điểm).
3. Cùng feature sẵn có lúc dự đoán, split thời gian, metric và ngân sách tuning; báo dao động và lỗi theo nhóm ngày (5 điểm).

## Tổng kết
Gradient Boosting cộng các bộ sửa sai theo objective; squared loss cho phần dư đơn giản. Kiểm chứng một bước trên train không thay thế chọn cấu hình bằng validation và đánh giá cuối độc lập.

## Nguồn tham khảo
- [scikit-learn: Gradient boosting](https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting).
- [scikit-learn: Common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html).

Đối chiếu ngày 27/10/2026. Công thức là nền tảng ổn định; lựa chọn estimator phụ thuộc dữ liệu.
