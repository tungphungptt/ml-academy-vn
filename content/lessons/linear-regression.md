**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** Vector và ma trận, Đạo hàm và gradient, AI, Machine Learning và Deep Learning.
**Mục tiêu:** hiểu mô hình tuyến tính, hàm mất mát MSE và cách tìm tham số.

## Vấn đề thực tế
Cho diện tích nhà và giá bán của vài căn nhà, ta muốn dự đoán giá của một căn nhà mới.

## Mô hình và công thức
$$\hat{y} = w x + b, \qquad L(w,b)=\frac{1}{N}\sum_{i=1}^{N}\left(y_i-\hat{y}_i\right)^2$$

Trong đó $x$ là đặc trưng, $w$ là trọng số (độ dốc), $b$ là bias, $y_i$ là giá trị thật, $N$ là số mẫu.

![Đường hồi quy và sai số](/img/linear-regression.svg)

## Ví dụ từng bước
Dữ liệu $(x,y)$: $(1,2),(2,4),(3,6)$. Với $w=1,b=0$: sai số là $1,2,3$ nên $L=(1+4+9)/3\approx 4{,}67$. Với $w=2,b=0$ thì $L=0$: đây là nghiệm tối ưu.

## Code from scratch
Xem `labs/linear_regression/scratch.py` (chạy: `python labs/linear_regression/scratch.py`, cần NumPy). Kết quả kỳ vọng: $w\approx2$, $b\approx0$.

## Lỗi thường gặp
Learning rate quá lớn làm loss tăng thay vì giảm; không chuẩn hóa đặc trưng làm hội tụ chậm.

## Bài tập
1. (Dễ) Tính tay $L$ với $w=1{,}5$. 2. (Vừa) Đổi learning rate và quan sát loss. 3. (Khó) Suy ra gradient của $L$ theo $w$ và $b$.

## Điều kiện áp dụng và kiểm tra kết luận
Đầu vào là ma trận số X và target liên tục y; mô hình tuyến tính theo tham số, không bắt buộc y tuyến tính theo mọi biến gốc. Thêm cột 1 để chứa intercept: Z=[X,1]. Normal equations là ZᵀZθ=Zᵀy; chỉ viết nghiệm nghịch đảo khi Z có full column rank. `np.linalg.lstsq(Z,y,rcond=None)` dùng solver thích hợp cả khi suy biến; xem [SVD](/learn/linear-algebra-decompositions). Với nhiễu Gaussian độc lập variance cố định, tối thiểu SSE tương ứng MLE; heteroscedasticity hoặc outlier làm cách diễn giải thống kê và khoảng bất định thay đổi. Intercept không nên bị phạt như feature nếu quy ước regularization không yêu cầu. OLS nhanh và dễ diễn giải, nhưng extrapolation và feature tương quan mạnh có thể làm hệ số/dự đoán không ổn định.

## Đáp án và tiêu chí chấm
1. Giữ b=0, w=1.5 cho MSE=(0.5²+1²+1.5²)/3=7/6≈1.1667. (2 điểm).
2. Ghi seed, LR, số update, loss hữu hạn và diễn biến hội tụ. LR quá lớn có thể phân kỳ; không chấm chỉ việc thấy một số epoch bất kỳ. (3 điểm).
3. Đặt e_i=wx_i+b−y_i: dL/dw=(2/N)Σe_ix_i và dL/db=(2/N)Σe_i. Nêu dấu và mean/sum để không sai hệ số; kiểm tra bằng finite difference. (5 điểm).

## Tóm tắt
Học mô hình tuyến tính cùng điều kiện nghiệm, loss và giao thức đánh giá; solver ổn định quan trọng hơn thao tác nghịch đảo viết tay.

## Nguồn tham khảo
- [scikit-learn User Guide: Linear Models](https://scikit-learn.org/stable/modules/linear_model.html).
