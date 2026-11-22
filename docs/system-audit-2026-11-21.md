# Rà soát hệ thống NeuralClone — 21/11/2026

## Phạm vi và nguồn chính

Bản làm việc: `D:\Projects\ml-academy-vn`. Giữ giao diện NeuralClone đã được xác nhận; rà soát route, API, xác thực, luồng học/admin, cấu hình chạy và SQLite. Các thay đổi chưa commit có sẵn được giữ lại. Báo cáo tháng 10 trong `docs` là bằng chứng lịch sử, không phải kết quả của lần kiểm tra này.

## Các sửa đổi

- Nâng Next.js 16.4.3 → 16.4.6; lockfile đồng bộ, npm audit sau nâng cấp không còn advisory.
- Chuẩn hóa tham số URL lặp trên search/courses/projects/datasets/resources/lab/reset. Next.js truyền mảng cho tham số lặp; gọi `.trim()` trực tiếp trước đây có thể gây 500.
- Trình soạn bài admin gắn bản nháp với đúng filename, khóa lưu khi chọn file khác, giữ nội dung khi mạng lỗi và phục hồi trạng thái nút. Tách thao tác tạo bài mới rõ ràng. Form reset-link có trạng thái chờ và xử lý lỗi mạng.
- Bổ sung câu quiz dùng `max(order) + 1`, tránh trùng thứ tự sau khi xóa câu ở giữa.
- Đổi mật khẩu cập nhật có điều kiện trong transaction, thu hồi reset-link cũ và tránh hai yêu cầu cùng dùng phiên cũ ghi đè mật khẩu mới.
- Email đăng ký/đăng nhập cùng trim và giới hạn 200 ký tự, tránh tạo tài khoản không thể đăng nhập vì giới hạn khác nhau.
- Dedupe xác thực trong một React server render bằng `cache`, không chia sẻ cache người dùng giữa các request. Trang bài học dùng chung truy vấn metadata/page, chạy các truy vấn độc lập song song, giữ thứ tự prerequisite trong catalog và trả 404 nếu thiếu file.
- Dashboard chạy truy vấn độc lập song song; số liệu và quiz gần đây chỉ tính bài đang xuất bản. Dữ liệu lịch sử vẫn nằm trong DB.
- Cache tối đa 128 nội dung bài theo đường dẫn + inode/size/mtime/ctime. Luôn kiểm tra override hiện tại nên sửa/xóa từ bên ngoài cũng có hiệu lực.
- Tách importer backup khỏi module web sang `scripts/legacy-lessons.ts`.
- `local`/`prod` gọi npm CLI qua Node để chạy được trên Windows, không spawn trực tiếp `npm.cmd`.
- Sửa `.env` local có xuống dòng CR đơn khiến `SESSION_SECRET` bị đọc như phần comment; chuẩn hóa xuống dòng và cấu hình khóa phiên ngẫu nhiên 256-bit, không ghi khóa vào báo cáo/Git.
- Hai script kiểm tra curriculum dùng UTF-8 tường minh, chạy được trên Windows có locale cp1252; cache danh sách lab trong lượt kiểm tra thay vì đọc lại từng link.
- Docker context loại `.next-e2e` và ảnh/trace/video QA (2.658 file, khoảng 221 MiB ở lần kiểm kê này). Giữ các bằng chứng QA trên máy; chúng không cần nằm trong image.
- Cập nhật README, PRODUCT, DESIGN và runbook cho đúng CSS, palette, CSP và quy trình migration hiện tại.

## Database

Database gốc có 3 khóa học, 12 module, 67 bài, 67 quiz, 157 câu hỏi, 99 nguồn tham khảo và 1 tài khoản. Không có lỗi integrity/foreign key. Phát hiện DB legacy chưa có lịch sử migration.

Quy trình đã thực hiện:

1. Snapshot nhất quán bằng SQLite online backup API.
2. Đối chiếu schema bản sao với database tham chiếu tạo từ migration initial: không khác biệt.
3. Ghi nhận initial là đã áp dụng; chạy migration mới trên bản sao.
4. So sánh hash toàn bộ dòng của tất cả bảng ứng dụng trước/sau: không đổi. Integrity `ok`, foreign key check rỗng.
5. Lặp lại đối chiếu và migration trên DB chính khi server đã dừng; cùng kết quả bảo toàn dữ liệu.

Migration `20261121000000_query_indexes` chỉ thêm 12 index cho quan hệ, thứ tự bài/quiz, lịch sử quiz theo user, ghi chú và reset token. Không rebuild bảng, reset, seed hoặc thay dữ liệu người dùng.

Snapshot máy này: `C:\Users\Admin\AppData\Local\Temp\opencode\neuralclone-db-review\before.db`. Bản sao thử: `trial.db`; báo cáo không chứa dữ liệu tài khoản: `trial-report.json`, `live-report.json` cùng thư mục. Đây là snapshot trước sửa trên máy local, không thay thế chính sách backup dài hạn.

## Tổ chức và vận hành

- UI và route: `src/app`, `src/components`; nghiệp vụ dùng chung: `src/lib`.
- Metadata/publication/tài khoản/tiến độ: SQLite qua Prisma. Markdown gốc: `content/lessons`; sửa admin: `LESSON_CONTENT_DIR`.
- Migration: `prisma/migrations`; bootstrap chỉ cho database mới. Database đang có dữ liệu phải migrate có kiểm soát, không tự seed khi restart.
- Development: `npm run local`. Production local: `npm run deploy:local`. Sau khi schema đổi, dừng server rồi chạy `npm run db:generate` trước `verify`.
- Unit/integration: `npm run verify`. Browser production fixture: `npm run e2e`, cổng riêng, DB/overrides riêng và `.next-e2e`.

## Kiểm chứng

- `npm run verify`: typecheck và 80/80 test đạt sau khi sinh lại Prisma Client.
- Kiểm tra migration trên bản sao và DB chính: đạt, dữ liệu ứng dụng không đổi.
- `python scripts/check_content.py`: 67 bài, 0 lỗi cấu trúc; `python scripts/audit_spec.py`: 52/52 mục có mapping.
- Production build Next.js 16.4.6: thành công, không cảnh báo build. Manifest của lesson/search/admin-content đều có đủ 67 Markdown, không chứa importer backup hoặc runtime overrides.
- E2E mặc định: lượt đầy đủ 37/39 đạt. Hai failure là selector test: mục tiêu đã chuyển sang disclosure chuẩn bị từ thiết kế hiện có; input có datalist mang role combobox. Cập nhật selector, chạy lại toàn bộ hai file liên quan: 7/7 đạt. Như vậy cả 39 kịch bản đã có kết quả đạt qua lượt đầy đủ và lượt chạy lại có mục tiêu; không ghi thành một lượt 39/39 mới.
- Chrome production thật: trang chủ desktop 1440×1000 và bài Linear Regression mobile 390×844 render đúng, không pageerror/console error; mobile không tràn ngang. Ảnh ở `.local/system-audit-desktop.png` và `.local/system-audit-mobile.png`.
- `npm run deploy:local`: kiểm tra DB/config, build rồi start thành công trên `127.0.0.1:3000`. Health, trang chủ, bài học và URL search có tham số lặp đều HTTP 200.
- `npm audit --json`: 0 vulnerabilities. `git diff --check`: đạt (Git có thông báo chuyển LF/CRLF).

## Giới hạn

Không kiểm chứng lại toàn bộ kết quả mô hình CPU/PyTorch hoặc thiết bị Safari/iOS/Android thật trong đợt sửa hệ thống này. Sai khác transfer lịch sử 334/360 và 335/360 còn được ghi trong PRODUCT. Không thay đổi DNS/tunnel, commit hay push. Các chức năng phụ thuộc CDN cần kết nối Internet khi chạy lần đầu.
