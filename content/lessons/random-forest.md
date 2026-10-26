**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Decision Tree.
**Mục tiêu:** hiểu bagging, tính ngẫu nhiên của Random Forest và vì sao ensemble giảm phương sai.

## Vấn đề thực tế
Một cây quyết định rất nhạy với dữ liệu huấn luyện (phương sai cao). Gộp nhiều cây khác nhau cho kết quả ổn định hơn.

## Trực giác và công thức
Mỗi cây được huấn luyện trên một mẫu bootstrap (lấy ngẫu nhiên có hoàn lại $N$ mẫu) và tại mỗi nút chỉ xét một tập con ngẫu nhiên các đặc trưng. Dự đoán cuối là bỏ phiếu đa số (hoặc trung bình với hồi quy). Nếu $B$ cây độc lập, mỗi cây có phương sai $\sigma^2$, trung bình có phương sai $\sigma^2/B$; thực tế các cây tương quan nên giảm ít hơn, và việc chọn đặc trưng ngẫu nhiên giúp giảm tương quan. Mẫu bootstrap bỏ sót khoảng 37% mẫu gốc ($\approx e^{-1}$); phần này dùng làm đánh giá out-of-bag.

![Ba cây bỏ phiếu](/img/random-forest.svg)

## Ví dụ từng bước
Ba cây dự đoán lớp $A,A,B$ cho một mẫu: bỏ phiếu cho $A$ (2/3). Tỉ lệ mẫu không được chọn trong bootstrap kích thước $N$ là $(1-1/N)^N$, với $N=100$ xấp xỉ $0.366$.

## Code và cách chạy
```python
from sklearn.datasets import load_iris
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
X, y = load_iris(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)
print(round(RandomForestClassifier(n_estimators=100, random_state=0).fit(Xa, ya).score(Xb, yb), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.889`. Con số này thấp hơn một cây đơn ở bài Decision Tree (0.933) trên cùng tập test 45 mẫu, chênh vài mẫu nên không kết luận được gì; hãy dùng cross-validation để so sánh công bằng.

## Lỗi thường gặp
Cho rằng ensemble luôn thắng một cây trên một lần chia train/test; rò rỉ dữ liệu khi chọn tham số bằng tập test.

## Ưu điểm, hạn chế
Mạnh, ít cần tinh chỉnh, cho độ quan trọng đặc trưng. Khó diễn giải hơn một cây, tốn bộ nhớ.

## Bài tập
1. (Dễ) Tính $(1-1/50)^{50}$. 2. (Vừa) Chạy 5-fold cross-validation cho cây đơn và Random Forest. 3. (Khó) Tự cài bagging 10 cây bằng `DecisionTreeClassifier`.

## Tóm tắt
Random Forest gộp nhiều cây bootstrap với đặc trưng ngẫu nhiên để giảm phương sai.

## Điều kiện áp dụng và kiểm tra kết luận
Bagging và random subset feature giảm tương quan giữa các cây. Với phương sai bằng $\sigma^2$ và tương quan cặp $\rho$, phương sai trung bình là $\rho\sigma^2+(1-\rho)\sigma^2/B$, nên tăng cây không đưa variance về 0 khi $\rho>0$. Mô tả hard majority là trực giác ensemble; RandomForestClassifier của sklearn thực tế trung bình probability của từng cây rồi argmax, có thể khác bỏ phiếu nhãn cứng. OOB dùng các mẫu không vào bootstrap của từng cây; nếu chọn nhiều cấu hình theo OOB thì vẫn cần đánh giá cuối độc lập. Impurity importance thiên vị thuộc tính nhiều giá trị; permutation importance cũng phải xét feature tương quan.

## Đáp án và tiêu chí chấm
1. $(1-1/50)^{50}\approx0.3642$, tiến dần về $e^{-1}\approx0.3679$. (2 điểm).
2. Dùng cùng folds và cùng metric cho cây/forest, báo mean/std và chi phí; không kết luận ensemble luôn thắng từ một split. (3 điểm).
3. Mỗi cây lấy bootstrap train và một seed riêng; gom probability nhất quán thứ tự class. Giữ validation riêng và đối chiếu với cây đơn, không dùng test để điều chỉnh B. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Ensembles (Random Forests)](https://scikit-learn.org/stable/modules/ensemble.html#random-forests-and-other-randomized-tree-ensembles).
