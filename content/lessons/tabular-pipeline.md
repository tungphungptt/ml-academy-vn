**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Feature Engineering và Data Leakage, Logistic Regression.
**Mục tiêu:** xây pipeline dữ liệu bảng có cột số/categorical, xử lý thiếu và category mới mà không nhìn nhãn test.

## Bài toán và hợp đồng dữ liệu
Ví dụ tự sinh 500 hàng: tuổi, thu nhập và vùng; nhãn nhị phân phụ thuộc tuổi/thu nhập có nhiễu. Đây không phải dữ liệu khách hàng thật và không được dùng suy luận chính sách cho con người. Không có tải dataset; kích thước làm việc nhỏ, chạy CPU bằng pandas và scikit-learn. Một số giá trị bị khuyết ngẫu nhiên và một số thu nhập bị nhân lớn để mô phỏng lỗi đo.

Xác định kiểu, đơn vị và thời điểm có sẵn của mỗi cột trước khi chọn mô hình. ID người dùng không tự nhiên là số có thứ tự; địa phương là nominal, không nên mã hóa Bắc=1, Trung=2, Nam=3 rồi giả định khoảng cách đều. Với dữ liệu người dùng thật, dùng group split để cùng người không lọt sang test. Với thời gian, dùng split theo thời gian thay vì xáo trộn.

## Quy trình có thể tái lập
Chia 375 hàng train và 125 test có phân tầng trước khi EDA phục vụ quyết định. Trên train, xem tỷ lệ thiếu, quantile và nhãn; các quy tắc chọn sau khi xem test sẽ làm test mất vai trò đánh giá độc lập.

Nhánh số điền median và thêm missing indicator, sau đó RobustScaler. Nhánh categorical điền mode rồi one-hot, `handle_unknown='ignore'` làm category chưa thấy thành vector 0 ở nhánh tương ứng. Nó tránh lỗi runtime, không bảo đảm mô hình hiểu được category mới; cần giám sát tỷ lệ unknown khi triển khai.

Sau ColumnTransformer là chọn đặc trưng có giám sát và Logistic Regression. Toàn bộ pipeline được đưa vào từng fold CV; chọn đặc trưng không được fit bên ngoài CV. RobustScaler dùng median/IQR, không tự phát hiện hay xóa outlier. Quy tắc IQR trong script chỉ gắn cờ 19 hàng train để điều tra; “hiếm” không đồng nghĩa “sai”.

## Thực hành và kết quả quan sát
[Mở lab dữ liệu bảng](/lab?lab=tabular_pipeline). Chạy từ thư mục gốc repository:
```bash
python labs/tabular_pipeline/library.py
```
Script hoàn chỉnh dùng NumPy, pandas, Matplotlib và scikit-learn; lưu biểu đồ tỷ lệ thiếu của train vào `.local/curriculum-output/missing-train.png`. Có thể đổi thư mục qua `ML_ACADEMY_OUTPUT_DIR`.

Lần kiểm tra CPU với seed 7 và sklearn 1.8.0: CV ROC-AUC trung bình 0,9855; test ROC-AUC 0,9247, F1 tại ngưỡng 0,5 là 0,9048; baseline prior ROC-AUC 0,5. Không so CV với test như hai mẫu độc lập hay coi độ chênh là bằng chứng drift: đây là một split nhỏ và có category mới được chủ động đưa vào test. Không tối ưu ngưỡng trên tập test; nếu cần chọn ngưỡng, chọn trên validation hoặc dự đoán out-of-fold của train.

## Giả định, ưu nhược điểm và lỗi thường gặp
Logistic Regression giả định log-odds tuyến tính theo đặc trưng đã biến đổi, không giả định mọi đặc trưng có phân phối chuẩn. Điền median/mode có thể xóa tín hiệu của việc thiếu; missing indicator giúp phần nào nhưng không chữa missing-not-at-random. One-hot phù hợp ít category; cardinality rất lớn cần chiến lược khác và kiểm soát leakage. Lưu cả pipeline để tên cột, thứ tự, phép điền và encoder cùng đi vào suy luận.

## Bài tập tự đánh giá
1. Vì sao không tính median trên cả 500 hàng?
2. Thay RobustScaler bằng StandardScaler và so CV trên cùng train/folds; không chọn theo test.
3. Một bệnh nhân có nhiều lần khám: thiết kế lại split, metric và cách kiểm tra missingness để tránh báo cáo quá lạc quan.

## Đáp án và tiêu chí chấm
1. Test đã góp thông tin vào bước học tiền xử lý; median phải được fit trong phần train mỗi fold (2 điểm).
2. Đặt scaler trong cùng pipeline, dùng cùng CV và seed; báo mean/std, không chỉ một score. RobustScaler bớt nhạy với outlier nhưng không mặc định tốt hơn (3 điểm).
3. Group split theo bệnh nhân, kiểm tra giao tập ID rỗng; nếu dự đoán tương lai thì tôn trọng thời gian. Metric theo chi phí sai lầm, chỉ chọn threshold trên train/validation. Ghi missingness theo nguồn và thời gian, không xóa bệnh nhân sau khi nhìn nhãn test (5 điểm).

## Tổng kết
Pipeline là đơn vị fit/validate/save, không chỉ một tiện ích viết code. Một mô hình đơn giản với giao thức đúng có giá trị hơn score cao do leakage.

## Nguồn tham khảo
- [Cẩm nang dữ liệu bảng: mục lục](https://machinelearningcoban.com/tabml_book/ch_intro/main_contents.html) và các chương pipeline/missing/outliers/categorical, đối chiếu snapshot `tiepvupsu/tabml_book` ghi trong audit.
- [ML cơ bản: Feature Engineering](https://machinelearningcoban.com/general/2017/02/06/featureengineering/).
