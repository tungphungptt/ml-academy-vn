**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Xác suất cơ bản, Thống kê mô tả và ước lượng tham số.
**Mục tiêu:** phân biệt likelihood với posterior, suy ra MLE/MAP cho Bernoulli và hiểu regularization từ prior.

## Một phép kiểm tra dương chưa phải xác suất mắc bệnh
Xác suất có điều kiện là $P(A\mid B)=P(A\cap B)/P(B)$ với $P(B)>0$. Quy tắc Bayes đảo chiều điều kiện:
$$P(A\mid B)=\frac{P(B\mid A)P(A)}{P(B)}.$$
Giả sử tỷ lệ mắc bệnh 1%, sensitivity 90%, false-positive rate 5%. Trong 10.000 người, dự kiến 90 người bệnh có test dương và 495 người không bệnh có test dương. Vì vậy $P(\text{bệnh}\mid+)=90/585\approx0.154$, không phải 0.9. Các số là giả định minh họa, không phải số liệu y tế thực nghiệm.

## MLE và MAP tối ưu những đại lượng khác nhau
Với $n$ phép thử Bernoulli độc lập cùng xác suất $p$, có $k$ lần thành công:
$$\ell(p)=k\log p+(n-k)\log(1-p),\qquad \hat p_{MLE}=k/n.$$
Likelihood là hàm của tham số khi dữ liệu đã cố định, không phải phân phối xác suất trên tham số. Với biến liên tục, dùng mật độ và likelihood tích mật độ; xác suất một giá trị chính xác thường bằng 0.

Chọn prior $p\sim\operatorname{Beta}(\alpha,\beta)$. Posterior là Beta$(k+\alpha,n-k+\beta)$. Nếu cả hai tham số posterior lớn hơn 1, mode nằm trong $(0,1)$:
$$\hat p_{MAP}=\frac{k+\alpha-1}{n+\alpha+\beta-2}.$$
Posterior mean là $(k+\alpha)/(n+\alpha+\beta)$, khác MAP. Khi tham số posterior không lớn hơn 1, phải xét biên; không áp dụng công thức mode trong một cách vô điều kiện. Prior đều Beta$(1,1)$ cho MAP trùng MLE ở trường hợp nội điểm.

## Ví dụ và code CPU
```python
n, k, alpha, beta = 4, 3, 2, 2
mle = k / n
map_est = (k + alpha - 1) / (n + alpha + beta - 2)
posterior_mean = (k + alpha) / (n + alpha + beta)
positive = .9 * .01 / (.9 * .01 + .05 * .99)
print([round(v, 4) for v in (mle, map_est, posterior_mean, positive)])
```
Kết quả kỳ vọng: `[0.75, 0.6667, 0.625, 0.1538]`.

## Từ prior đến regularization
MAP tối thiểu hóa negative log-likelihood cộng negative log-prior. Prior Gaussian đẳng hướng trên trọng số tạo phạt L2; prior Laplace tạo phạt L1. Hệ số phạt còn phụ thuộc cách lấy tổng/trung bình loss, độ nhiễu và scale prior. Không thể đồng nhất mọi tham số `alpha`, `C`, `weight_decay` giữa các thư viện.

## Điều kiện và lỗi thường gặp
Không đảo nhầm $P(A\mid B)$ với $P(B\mid A)$; không coi likelihood là posterior đã chuẩn hóa. Nếu tất cả quan sát giống nhau, MLE Bernoulli ở biên: phải xét công thức MAP tại biên thay vì chia máy móc.

MLE có tính nhất quán dưới các điều kiện như mô hình phù hợp, tính nhận dạng và giả định lấy mẫu thích hợp; không có bảo đảm đó chỉ vì dữ liệu nhiều. MAP phụ thuộc prior và cách tham số hóa, không phải mọi khi đều tốt hơn MLE. Khi prior quá mạnh hoặc lệch miền, ước lượng có thể bị kéo sai.

## Bài tập tự đánh giá
1. Hai ngửa trong 5 lần: MLE bằng bao nhiêu?
2. Với prior Beta$(2,2)$, tính MAP và posterior mean cho dữ liệu trên.
3. Vì sao Laplace smoothing của xác suất categorical không đồng nghĩa cộng hằng số vào phương sai GaussianNB?

## Đáp án và tiêu chí chấm
1. $2/5=0.4$ (2 điểm).
2. Posterior Beta$(4,5)$; MAP $3/7$, mean $4/9$. Phân biệt mode và kỳ vọng, không dùng nhầm công thức (3 điểm).
3. Hai mô hình có likelihood/không gian tham số khác nhau. Pseudocount dành cho xác suất categorical; GaussianNB dùng ổn định phương sai để tránh mật độ suy biến. Cần nêu đúng đối tượng được ước lượng và vì sao smoothing tránh xác suất 0 (5 điểm).

## Tổng kết
Bayes dùng cả prior và likelihood; MLE tối ưu likelihood, MAP tối ưu mật độ posterior. Điều kiện nội điểm và giả định dữ liệu là một phần của công thức.

## Nguồn tham khảo
- [ML cơ bản: xác suất](https://machinelearningcoban.com/2017/07/09/prob/).
- [ML cơ bản: MLE và MAP](https://machinelearningcoban.com/2017/07/17/mlemap/) — đối chiếu bản nguồn Git và permalink đã kiểm tra; chi tiết revision trong audit.
