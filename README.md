# ML Academy VN (bản khởi đầu)

Nền tảng học ML/DL tiếng Việt. **Đây là bộ khung chạy được theo thiết kế nhưng chưa được cài đặt/build/test.**

## Chạy
```bash
cp .env.example .env   # đổi SESSION_SECRET và ADMIN_PASSWORD
npm run setup          # cài gói, tạo DB SQLite, seed
npm run dev            # http://localhost:3000
```
## Đã có
Schema Prisma đầy đủ các thực thể; đăng ký/đăng nhập (bcrypt + JWT cookie httpOnly); API tiến độ và chấm quiz phía server; 3 learning path, 24 bài trong danh mục; 1 bài đầy đủ (Linear Regression, LaTeX) và code `labs/linear_regression.py`.
## Đã thêm ở đợt 2
Trang đăng nhập/đăng ký, đăng xuất, nút hoàn thành bài (lưu DB), form quiz (chấm phía server, hiện đáp án sau khi nộp, làm lại được).

## Đã thêm ở đợt 3
Trang `/playground` với 3 demo tính thật trong trình duyệt: Linear Regression + Gradient Descent (learning rate, epoch, đường loss, phát hiện phân kỳ), KNN (ranh giới theo K), K-Means (từng bước). Logic ở `src/lib/ml.ts`; test: `npm test`.

## Đã thêm ở đợt 4
`/lab`: Code Lab với 6 bài (Linear Regression, KNN, K-Means, Logistic Regression, Perceptron, MLP PyTorch), mỗi bài có bản From Scratch/Library (code ở `labs/<id>/`). Nút Run chạy thật bằng Pyodide (cần Internet lần đầu); bài PyTorch chỉ chạy local. Có Reset/Copy/Download .py. Kết quả kỳ vọng sinh bằng `python scripts/gen_labs.py`. Chưa có: tô màu cú pháp (đang dùng textarea), notebook .ipynb, chạy trong Web Worker.

## Đã thêm ở đợt 5
Dashboard tiến độ theo khóa học + quiz gần đây + gợi ý bài tiếp theo (trang chủ khi đăng nhập); bookmark và ghi chú (API kiểm tra quyền sở hữu); trang `/datasets` (4 dataset tích hợp scikit-learn), `/resources` (8 nguồn), `/projects` (3 dự án); `/admin` (chỉ ADMIN, bật/tắt xuất bản khóa học). Cần chạy lại `npx prisma db push` và `npm run db:seed`.

## Đã thêm ở đợt 6
3 bài mới đầy đủ (Gradient Descent, KNN, K-Means), tổng 4 bài đầy đủ. Quiz nay đọc từ `content/quizzes/<slug>.json`, nguồn tham khảo từ trường `src` trong `content/catalog.json`. Kiểm tra nội dung: `python scripts/check_content.py`. **DB cũ cần xóa và seed lại** (`rm prisma/dev.db && npm run setup`) vì seed bỏ qua khóa học đã có module. Các liên kết nguồn chưa được mở kiểm tra trực tiếp (không có mạng khi biên soạn).

## Đã thêm ở đợt 7
12 bài đầy đủ (thêm Logistic Regression, Decision Tree, Metrics, Perceptron, MLP, Backpropagation, PCA, Naive Bayes) cùng quiz và nguồn; `/courses/[slug]` (chi tiết khóa học, tiến độ), tìm kiếm + lọc trình độ/tình trạng ở `/courses`; nút đổi sáng/tối (nhớ lựa chọn, theo mặc định của hệ thống). Cần xóa DB cũ và seed lại.

## Đã thêm ở đợt 8
Playground Decision Tree (độ sâu, cấu trúc cây, vùng quyết định), PCA (nhiễu, chiếu lên PC1, tỉ lệ phương sai), Neural Network (số neuron ẩn, learning rate, epoch; huấn luyện MLP thật bằng backprop trong trình duyệt trên XOR). Logic ở `src/lib/ml2.ts`, chấm quiz tách ra `src/lib/quiz.ts`. `npm test` chạy 12 test.

## Đã thêm ở đợt 9
Notebook `.ipynb` cho mọi bài lab (sinh bằng `python scripts/gen_labs.py` vào `public/notebooks/`, nút Download Notebook trong Code Lab). Dùng với Google Colab: vào colab.research.google.com, chọn Tải lên, chọn file `.ipynb`; chưa có liên kết "mở trực tiếp" vì chưa xuất bản notebook lên URL công khai. Admin: thêm/xóa tài nguyên với validation phía server (`src/lib/validation.ts`, chỉ chấp nhận URL https).

## Đã thêm ở đợt 10
4 bài Deep Learning (Optimizers, CNN, RNN và LSTM, Attention và Transformer), tổng 16 bài đầy đủ. `python scripts/run_lesson_code.py` chạy mọi khối code trong bài học và so khớp với "Kết quả kỳ vọng" (9/9 khớp khi phát triển). Bài Attention và Transformer tập trung vào attention; multi-head, positional encoding mới giới thiệu ngắn. Bài CNN chưa có lab PyTorch.

## Đã thêm ở đợt 11
Code Lab chạy Python trong **Web Worker** (`public/pyodide-worker.js`): không đơ tab, có nút Stop, giới hạn 90 giây, namespace mới cho mỗi lần chạy. Ô soạn thảo có tô màu cú pháp Python (`src/lib/highlight.ts`, không thêm dependency). 5 bài mới: Softmax Regression, Ridge và Lasso, SVM, Random Forest, Đạo hàm và gradient; tổng 21 bài. `run_lesson_code.py`: 14/14 khối code khớp.

## Đã thêm ở đợt 12
3 bài Track A (Vector và ma trận, Xác suất cơ bản, NumPy/pandas/Matplotlib), tổng 24 bài; `/admin` thêm/xóa dataset có validation phía server.

## Đã thêm ở đợt 13
4 bài mới trong module "Đánh giá và ứng dụng" của Track B: Bias-Variance và Overfitting, Cross-validation, Feature Engineering và Data Leakage, Recommendation Systems; tổng 28 bài. `run_lesson_code.py`: mọi khối code khớp kết quả kỳ vọng. Số liệu bài Bias-Variance có hiệu ứng overfit khá nhẹ với 30 điểm; bài nói rõ điều đó.

## Đã thêm ở đợt 14
4 bài mới (Gaussian Mixture Models, Anomaly Detection, Autoencoder, Transfer Learning), tổng 32 bài; `run_lesson_code.py`: 29/29 khối code khớp. Hai đoạn PyTorch (Autoencoder, Transfer Learning) chưa được chạy và được ghi rõ trong bài. `/admin` nay quản lý đầy đủ module, bài học (kiểm tra slug, file nội dung tồn tại, chặn đường dẫn lạ) và câu hỏi quiz (2-6 lựa chọn, đáp án hợp lệ), cùng khóa học, tài nguyên, dataset.

## Đã thêm ở đợt 15
7 bài cuối của catalog (Python cho ML, Hyperparameter Tuning, Quy trình dự án ML, Autograd, Thực hành PyTorch, Embeddings, GAN/VAE/Diffusion). Nay **mọi bài trong `content/catalog.json` (39 bài) đều có nội dung**, `run_lesson_code.py`: 36/36 khối code khớp. Các đoạn PyTorch chưa được chạy (ghi rõ trong từng bài).

## Đã thêm ở đợt 16
Giao diện mới (thẻ, lưới, hero, thanh điều hướng cố định, kiểu chữ và màu thống nhất sáng/tối, footer). Trang bài học có huy hiệu, nút bài trước/sau. 4 bài bổ sung theo đặc tả (AI/ML/DL, Activation Functions, Regularization & LR Scheduling, Chuẩn bị dữ liệu): 43 bài. 12 hình SVG tự vẽ (`python scripts/gen_images.py`), trong đó 2 hình có hoạt ảnh (Gradient Descent, tích chập), nhúng vào 12 bài. `python scripts/audit_spec.py` đối chiếu catalog với đặc tả A1-C22.

## Đã thêm ở đợt 17
3 bài còn thiếu theo đặc tả (Thống kê mô tả và ước lượng tham số, Phân loại cảm xúc văn bản, Lưu mô hình và triển khai): 46 bài, `audit_spec.py` báo 47 mục có bài riêng, 5 mục chỉ được nhắc trong bài khác (B3, B5, C5, C13, C17), 0 mục thiếu. 45 hình SVG tự vẽ (2 hình có hoạt ảnh) nhúng vào 45/46 bài (chỉ bài Python cho ML không có hình).

## Đã thêm ở đợt 18
**Giao diện/hoạt ảnh:** chuyển trang mượt (`template.tsx`), thẻ xuất hiện lần lượt, hero chuyển màu chậm, vòng tiến độ có hoạt ảnh, thanh tiến độ đọc + nút lên đầu trang, mục lục bài học tự đánh dấu mục đang đọc, chế độ đọc tập trung, trạng thái loading (skeleton)/lỗi/404, liên kết bỏ qua điều hướng, tôn trọng `prefers-reduced-motion`. **Chức năng:** tìm kiếm toàn văn không phân biệt dấu (`/search`, ô tìm trên thanh điều hướng), ghi nhận thời gian học thực (chỉ tính khi tab đang hiển thị, hiện ở dashboard; cần `prisma db push` lại vì thêm bảng `StudyTime`), quiz xáo trộn thứ tự lựa chọn, vòng tiến độ ở dashboard và danh sách khóa học. **Nội dung:** 3 bài mới (Loss Functions, Polynomial Regression, Kiến trúc Transformer): 49 bài; 8 dự án Track D (3 dự án mới dùng dữ liệu tự sinh hoặc dataset bạn tự chọn, đã ghi rõ); `audit_spec.py`: 51 mục có bài riêng, 1 mục chỉ một phần (C13), 0 mục thiếu. 48 hình SVG.

## Triển khai

**Một lệnh (localhost, chế độ phát triển):** `npm run local`: tự tạo `.env` (khóa phiên và mật khẩu admin ngẫu nhiên, in ra màn hình), cài gói, tạo DB SQLite, nạp nội dung, mở http://localhost:3000.
**Một lệnh (bản tối ưu `next build` + `next start`):** `npm run prod`. Cờ: `-- --reset` xóa DB cũ và nạp lại nội dung (cần khi cập nhật bản mới), `PORT=4000` đổi cổng, `-- --dry` chỉ in các bước.

**Docker:** tạo `.env` từ `.env.example` (đặt `SESSION_SECRET` >= 32 ký tự và mật khẩu admin), rồi `docker compose up --build -d`. Dữ liệu SQLite nằm trong volume `mldata`; có healthcheck tại `/api/health`. Cập nhật: `docker compose up --build -d` (nội dung được nạp lại, tiến độ người dùng giữ nguyên; nếu thêm khóa học mới vào catalog hãy xóa volume hoặc thêm bằng trang /admin).

**Biến môi trường:** `DATABASE_URL` (mặc định SQLite), `SESSION_SECRET` (bắt buộc, >= 32 ký tự; ứng dụng báo lỗi nếu thiếu), `ADMIN_EMAIL`/`ADMIN_PASSWORD` (tạo tài khoản quản trị khi nạp dữ liệu), `COOKIE_SECURE` (`false` khi dùng HTTP ngoài localhost; mặc định `true` ở production), `PORT`.

**Bảo mật đã có:** mật khẩu băm bcrypt; cookie phiên httpOnly + SameSite=Lax; kiểm tra quyền admin ở server; giới hạn tần suất đăng nhập (8 lần/10 phút/IP) và đăng ký (5 lần/giờ/IP) *trong bộ nhớ một tiến trình*; chặn yêu cầu ghi từ nguồn lạ (kiểm tra `Origin` trong `src/middleware.ts`); header an toàn (nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy). **Chưa có:** Content-Security-Policy (vì Code Lab tải Pyodide từ CDN), giới hạn tần suất dùng chung giữa nhiều máy chủ, xác thực email, đặt lại mật khẩu. Hãy đặt sau HTTPS (reverse proxy) khi đưa ra Internet.

**Sao lưu:** sao chép file SQLite (`prisma/dev.db` hoặc `/data/app.db` trong Docker). Chuyển sang PostgreSQL: đổi `provider` và `DATABASE_URL` trong `prisma/schema.prisma`, chạy `prisma db push` (chưa được thử trong dự án này).

**Xử lý sự cố:** lỗi `SESSION_SECRET` -> kiểm tra `.env`; đăng nhập xong vẫn như chưa đăng nhập khi chạy qua HTTP -> đặt `COOKIE_SECURE=false`; bài mới không hiện -> `npm run local -- --reset`; `npm run verify` chạy typecheck và 22 unit test.

## Đã thêm ở đợt 19
Thanh điều hướng mới (đánh dấu trang hiện tại, menu thu gọn trên điện thoại, tìm kiếm và đổi sáng/tối trong cùng thanh), trang chủ mới có minh họa mạng nơ-ron chuyển động, số liệu tự đếm, lộ trình 3 bước và các bài xem thử kèm hình; khối code trong bài có nhãn ngôn ngữ, nút Sao chép và tô màu Python; ô "Kết quả kỳ vọng" nổi bật; Playground có menu nhảy nhanh và mỗi demo là một thẻ riêng; favicon; footer; kiểu in (ẩn thanh điều hướng).

## Đã thêm ở đợt 20 (bản 1.0.0)
Tối ưu và triển khai: bộ nạp nội dung có cache (`src/lib/content.ts`, dùng cho tìm kiếm và số liệu trang chủ), trang chủ không truy vấn DB khi chưa đăng nhập, cache cho ảnh và notebook, `npm run prod`, Dockerfile + docker-compose + healthcheck, `/api/health`, giới hạn tần suất đăng nhập/đăng ký, kiểm tra Origin, header an toàn, kiểm tra độ dài `SESSION_SECRET`, `COOKIE_SECURE` cấu hình được. Kiểm tra: 22 unit test; `tsc --strict` sạch trên 9 thư viện thuần; 74 file .ts/.tsx không lỗi cú pháp (bằng TypeScript compiler API); typecheck ngữ nghĩa toàn bộ mã ứng dụng với khai báo giả cho thư viện ngoài, không có lỗi nào ngoài các cảnh báo do khai báo giả.

## Đã thêm ở đợt 21 (bản 1.1.0)
7 notebook cho dự án Track D (`public/notebooks/projects/`, sinh bằng `python scripts/gen_project_notebooks.py`; **mọi ô đã được chạy thật và lưu output thật**), nút tải notebook ở `/projects`; bài Thực hành CNN (bộ lọc tích chập làm đặc trưng trên Digits, có kết quả đo thật và nêu rõ đây không phải CNN được huấn luyện): 50 bài, `audit_spec.py` báo 52 mục đủ, 0 thiếu; admin có Sửa (module, bài học, câu hỏi) và đổi thứ tự lên/xuống; trang `/account` để đổi mật khẩu; Content-Security-Policy chế độ chỉ báo cáo. 24 unit test.

## Đã thêm ở đợt 22 (bản 1.2.0)
**Tài khoản:** quên mật khẩu qua *liên kết do quản trị viên tạo* (`/admin` → "Đặt lại mật khẩu"; token ngẫu nhiên 256-bit, chỉ lưu băm SHA-256, hết hạn sau 60 phút, dùng một lần); đổi hoặc đặt lại mật khẩu sẽ **đăng xuất các thiết bị khác** (`tokenVersion`). Chưa gửi email vì cần dịch vụ thư. **Admin:** soạn trực tiếp file Markdown/LaTeX của bài học (ghi vào `content/lessons/`, tên file được kiểm tra chặt, giới hạn 200 KB). **Dự án:** notebook thứ 8 (Phân loại cảm xúc) kèm tập 40 câu tự biên soạn; notebook chạy thật và cho thấy kết quả gần ngẫu nhiên vì tập quá nhỏ (bài học về nhu cầu dữ liệu). **Công cụ:** `npm run check:links` (kiểm tra mọi liên kết nguồn, cần Internet), bộ test Playwright trong `e2e/` (`npm i -D @playwright/test && npx playwright install chromium && npm run e2e`) *chưa được chạy khi phát triển*. 26 unit test.

## Chưa có / giới hạn đã biết
- Chưa chạy `npm install`/`next build` với thư viện thật (không có mạng khi phát triển): đã kiểm tra cú pháp toàn bộ, typecheck bằng khai báo giả và chạy test logic, nhưng chưa mở giao diện trong trình duyệt hay chạy Prisma thật. Hãy chạy `npm run verify` rồi `npm run prod` và báo lỗi nếu có.
- Content-Security-Policy đang ở chế độ **chỉ báo cáo** (`Content-Security-Policy-Report-Only`): chưa chặn gì. Sau khi thử Code Lab mà Console không báo vi phạm, đổi tên header trong `next.config.js` để bật thật.
- Chưa có: gửi email (xác thực email, quên mật khẩu tự động), giới hạn tần suất dùng chung giữa nhiều máy chủ, Monaco Editor (đang dùng ô soạn thảo tô màu tự viết), xem trước Markdown khi soạn bài trong /admin. Bộ test Playwright và `check_links` đã viết nhưng chưa chạy.
- Code PyTorch trong các bài (Autoencoder, Transfer Learning, Autograd, Thực hành PyTorch) và lab `mlp_torch` chưa được chạy; GAN/VAE/Diffusion mới ở mức giới thiệu (không có code huấn luyện); NLP bằng mô hình sâu chưa có bài thực hành. Dự án "Phân loại cảm xúc" chưa kèm dữ liệu (bạn tự chọn nguồn).
- Các liên kết nguồn chưa được mở kiểm tra tự động.

Thêm bài: thêm file `.md` vào `content/lessons`, khai báo trong `content/catalog.json`, chạy `npm run db:seed` (DB mới).
