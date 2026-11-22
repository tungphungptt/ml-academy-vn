# NeuralClone

NeuralClone là nền tảng học Machine Learning, Deep Learning và AI bằng tiếng Việt. Người học đi từ trực giác và kiến thức tiên quyết đến công thức, ví dụ tính tay, code, quiz và thực hành. Nội dung có nguồn tham khảo; kết quả tương tác phải lấy từ phép tính thật.

## Luồng sản phẩm hiện có

- Trang chủ giới thiệu phương pháp học, lộ trình và thí nghiệm neural.
- `/courses`, trang khóa học và `/search` hỗ trợ tìm bài theo chương trình, cấp độ và nội dung.
- `/learn/[slug]` đọc Markdown, mục lục, prerequisite, lab liên quan, quiz, ghi chú/bookmark, hoàn thành và bài trước/sau. Một số chức năng lưu cần đăng nhập.
- `/lab?lab=...` có code chỉnh được, notebook và kết quả tham khảo. Lab Pyodide thực thi trong Web Worker; các lab CPU/PyTorch chạy cục bộ theo hướng dẫn.
- `/playground` có demo tương tác, gồm ngưỡng quyết định và chi phí FP/FN.
- Auth giữ đường quay lại bài/quiz; tài khoản lưu tiến độ thực tế. Không thêm số người dùng/thành tích minh họa như dữ liệu thật.

## Các ràng buộc đã xác minh

Next.js 16.4.6, React 19.3.1, TypeScript, Prisma/SQLite; Markdown/JSON trong `content` và importer là nguồn nội dung. Database kiểm tra ngày 21/11/2026 có 67 bài và 157 câu quiz; số này là kiểm kê, không phải cam kết chất lượng đồng đều. Bốn bài đã được đào sâu trong đợt content expansion; 63 bài tiếp tục theo ma trận riêng.

Giữ dữ liệu, định danh và tiến độ, các sửa lỗi Firefox/WebKit, NFC/NFD, CSP, timeout Pyodide và bàn phím. `npm run deploy:local` là luồng production local; `npm run local` là development. Kiểm thử ghi dữ liệu dùng database fixture riêng và cổng 3100. Sao lưu trước khi đổi dữ liệu; không reset/push/đổi hạ tầng. Trạng thái tunnel/domain phải kiểm tra khi vận hành, không suy ra từ server local.

Transfer còn strict FAIL 334/360 so với 335/360 lịch sử; thiếu dữ liệu gốc. Nguyên nhân 502 lịch sử chưa xác định. Thiết bị Safari/iOS/Android thật chưa được kiểm chứng. Các kết quả test trong báo cáo cũ không tự trở thành kết quả mới.
