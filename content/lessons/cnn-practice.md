**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** CNN, Logistic Regression.
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
Đây không phải mạng CNN được huấn luyện: bộ lọc tích chập không học được và không có backpropagation qua nhiều lớp. Bộ phân loại Logistic Regression phía sau vẫn học các hệ số từ train. Kết quả chỉ trên một lần chia train/test cố định.

## Bài tập
1. (Dễ) Tính kích thước đầu ra nếu dùng kernel $3\times3$ trên ảnh $8\times8$. 2. (Vừa) Thêm hai kernel đường chéo và đo lại accuracy. 3. (Khó) Thay Logistic Regression bằng một CNN nhỏ trong PyTorch và so sánh.

## Tóm tắt
Tích chập, ReLU và pooling biến ảnh thành vector đặc trưng gọn; bộ lọc học được mới là sức mạnh của CNN.

## Điều kiện áp dụng và kiểm tra kết luận
Bộ lọc cố định không được update nên “CNN feature extractor” này chỉ là một phép biến đổi xác định cộng Logistic Regression. Phép nhân/stride/pooling cần kiểm tra shape, không suy loss theo filter vì filter không nằm trong optimizer. Accuracy .889/.97 của bài dùng split 70/30 seed 0, còn CNN CPU dùng split khác: không so trực tiếp .889 với .95 để tuyên bố CNN thắng. Muốn so ba cách, giữ cùng tập train/validation/test và cùng quy trình chọn cấu hình. Loss thấp hay nén nhiều không tự đồng nghĩa feature tốt cho mọi nhãn.

## Đáp án và tiêu chí chấm
1. Kernel 3×3, không padding/stride1 trên 8×8 cho 6×6. (2 điểm).
2. Thêm kernel đường chéo làm số feature tăng; báo dimension, metric validation và cost trên cùng split, không chọn kernel dựa vào test. (3 điểm).
3. Dùng lab CNN CPU làm xuất phát, giữ protocol của thí nghiệm so sánh, huấn luyện filter và restore checkpoint theo validation. Không chỉ thay classifier rồi gọi filter đã được học. (5 điểm).

## Nguồn tham khảo
- [Stanford CS231n: Convolutional Networks](https://cs231n.github.io/convolutional-networks/).
- [scikit-learn: Digits dataset](https://scikit-learn.org/stable/datasets/toy_dataset.html).
