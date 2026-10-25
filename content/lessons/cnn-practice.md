**Cấp độ:** Intermediate · **Tiên quyết:** CNN, Logistic Regression.
**Mục tiêu:** dùng bộ lọc tích chập, ReLU và max pooling như một bước trích xuất đặc trưng trên ảnh chữ số thật, rồi so sánh với việc dùng thẳng điểm ảnh.

## Vấn đề thực tế
Bài CNN giải thích phép tích chập; bài này áp dụng nó lên dữ liệu thật (bộ Digits: ảnh chữ số 8×8, 1797 mẫu, 10 lớp). Lưu ý: ở đây các bộ lọc được **chọn tay** (phát hiện cạnh ngang và dọc), không được học. Một CNN thật học các bộ lọc bằng backpropagation (xem bài Thực hành PyTorch).

![Hoạt ảnh phép tích chập](/img/conv.svg)

## Quy trình
Ảnh $8\times8$ → tích chập với 2 kernel $2\times2$ (kết quả $7\times7$) → ReLU → max pooling $2\times2$ (còn $3\times3$) → làm phẳng: $2\times3\times3=18$ đặc trưng thay cho 64 điểm ảnh. Kích thước theo công thức $\lfloor(8+0-2)/1\rfloor+1=7$.

## Code và cách chạy
```python
import numpy as np
from sklearn.datasets import load_digits
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
X, y = load_digits(return_X_y=True); img = X.reshape(-1, 8, 8) / 16
K = [np.array([[-1, -1], [1, 1]]), np.array([[-1, 1], [-1, 1]])]  # cạnh ngang, cạnh dọc
def feats(im):
    out = []
    for k in K:
        c = np.maximum(np.array([[(im[i:i+2, j:j+2] * k).sum() for j in range(7)] for i in range(7)]), 0)
        out.append(np.array([[c[i:i+2, j:j+2].max() for j in range(0, 6, 2)] for i in range(0, 6, 2)]).ravel())
    return np.concatenate(out)
F = np.array([feats(i) for i in img])
tr, te, ytr, yte = train_test_split(np.arange(len(y)), y, test_size=0.3, random_state=0, stratify=y)
acc = lambda M: round(LogisticRegression(max_iter=3000).fit(M[tr], ytr).score(M[te], yte), 3)
print(F.shape, acc(X / 16), acc(F), acc(np.c_[X / 16, F]))
```
Kết quả kỳ vọng (đã chạy cục bộ): `(1797, 18) 0.97 0.889 0.97`.

Cách đọc: 18 đặc trưng tích chập + pooling giữ được độ chính xác $0.889$ (so với $0.97$ của 64 điểm ảnh thô), tức nén dữ liệu hơn 3 lần mà vẫn nhận ra hầu hết chữ số; ghép cả hai không cải thiện thêm trên tập này. Trên ảnh 8×8 rất nhỏ, điểm ảnh thô đã đủ tốt, nên bộ lọc chọn tay không thắng. Lợi thế của CNN xuất hiện với ảnh lớn hơn và khi các bộ lọc được học.

## Lỗi thường gặp
Kết luận "tích chập không có ích" từ một thí nghiệm nhỏ; quên chia ảnh cho 16 (thang đo 0-16 của Digits); nhầm cross-correlation (không lật kernel) với tích chập toán học; rò rỉ dữ liệu khi chuẩn hóa trước khi chia.

## Hạn chế
Đây không phải mạng CNN được huấn luyện: không có lớp học được, không có huấn luyện nhiều lớp. Kết quả chỉ trên một lần chia train/test cố định.

## Bài tập
1. (Dễ) Tính kích thước đầu ra nếu dùng kernel $3\times3$ trên ảnh $8\times8$. 2. (Vừa) Thêm hai kernel đường chéo và đo lại accuracy. 3. (Khó) Thay Logistic Regression bằng một CNN nhỏ trong PyTorch và so sánh.

## Tóm tắt
Tích chập, ReLU và pooling biến ảnh thành vector đặc trưng gọn; bộ lọc học được mới là sức mạnh của CNN.
