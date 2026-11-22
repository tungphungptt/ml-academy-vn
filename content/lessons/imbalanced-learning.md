**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Logistic Regression, Metrics, Cross-validation, Data leakage.
**Mục tiêu:** phân biệt ranking, calibration và quyết định; chọn ngưỡng trên validation theo chi phí; đánh giá lệch lớp không làm rò rỉ test.

## Accuracy cao có thể che giấu điều gì?
Nếu 1% giao dịch cần điều tra, bộ dự đoán luôn chọn “bình thường” đạt 99% accuracy nhưng không phát hiện ca nào. Cần hỏi bỏ sót bao nhiêu ca, tạo bao nhiêu cảnh báo sai và đội điều tra có thể xử lý bao nhiêu cảnh báo. Tỷ lệ lớp không tự quyết định một metric duy nhất.

Ba tầng khác nhau: **ranking** xếp trường hợp đáng nghi lên trước; **calibration** hỏi điểm 0.8 có tương ứng khoảng 80% dương tính trong các nhóm dự đoán tương tự không; **threshold** chuyển điểm thành hành động. Xếp hạng tốt không bảo đảm xác suất đáng tin. Đổi threshold không sửa calibration hay thứ hạng.

## Quyết định theo chi phí
Với xác suất phù hợp $p=P(y=1\mid x)$, chi phí FP/FN không âm, tổng $C_{FP}+C_{FN}>0$ và quyết định đúng có chi phí 0, dự đoán dương khi:

$$
C_{FP}(1-p)\le C_{FN}p
\quad\Longleftrightarrow\quad
p\ge\frac{C_{FP}}{C_{FP}+C_{FN}}.
$$

Nếu bỏ sót đắt gấp bốn báo động sai, ngưỡng lý thuyết là 0.2. Nếu cả hai chi phí đều bằng 0, không dùng phân số $0/0$: mọi quyết định có cùng chi phí 0 theo tiêu chí này, nên chưa có một ngưỡng tối ưu duy nhất. Công thức cần xác suất đáng tin, chi phí đúng bối cảnh và phân phối phù hợp. Với điểm chưa hiệu chỉnh, ràng buộc công suất hoặc chi phí theo từng mẫu, chọn chính sách trên validation thay vì áp dụng 0.2 máy móc.

![Ngưỡng thay đổi false positive, false negative và chi phí](/img/imbalanced-learning.svg)

## Một bảng điểm minh họa
Tám mẫu tự tạo dưới có ba mẫu dương. Điểm được đặt để học cách tính, **không phải xác suất đã được hiệu chỉnh từ mô hình**. Dùng $C_{FP}=1,C_{FN}=4$:

```python
y = [1, 0, 1, 0, 0, 1, 0, 0]
scores = [0.9, 0.8, 0.6, 0.55, 0.4, 0.35, 0.2, 0.1]
for threshold in [0.3, 0.5, 0.7]:
    pred = [p >= threshold for p in scores]
    tp = sum(a == 1 and b for a, b in zip(y, pred))
    fp = sum(a == 0 and b for a, b in zip(y, pred))
    fn = sum(a == 1 and not b for a, b in zip(y, pred))
    print(threshold, tp, fp, fn, fp + 4*fn)
```

Kết quả: `0.3 3 3 0 3`, `0.5 2 2 1 6`, `0.7 1 1 2 9`. Đây là chi phí trên bảng minh họa. Không chọn ngưỡng bằng test rồi báo chính test đó như đánh giá độc lập. Thử [Playground ngưỡng](/playground#threshold) và [Code Lab chi phí](/lab?lab=threshold_cost).

## Protocol tránh tự đánh lừa
Giữ test phản ánh tỷ lệ lớp và thời điểm dự đoán thật. Stratified split giúp giữ lớp trong fold khi mẫu độc lập; nếu có nhóm/thời gian thì ưu tiên cấu trúc đó. Chọn sampling, class weights, hyperparameter và threshold trong train/validation hoặc nested CV. Resample trước split có thể đưa bản sao hoặc thông tin lân cận của test vào train.

Class weighting thay objective, không chỉ thay threshold. Oversampling không tạo thông tin mới như thu thập thêm mẫu độc lập. Nếu tỷ lệ lớp huấn luyện bị thay đổi, kiểm tra score trên phân phối sử dụng; không mặc nhiên gọi `predict_proba` là xác suất đúng.

Báo precision/recall theo ngưỡng và confusion matrix, thêm average precision/PR curve, ROC-AUC, balanced accuracy khi phù hợp và số mẫu mỗi lớp. Average precision không đồng nhất mọi cách tính diện tích PR curve. Reliability diagram và log-loss/Brier giúp khảo sát xác suất; Brier thấp không chứng minh calibration hoàn hảo vì còn phụ thuộc độ phân giải dự đoán và phân phối lớp. Fit calibrator trên dữ liệu ngoài phần fit classifier hoặc dùng cơ chế CV được tài liệu hóa.

## Lỗi thường gặp và hiểu lầm
- “0.5 luôn đúng”: đó là mặc định, không phải quyết định tối ưu mọi chi phí.
- “PR-AUC là đủ”: nó phụ thuộc tỷ lệ lớp; cần bối cảnh và chi phí vận hành.
- “Calibrate rồi chắc chắn công bằng”: calibration và fairness là yêu cầu khác nhau.
- “Không có mẫu dương thì recall bằng 0”: mẫu số bằng 0 nên metric không xác định; cần báo rõ quy ước.

## Bài tập tự đánh giá
1. Tính ngưỡng lý thuyết khi $C_{FP}=2,C_{FN}=8$ và nêu giả định.
2. Tính precision/recall ở threshold 0.5 trong ví dụ.
3. Chọn chính sách khi chỉ xử lý được 20 cảnh báo/ngày như thế nào?

## Đáp án và tiêu chí chấm
1. $2/(2+8)=0.2$; cần xác suất phù hợp, chi phí và phân phối sử dụng đúng (2 điểm).
2. TP=2, FP=2, FN=1: precision=0.5, recall=$2/3$ (3 điểm).
3. Chọn top-k/ngưỡng bằng validation theo ngày, đo recall/chi phí và tải thực; test cuối giữ nguyên, theo dõi prevalence (5 điểm).

## Tổng kết
Ranking, calibration và threshold là ba vấn đề khác nhau. Chọn metric/chính sách theo chi phí và protocol, giữ test ngoài mọi quyết định tuning.

## Nguồn tham khảo
- [scikit-learn: Decision threshold tuning](https://scikit-learn.org/stable/modules/classification_threshold.html).
- [scikit-learn: Probability calibration](https://scikit-learn.org/stable/modules/calibration.html).
- [scikit-learn: Metrics and scoring](https://scikit-learn.org/stable/modules/model_evaluation.html).

Đối chiếu ngày 27/10/2026. Các metric có điều kiện sử dụng; không phải bảo đảm chất lượng ứng dụng.
