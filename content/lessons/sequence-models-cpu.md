**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** RNN và LSTM, Thực hành PyTorch: MLP và CNN.
**Mục tiêu:** huấn luyện GRU dự báo một bước, kiểm soát ranh giới thời gian và so sánh với dự báo giá trị cuối.

## Bài toán và dữ liệu tự sinh
Tạo chuỗi 960 thời điểm bằng hai sóng sin cộng nhiễu Gaussian với seed 23. Mỗi input gồm 12 quan sát gần nhất, target là quan sát ngay sau đó. Đây là bài tập dự báo chuỗi có cấu trúc rõ và ít nhiễu, không phải benchmark tài chính hoặc mô hình ngôn ngữ. Không có download dataset, không có dữ liệu cá nhân.

Train có target trước mốc 640; validation từ 640 đến 799; test từ 800 đến 959. Có 628, 160, 160 cửa sổ tương ứng. Mean/std chỉ ước lượng từ 640 quan sát đầu. Với one-step rolling prediction, lịch sử thực trước mỗi thời điểm dự báo đã được quan sát; vì vậy cửa sổ test có thể chứa lịch sử validation hay những thời điểm test trước đó. Không dùng target hiện tại hoặc tương lai làm feature. Đây không phải multi-step free-running forecast.

## GRU và BPTT trong code
Input shape $(N,12,1)$, GRU hidden size 16 trả state ở mỗi thời điểm; lấy state cuối qua Linear 16→1. Cùng trọng số được dùng ở 12 bước. Backpropagation through time lan truyền gradient qua đồ thị được unroll; clipping norm 1 sau backward giúp hạn chế exploding gradients, không khiến mạng nhớ vô hạn.

Với chuỗi độc lập theo cửa sổ, hidden state được khởi tạo mới mỗi forward. Nếu giữ hidden từ batch này sang batch khác, phải bảo đảm thứ tự và detach đúng lúc; không dùng hidden từ train như thông tin tương lai cho validation.

## Chạy thí nghiệm hoàn chỉnh
[Mở lab dự báo chuỗi](/lab?lab=sequence_cpu).
```bash
python labs/sequence_cpu/library.py
```
Script chạy CPU một thread, Adam với learning rate 0,01, 40 epoch, chọn checkpoint bằng MSE validation. Shuffle thứ tự các cửa sổ **bên trong tập train** không thay đổi split theo thời gian, nhưng không tạo thêm dữ liệu độc lập. File `sequence-curves.json` được ghi trong `.local/curriculum-output`.

Baseline là $\hat x_t=x_{t-1}$. Metric báo ở đơn vị gốc: $MSE=\frac1N\sum_t(x_t-\hat x_t)^2$, nên nhân MSE của giá trị chuẩn hóa với $\sigma_{train}^2$. Không nhầm MSE với RMSE, hoặc so loss của hai thang đo khác nhau.

## Kết quả và giới hạn
Trên môi trường kiểm tra Python 3.12/PyTorch 2.14.1+cpu, validation chọn epoch 38. Test MSE baseline **0,004598**, GRU **0,001828**. Đây là một lần chạy trên chuỗi do chính ví dụ sinh; không chứng minh GRU luôn tốt hơn persistence. Mô hình chưa được đánh giá trong regime shift, missing timestamps hoặc dự báo nhiều bước. Dữ liệu cửa sổ có tương quan, nên bootstrap từng hàng như độc lập sẽ đánh giá sai độ bất định.

## Lỗi thường gặp
Chia ngẫu nhiên cửa sổ chồng lấn trước khi kiểm tra thời gian; fit scaler trên toàn chuỗi; đánh giá nhiều bước nhưng đưa giá trị thật ở giữa như thể đó là dự đoán tự do; chọn hidden size bằng test; quên chuyển `eval()`/`no_grad()`.

## Bài tập tự đánh giá
1. Target đầu tiên là thời điểm nào khi lookback $=12$?
2. Nếu đầu vào chuẩn hóa và $\operatorname{MSE}=0.01$, độ lệch chuẩn train $=2$, MSE đơn vị gốc là bao nhiêu?
3. Đổi mục tiêu sang dự báo 10 bước không có quan sát mới: cần thay dữ liệu, baseline và protocol ra sao?

## Đáp án và tiêu chí chấm
1. Thời điểm 12, input 0–11; không dùng giá trị ở 12 làm feature (2 điểm).
2. $0,01\times2^2=0,04$, RMSE gốc là 0,2 (3 điểm).
3. Target là vector 10 bước hoặc rollout dự đoán; không feed ground truth của các bước chưa quan sát. Dùng baseline persistence/seasonal nếu phù hợp, split theo target horizon và đánh giá từng horizon. Chọn cấu hình bằng validation theo cùng protocol (5 điểm).

## Tổng kết
RNN thực hành phải có giao thức thời gian đúng và baseline mạnh. Seed cố định giúp tái lập một thí nghiệm, không thay thế đánh giá ngoài miền.

## Nguồn tham khảo
- [D2L: GRU](https://d2l.ai/chapter_recurrent-modern/gru.html) và chương recurrent networks; đã đọc nguồn chính thức.
- [PyTorch: optimization loop](https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html), đối chiếu nguồn GitHub chính thức.
