**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** CNN, Thực hành PyTorch: MLP và CNN.
**Mục tiêu:** huấn luyện bộ lọc convolution thực sự trên CPU, chọn checkpoint bằng validation và so sánh với baseline.

## Bài này khác bộ lọc chọn tay thế nào?
Bài CNN practice cũ giữ kernel cố định và chỉ học bộ phân loại. Ở đây `Conv2d` có tham số được cập nhật bởi backpropagation cùng với lớp cuối. Việc mạng chạy đúng shape chưa chứng minh nó đã học; cần kiểm tra loss, validation và test không tham gia lựa chọn mô hình.

Digits tích hợp scikit-learn chứa 1.797 ảnh xám 8×8, 10 lớp. Không tải mạng khi chạy; chỉ lấy dataset đã đi kèm thư viện. Nguồn gốc là bộ optical digits của UCI; license upstream chưa được xác minh trực tiếp trong môi trường này, nên không phát lại một bản CSV riêng hoặc gán license thay cho tác giả dữ liệu.

## Dữ liệu, kiến trúc và phép đếm
Giá trị pixel 0–16 được chia cho hằng 16 (không ước lượng bằng test). Chia có phân tầng: train 1.149, validation 288, test 360. Tensor đầu vào $(N,1,8,8)$ qua Conv $3\times3$, padding 1, 8 kênh rồi ReLU và max pooling $2\times2$ thành $(N,8,4,4)$; flatten 128 giá trị, Linear 128→10 cho logits.

Convolution có $3\cdot3\cdot1\cdot8+8=80$ tham số, Linear có $128\cdot10+10=1290$, tổng 1370. Receptive field của một ô sau conv+pool là 4×4 với bước hiệu dụng 2; head fully connected kết hợp tất cả vị trí. Đây là mạng nhỏ, không phải kiến trúc state-of-the-art.

## Quy trình thực nghiệm CPU
[Mở lab CNN CPU](/lab?lab=cnn_cpu), rồi chạy từ repository root:
```bash
python labs/cnn_cpu/library.py
# Thí nghiệm riêng, augmentation chỉ áp dụng trên train:
python labs/cnn_cpu/library.py --augment
```
Mini-batch tối đa 64, AdamW, gradient clipping, StepLR; giữ checkpoint có validation CE thấp nhất trong tối đa 16 epoch, early stopping nếu không cải thiện 4 epoch. Chọn xong mới đánh giá test. Tuỳ chọn augmentation dịch ảnh tối đa một pixel bằng padding/crop, không biến đổi validation/test; không mặc định mọi augmentation đều bảo toàn nhãn hay nâng chất lượng.

Code ghi `cnn-curves.json` và `cnn.pt` trong `.local/curriculum-output`. Nạp lại bằng `weights_only=True`, `map_location='cpu'`, `eval()`, rồi assert logits trùng trước/sau nạp. Không tải checkpoint từ nguồn lạ.

## Kết quả thực đo và cách diễn giải
Với seed 17, PyTorch 2.14.1+cpu và sklearn 1.8.0, bản không augmentation chọn epoch 16: test accuracy **0,9500**. Logistic Regression trên pixel, fit cùng train, đạt **0,9639**. CNN đã học tốt hơn chance 0,1 nhưng **không thắng baseline** này. 360 mẫu test không đủ để suy rộng sang chữ số ngoài miền, ảnh lớn, hoặc kết luận mọi CNN kém hơn mô hình tuyến tính. Biến thể augmentation đã chạy trên cùng split, chọn epoch 16 và đạt accuracy 0,9222; dịch một pixel trên ảnh 8×8 có thể làm mất nét quan trọng, nên không mặc định augmentation giúp. Hai giao thức đã định trước được báo riêng, không dùng test để tune tiếp. Chưa có thí nghiệm nhiều seed/ước lượng CI.

## Lỗi thường gặp và giới hạn
Dùng softmax trước CE; chọn epoch theo test; chỉ gọi `train()` khi đánh giá; clone checkpoint bằng tham chiếu thay vì deepcopy; augment trước split làm ảnh gần trùng lọt sang test. Vẫn cần kiểm tra duplicate theo nguồn khi dataset ngoài gồm nhiều ảnh của cùng người. Training curves hữu ích hơn chỉ một metric cuối.

## Bài tập tự đánh giá
1. Tính tổng số tham số của mô hình trong bài.
2. Đọc file curves: epoch validation tốt nhất có luôn là epoch train loss thấp nhất không?
3. Thiết kế so sánh augmentation/no augmentation công bằng mà không dùng test để chọn transform.

## Đáp án và tiêu chí chấm
1. $80+1290=1370$, không đếm ReLU/pool là trọng số học được (2 điểm).
2. Không; train loss thường giảm trong khi validation có thể tăng. Chọn checkpoint theo validation, không theo file test prediction (3 điểm).
3. Giữ split/seed/protocol và baseline, chọn transform bằng train/validation; báo test cuối cho protocol cố định, thời gian và độ bất định. Không bảo đảm augmentation giúp trên ảnh 8×8 (5 điểm).

## Tổng kết
Một CNN chạy được trên CPU không cần tải MNIST hay GPU. Quy trình và baseline quyết định cách diễn giải metric, không phải tên kiến trúc.

## Nguồn tham khảo
- [ML cơ bản: convolution 2D](https://machinelearningcoban.com/2018/10/03/conv2d), đối chiếu snapshot nguồn.
- [Stanford CS231n](https://cs231n.stanford.edu/).
- [PyTorch: tối ưu mô hình](https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html), nguồn chính thức đã đọc.
