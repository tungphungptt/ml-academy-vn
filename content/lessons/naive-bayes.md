**Cấp độ:** Beginner · **Tầng:** Intermediate · **Tiên quyết:** Bayes, Maximum Likelihood và MAP.
**Mục tiêu:** hiểu định lý Bayes và giả định độc lập có điều kiện.

## Vấn đề thực tế
Phân loại văn bản (spam hay không) nhanh, ít dữ liệu, dễ cài đặt.

## Công thức
$$
P(c\mid\mathbf x)\propto P(c)\prod_{j}P(x_j\mid c)
$$
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
Với mô hình đếm/rời rạc như MultinomialNB, xác suất từ bằng 0 có thể làm cả tích bằng 0: dùng pseudocount/Laplace smoothing phù hợp. GaussianNB dùng mật độ và ổn định phương sai, không áp dụng pseudocount cho từ. Nhân nhiều xác suất nhỏ gây underflow: dùng log.

## Ưu điểm, hạn chế
Nhanh, hiệu quả với dữ liệu nhỏ. Giả định độc lập thường không đúng nên xác suất đầu ra kém hiệu chỉnh.

## Bài tập
1. (Dễ) Tính lại với $P(\text{free}\mid\text{ham})=0.1$. 2. (Vừa) Thử `MultinomialNB` trên văn bản ngắn. 3. (Khó) Cài Naive Bayes từ đầu với làm trơn Laplace.

## Tóm tắt
Naive Bayes nhân tiên nghiệm với khả năng từng đặc trưng, giả định độc lập có điều kiện.

## Điều kiện áp dụng và kiểm tra kết luận
Giả định là độc lập các feature **có điều kiện theo lớp**, không phải các feature độc lập vô điều kiện. GaussianNB dùng mật độ liên tục, MultinomialNB dùng count/feature không âm phù hợp mô hình multinomial, BernoulliNB mô hình hiện diện/vắng mặt. Laplace pseudocount dành cho biến rời rạc; var_smoothing của GaussianNB là ổn định phương sai, không đồng nghĩa cộng 1 vào mọi likelihood. Log probability tránh underflow nhưng cần log-sum-exp khi chuẩn hóa posterior. Dữ liệu phụ thuộc/tương quan có thể làm probability quá tự tin dù nhãn dự đoán vẫn tốt.

## Đáp án và tiêu chí chấm
1. Khi $P(\text{free}\mid\text{ham})=0.1$, posterior $P(\text{spam}\mid\text{free})=0.2/(0.2+0.06)=10/13\approx0.7692$. (2 điểm).
2. Dùng CountVectorizer+MultinomialNB trong pipeline, fit vocabulary/count model trên train. Không đưa feature âm từ StandardScaler vào MultinomialNB. (3 điểm).
3. Đếm theo lớp, cộng alpha vào count và alpha·V vào mẫu số cho V từ. Cộng log prior và log likelihood, chuẩn hóa đúng; kiểm tra từ chưa gặp và lớp không có mẫu. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Naive Bayes](https://scikit-learn.org/stable/modules/naive_bayes.html).
