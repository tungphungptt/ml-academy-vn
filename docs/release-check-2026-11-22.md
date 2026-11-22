# Kiểm tra trước khi push — 22/11/2026

## Phạm vi

Toàn bộ bản NeuralClone trong working tree: giao diện, 67 bài/157 câu quiz, các lab/notebook mới, backend, migration chỉ mục, scripts, tests, tài liệu và bằng chứng QA lịch sử. Remote là `tungphungptt/ml-academy-vn`, nhánh đích `main`.

Sau fetch, `HEAD` và `origin/main` cùng ở `a2c2dd4`. Không có PR mở; nhánh remote curriculum không có commit nằm ngoài main. Vì vậy không cần tạo merge commit riêng để gộp nhánh cũ.

## Kiểm chứng mới

- `npm run verify`: typecheck và **80/80 test đạt**.
- `python scripts/check_content.py`: **67 bài, 0 lỗi cấu trúc**.
- `python scripts/audit_spec.py`: **52/52 mục có mapping**, không thiếu/partial.
- `npm run db:status`: **2 migration, schema up to date**.
- `npm audit --json`: **0 vulnerabilities**.
- Production local: `/api/health` và `/` trả **HTTP 200**.
- `git diff --cached --check`: đạt sau dọn hai khoảng trắng cuối dòng.
- Quét file dự kiến publish, bao gồm nội dung trace ZIP: không phát hiện private key, GitHub token, JWT phiên, bcrypt hash hay giá trị secret hiện tại trong `.env`. `.env`, SQLite cá nhân, thư mục `.local` và build artifacts được Git ignore.

## Browser tests

Lượt đầy đủ đầu tiên: **38/39 đạt**; test mở mục chuẩn bị của 8 bài mới bị timeout chờ hydration. Chạy riêng file đó với trace: **3/3 đạt**. Không bỏ test hoặc bật retry để che failure. Lượt đầy đủ tiếp theo chạy riêng với `--trace retain-on-failure`: **39/39 đạt trong 5,6 phút, không retry**. Chưa xác định chắc chắn nguyên nhân timeout của lượt đầu; giữ lại kết quả này để theo dõi độ ổn định.

E2E tự build production bằng Next.js 16.4.6, dùng database/overrides fixture riêng trên cổng 3100. Bao phủ toàn bộ 67 bài, đăng ký/đăng nhập, quiz, tiến độ/ghi chú, quyền truy cập, reset mật khẩu, admin editor, URL lặp, Python thật trong browser, theme/font và layout nhiều kích thước.

## Giới hạn giữ nguyên

Không chạy lại toàn bộ CPU/PyTorch notebook hoặc thiết bị Safari/iOS/Android thật. Sai khác transfer lịch sử vẫn được ghi trong PRODUCT và các báo cáo chuyên biệt. Tài liệu QA tháng 10 là lịch sử; không coi kết quả cũ là kết quả mới. Push mã nguồn không tự đồng bộ `.env`, SQLite hoặc thay DNS/tunnel.
