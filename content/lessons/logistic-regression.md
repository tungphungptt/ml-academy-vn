**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Gradient Descent, Xác suất cơ bản, Loss Functions: MSE, MAE, Huber, Cross-Entropy.
**Mục tiêu:** hiểu sigmoid, cross-entropy và cách huấn luyện phân loại nhị phân.

## Vấn đề thực tế
Dự đoán một email có phải spam (1) hay không (0). Đầu ra cần là **xác suất** trong $[0,1]$, không phải số thực bất kỳ.

## Trực giác và công thức
Tính điểm tuyến tính $z=\mathbf w^\top\mathbf x+b$ rồi nén vào $(0,1)$ bằng sigmoid:
$$
p=\sigma(z)=\frac{1}{1+e^{-z}},\qquad L=-\frac1N\sum_i\big[y_i\ln p_i+(1-y_i)\ln(1-p_i)\big]
$$
$y_i\in\{0,1\}$ là nhãn thật, $p_i$ là xác suất dự đoán lớp 1, $N$ là số mẫu. Gradient gọn: $\partial L/\partial \mathbf w=\frac1N\sum_i (p_i-y_i)\mathbf x_i$. Decision boundary là tập $z=0$ (một đường thẳng/siêu phẳng); dự đoán lớp 1 khi $p>0.5$.

![Đường sigmoid và ranh giới quyết định](/img/logistic-regression.svg)

## Ví dụ từng bước
$z=0\Rightarrow p=0.5$; $z=2\Rightarrow p\approx0.8808$. Nếu $y=1$ thì loss $=-\ln0.8808\approx0.1269$. Với $w=0,b=0$, mẫu $x=2,y=1$: $p=0.5$, gradient theo $w$ là $(0.5-1)\cdot2=-1$; với $\eta=0.1$, $w\leftarrow0.1$.

## Từ log-odds đến xác suất

Odds là tỷ số $p/(1-p)$; log-odds là logarithm tự nhiên của tỷ số đó. Mô hình đặt $\log(p/(1-p))=wx+b$, nên giải ngược được sigmoid. Trong ví dụ một feature, tăng x một đơn vị làm log-odds tăng w, còn odds nhân $e^w$; probability không tăng một lượng cố định. Đây là lý do hệ số tuyến tính không có nghĩa xác suất tuyến tính.

Giữ cách viết này trong bối cảnh dữ liệu và feature cụ thể: hệ số không tự chứng minh quan hệ nhân quả. Mô hình ước lượng xác suất có điều kiện theo các feature đã cung cấp. [scikit-learn, Logistic regression và Binary Case](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression) mô tả mô hình Bernoulli với logit link; triển khai thư viện có regularization mặc định, khác ví dụ một mẫu không regularization bên dưới.

## Một bước học: cả w lẫn b đều nhận gradient

Lấy đúng mẫu $x=2,y=1$, bắt đầu $w=0,b=0$. Forward cho $z=0$, $p=0.5$ và loss $\log 2\approx0.693147$. Chain rule rút gọn thành:

$$
\frac{\partial\ell}{\partial z}=p-y=-0.5,\quad
\frac{\partial\ell}{\partial w}=(p-y)x=-1,\quad
\frac{\partial\ell}{\partial b}=p-y=-0.5.
$$

Với η=0.1, cập nhật đồng thời từ gradient cũ: $w_{new}=0.1$, $b_{new}=0.05$. Forward lại cho $z_{new}=0.25$, $p_{new}\approx0.562177$, loss mới $\approx0.575939$. Nếu **giữ b cố định** thì z chỉ bằng 0.2; đó là bài toán khác, không phải sai số làm tròn của kết quả này.

```neuralclone
logistic
```

Thí nghiệm bắt đầu từ đúng các số trên. Chọn nhãn 0 thay cho 1 để quan sát gradient đổi dấu; đặt x=0 để thấy dw=0 nhưng db vẫn có thể khác 0. Chạy một bước với η=0 giữ nguyên tham số. Với η lớn, tự kiểm tra loss mới thay vì mặc định mỗi bước đều tốt. Đây là thí nghiệm **một mẫu**, không phải huấn luyện hay đánh giá mô hình trên cả dataset.

Hàm `binaryLogit(x,w,b,y)` trả z, probability, loss và gradient. Đồ thị sigmoid dùng z của cùng state; bảng trước/sau gọi lại cùng hàm. Python và TypeScript đều tính loss ổn định từ logits như [bài Loss Functions](/learn/loss-functions), không lấy log của một probability đã làm tròn.

## Xác suất, ngưỡng và nhãn là ba thứ khác nhau

Huấn luyện BCE không cần biến probability thành nhãn trước khi tính loss. Ngưỡng phục vụ quyết định sau đó; đổi ngưỡng không làm thay đổi w,b hoặc xác suất của mô hình đã cố định. Với ngưỡng $\tau\in(0,1)$, điều kiện $p\ge\tau$ tương đương $z\ge\log(\tau/(1-\tau))$. Chỉ với τ=0.5 thì vế phải bằng 0.

Cần nói rõ tie: quy ước $p>0.5$ ở công thức nhập môn gán p=0.5 cho lớp 0; [demo ngưỡng quyết định](/playground#threshold) dùng $p\ge\tau$, nên cùng điểm đó là lớp 1. Hai chính sách đều có thể chọn, nhưng phải nhất quán giữa code, metric và ứng dụng. Khi w=0,b=0, **mọi x** đều cho p=0.5; tập z=0 khi ấy không phải một siêu phẳng phân chia hai miền thông thường. Ranh giới tuyến tính có ý nghĩa phân chia khi vector trọng số khác 0.

Tự kiểm tra: đặt x=0,y=1,w=2,b=0 thì dw và db bằng bao nhiêu? **0 và −0.5**. Nếu chỉ đổi threshold mà BCE đổi, cần kiểm tra điều gì? **Có thể code đang tính loss trên nhãn đã threshold thay vì probability/logit.** Tối ưu tốt một mẫu có chứng minh calibration trên dữ liệu mới không? **Không**, cần đánh giá riêng trên dữ liệu chưa dùng để fit/chọn tham số.

## Code và cách chạy
Bài **Logistic Regression** trong Code Lab (`labs/logistic_regression/`): bản NumPy cho `loss=0.0575 accuracy=0.980`, bản scikit-learn cho `accuracy=0.980`.

## Lỗi thường gặp
Không chuẩn hóa đặc trưng; dùng MSE mà không hiểu objective/gradient khác cross-entropy; dữ liệu mất cân bằng nên chỉ nhìn accuracy.

## Ưu điểm, hạn chế, so sánh
Đơn giản, cho xác suất, dễ diễn giải. Ranh giới chỉ tuyến tính (trừ khi thêm đặc trưng phi tuyến). Khác Perceptron ở chỗ cho xác suất và có loss khả vi.

## Bài tập
1. (Dễ) Tính $\sigma(-2)$. 2. (Vừa) Chạy lab và đổi learning rate. 3. (Khó) Suy ra gradient $(p-y)x$ từ $L$.

## Tóm tắt
Sigmoid + cross-entropy + gradient descent cho phân loại nhị phân.

## Điều kiện áp dụng và kiểm tra kết luận
Logistic Regression mô hình hóa log-odds tuyến tính và thường tối ưu Bernoulli negative log-likelihood, không giả định các feature độc lập hay Gaussian. Nó cho một ước lượng probability, không tự bảo đảm calibration. Ngưỡng 0.5 là quy ước khi chi phí phù hợp, không định luật: chọn threshold bằng validation theo FP/FN. Với dữ liệu khả tách hoàn toàn, nghiệm MLE không regularization có thể tiến tới hệ số vô hạn; solver dừng không tự chứng minh nghiệm hữu hạn. Dùng MSE trên probability không bị toán học cấm, nhưng loss và gradient khác CE, có thể gây tối ưu khó hơn. Cần ổn định số bằng log-sum-exp/logits loss.

## Đáp án và tiêu chí chấm
1. $\sigma(-2)=1/(1+e^2)\approx0.1192$. (2 điểm).
2. Thay LR và ghi train/validation loss, không chọn LR dựa vào test. Đối chiếu số update và regularization mặc định của sklearn với bản tự cài trước khi đòi hệ số bằng nhau. (3 điểm).
3. $\partial\ell/\partial p=(p-y)/(p(1-p))$; $\partial p/\partial z=p(1-p)$, nên $\partial\ell/\partial z=p-y$ và $\nabla_w\ell=(p-y)x$. Với mean loss chia thêm N khi tổng nhiều mẫu. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Logistic regression](https://scikit-learn.org/stable/modules/linear_model.html#logistic-regression).
