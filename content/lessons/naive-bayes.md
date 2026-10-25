**Cấp độ:** Beginner · **Tiên quyết:** xác suất có điều kiện.
**Mục tiêu:** hiểu định lý Bayes và giả định độc lập có điều kiện.

## Vấn đề thực tế
Phân loại văn bản (spam hay không) nhanh, ít dữ liệu, dễ cài đặt.

## Công thức
$$P(c\mid\mathbf x)\propto P(c)\prod_{j}P(x_j\mid c)$$
$P(c)$ là xác suất tiên nghiệm của lớp, $P(x_j\mid c)$ là khả năng đặc trưng $x_j$ xuất hiện trong lớp $c$. "Naive" nghĩa là giả định các đặc trưng độc lập khi biết lớp.

![Xác suất trước và sau khi thấy từ](/img/naive-bayes.svg)

## Ví dụ từng bước
$P(\text{spam})=0.4$, $P(\text{ham})=0.6$, $P(\text{"free"}\mid\text{spam})=0.5$, $P(\text{"free"}\mid\text{ham})=0.05$. Email chứa "free": $P(\text{spam}\mid\text{free})=\frac{0.4\cdot0.5}{0.4\cdot0.5+0.6\cdot0.05}=\frac{0.2}{0.23}\approx0.8696$.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
X, y = load_iris(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
print(round(GaussianNB().fit(Xa, ya).score(Xb, yb), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.911`.

## Lỗi thường gặp
Xác suất bằng 0 làm cả tích bằng 0: dùng làm trơn Laplace. Nhân nhiều xác suất nhỏ gây underflow: dùng log.

## Ưu điểm, hạn chế
Nhanh, hiệu quả với dữ liệu nhỏ. Giả định độc lập thường không đúng nên xác suất đầu ra kém hiệu chỉnh.

## Bài tập
1. (Dễ) Tính lại với $P(\text{free}\mid\text{ham})=0.1$. 2. (Vừa) Thử `MultinomialNB` trên văn bản ngắn. 3. (Khó) Cài Naive Bayes từ đầu với làm trơn Laplace.

## Tóm tắt
Naive Bayes nhân tiên nghiệm với khả năng từng đặc trưng, giả định độc lập có điều kiện.
