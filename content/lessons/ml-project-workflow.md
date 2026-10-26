**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Thực hành dữ liệu bảng: EDA, encoding và pipeline, Hyperparameter Tuning.
**Mục tiêu:** nắm quy trình một dự án ML từ đầu đến cuối.

## Các bước
1. **Xác định bài toán và metric** (ví dụ ưu tiên Recall khi bỏ sót nguy hiểm). 2. **Thu thập và khám phá dữ liệu** (phân phối, giá trị thiếu, mất cân bằng). 3. **Chia dữ liệu** train/test ngay từ đầu và không chạm vào test. 4. **Xây baseline đơn giản** để có mốc so sánh. 5. **Pipeline tiền xử lý + mô hình**, đánh giá bằng cross-validation trên train. 6. **Tinh chỉnh siêu tham số** và so sánh mô hình. 7. **Đánh giá cuối trên tập test một lần.** 8. **Lưu mô hình, triển khai, theo dõi** hiệu năng theo thời gian (dữ liệu có thể trôi dạt).

![Các bước của dự án ML](/img/ml-project-workflow.svg)

## Ví dụ từng bước
Bài toán ung thư vú (Breast Cancer, 569 mẫu): chia 75/25 có phân tầng, pipeline chuẩn hóa + Logistic Regression, đánh giá CV rồi test.

## Code và cách chạy
```python
from sklearn.datasets import load_breast_cancer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score, train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
X, y = load_breast_cancer(return_X_y=True)
Xa, Xb, ya, yb = train_test_split(X, y, test_size=0.25, random_state=0, stratify=y)
p = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
print(round(float(cross_val_score(p, Xa, ya, cv=5).mean()), 3), round(float(p.fit(Xa, ya).score(Xb, yb)), 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.974 0.958`. Số đầu là điểm CV trên train, số sau là accuracy trên test; hai số gần nhau là dấu hiệu tốt. Lưu mô hình bằng `joblib.dump(p, "model.joblib")`.

## Lỗi thường gặp
Rò rỉ dữ liệu, không có baseline, tối ưu metric không liên quan tới mục tiêu thật, quên theo dõi sau triển khai.

## Hạn chế
Accuracy trên một tập test nhỏ vẫn có sai số ngẫu nhiên; với bài toán y tế thật cần thêm kiểm định lâm sàng, không chỉ chạy mô hình này.

## Bài tập
1. (Dễ) Thêm baseline `DummyClassifier`. 2. (Vừa) Báo cáo Precision, Recall, F1 trên test. 3. (Khó) Thêm GridSearchCV vào pipeline và lưu mô hình.

## Tóm tắt
Baseline, pipeline, cross-validation, rồi test một lần: quy trình để kết quả đáng tin.

## Điều kiện áp dụng và kiểm tra kết luận
Một dự án cần data contract, nguồn/quyền sử dụng, đơn vị dự đoán và thời điểm target, không chỉ chuỗi fit/predict. Với dữ liệu breast-cancer sklearn, label 0 là malignant: nếu mục tiêu phát hiện bệnh phải chỉ rõ positive label hoặc recode, không đọc recall benign thành recall bệnh. Chốt metric và split trước search. Lưu model cùng pipeline, schema feature, phiên bản, seed và provenance; theo dõi drift input và chất lượng khi nhãn mới đến, không khẳng định drift input luôn làm accuracy giảm.

## Đáp án và tiêu chí chấm
1. Fit DummyClassifier trên cùng train; đối chiếu test metric và chi phí FP/FN với pipeline, không so hai split khác nhau. (2 điểm).
2. Báo precision/recall/F1 với pos_label phù hợp và confusion matrix có nhãn rõ. Không tối ưu threshold trên test sau khi thấy recall thấp. (3 điểm).
3. Search chỉ trên train/CV, refit best pipeline rồi đánh giá test một lần. Lưu pipeline, phiên bản và schema; chỉ reload artifact do mình kiểm soát. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Pipelines and composite estimators](https://scikit-learn.org/stable/modules/compose.html).
- [scikit-learn: Model persistence](https://scikit-learn.org/stable/model_persistence.html).
