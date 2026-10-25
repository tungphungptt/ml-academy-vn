**Cấp độ:** Beginner · **Tiên quyết:** xác suất cơ bản.
**Mục tiêu:** đọc confusion matrix và chọn metric phù hợp.

## Vấn đề thực tế
Mô hình đúng 99% có thể vô dụng nếu chỉ 1% mẫu là ca bệnh. Cần metric phản ánh đúng loại sai lầm.

## Công thức
Từ confusion matrix (TP, FP, FN, TN):
$$\text{Acc}=\frac{TP+TN}{N},\quad P=\frac{TP}{TP+FP},\quad R=\frac{TP}{TP+FN},\quad F_1=\frac{2PR}{P+R}$$
$P$ (precision): trong các mẫu dự đoán dương, bao nhiêu đúng. $R$ (recall): trong các mẫu dương thật, bắt được bao nhiêu.

![Ma trận nhầm lẫn](/img/confusion-matrix.svg)

## Ví dụ từng bước
$TP=40,FP=10,FN=20,TN=30$, $N=100$: $\text{Acc}=0.70$, $P=0.80$, $R\approx0.667$, $F_1\approx0.727$.

## Code và cách chạy
```python
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
yt = [1]*60 + [0]*40
yp = [1]*40 + [0]*20 + [1]*10 + [0]*30
print(accuracy_score(yt, yp), precision_score(yt, yp), round(recall_score(yt, yp), 3), round(f1_score(yt, yp), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.7 0.8 0.667 0.727`.

## Lỗi thường gặp
Chỉ dùng accuracy khi dữ liệu mất cân bằng; tính metric trên tập train thay vì test.

## Khi nào dùng
Ưu tiên Recall khi bỏ sót nguy hiểm (y tế); ưu tiên Precision khi báo nhầm tốn kém; $F_1$ khi cần cân bằng. ROC-AUC đo khả năng xếp hạng bất kể ngưỡng.

## Bài tập
1. (Dễ) Tính lại metric nếu $FN=10$. 2. (Vừa) Vẽ confusion matrix cho Iris bằng scikit-learn. 3. (Khó) Tạo dữ liệu 1% dương và chứng minh accuracy đánh lừa.

## Tóm tắt
Chọn metric theo chi phí của từng loại sai lầm, luôn đánh giá trên tập test.
