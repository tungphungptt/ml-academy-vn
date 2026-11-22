# NeuralClone — thiết kế hiện hành

Đối chiếu với mã nguồn ngày 21/11/2026. Thứ tự CSS trong `src/app/layout.tsx` là nguồn quyết định cascade; các báo cáo thiết kế tháng 10 trong `docs` là lịch sử.

## Bản sắc và nguồn có thẩm quyền

Không gian học tập kết hợp triển lãm AI: giấy ấm hoặc nền xanh đen, điểm nhấn hổ phách, diagram neural và đường dữ liệu có ý nghĩa. `design-tokens.css` cung cấp token; `fonts.css` cung cấp WOFF2 tự host. Sau `globals.css`, thứ tự lớp giao diện là `apple-design.css` → `learning-experiments.css` → `workspace.css` → `exhibition.css`. `studio.css` không còn trong bản hiện tại.

- Light: nền #f5f1e9, bề mặt #fffcf6, chữ #262b2d, màu hành động #875016.
- Dark: nền #0d151d, bề mặt #172129, chữ #f3ede3, màu hành động #efbf7a.
- Be Vietnam Pro: thân bài, heading và controls. Lora: các vùng display/biên tập được chọn trong CSS. Monospace hệ thống: code. KaTeX giữ font toán riêng.
- Spacing hiện có: .25/.5/.75/1/1.5/2/3/4/6rem. Dùng token theo quan hệ nhóm và phân đoạn; không thêm khoảng cách rời rạc để chữa layout thiếu nguyên tắc.
- Kiểm tra computed style và chiều rộng thực tế trước khi tinh chỉnh typography; các lớp workspace/exhibition có override responsive nên không suy ra từ `globals.css` đơn lẻ.

## Mục đích theo bề mặt

| Bề mặt | Mode | Người học thành công khi |
|---|---|---|
| Trang chủ/giới thiệu | Persuade | Hiểu giá trị và chọn bước bắt đầu phù hợp |
| Bài học/tài liệu/thư viện | Read | Tìm, đọc và hiểu kiến thức theo trình tự |
| Quiz/Code Lab/thí nghiệm/tài khoản | Operate | Biết thao tác gì, thấy trạng thái và kết quả đúng |

Mode là thuộc tính của từng bề mặt, không áp một kiểu trình bày cho toàn sản phẩm. Vùng đọc không reveal nội dung theo cuộn; giữ suy luận, giả định và các bước tính dễ tìm. Bảng/code/toán dài dùng vùng cuộn riêng, giữ toàn trang không tràn.

## Kết hợp Apple Design và Impeccable

Apple Design hỗ trợ phản hồi ngay, quan hệ không gian, disclosure có thể ngắt, trạng thái bàn phím và reduced motion. Impeccable hỗ trợ đánh giá hierarchy, measure, mật độ, nhịp, copy và độ bền triển khai. Trong Operate, trạng thái số cập nhật đồng thời từ cùng hàm tính; không animation làm số và hình lệch thời điểm. Trong Read, ưu tiên đường đọc liên tục, heading có thứ bậc, nguồn và prerequisite rõ. Trang chủ giữ focal neural motion hiện có, dừng khi ngoài viewport/tab ẩn và có phương án tĩnh.

Chỉ tinh chỉnh sau khi có bằng chứng ở màn hình thật. Không đổi font/palette vì cảnh báo chung của detector. Native controls và biểu diễn hình học khoa học được giữ. Không thêm dependency/motion/blur nếu chưa chứng minh lợi ích. Critique/audit, detector và kiểm tra thiết bị thật phải ghi riêng phạm vi; không suy ra chất lượng từ test pass đơn thuần.
