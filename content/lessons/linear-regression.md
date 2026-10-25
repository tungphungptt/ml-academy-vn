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
Xem `labs/linear_regression.py` (chạy: `python labs/linear_regression.py`, cần NumPy). Kết quả kỳ vọng: $w\approx2$, $b\approx0$.

## Lỗi thường gặp
Learning rate quá lớn làm loss tăng thay vì giảm; không chuẩn hóa đặc trưng làm hội tụ chậm.

## Bài tập
1. (Dễ) Tính tay $L$ với $w=1{,}5$. 2. (Vừa) Đổi learning rate và quan sát loss. 3. (Khó) Suy ra gradient của $L$ theo $w$ và $b$.
