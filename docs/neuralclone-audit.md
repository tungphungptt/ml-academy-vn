**NeuralClone — audit, nâng cấp và kiểm chứng, 27/10/2026**

Đã triển khai trực tiếp trong `D:\Projects\ml-academy-vn`, giữ Next.js 16 / React 19 / TypeScript / Prisma SQLite. Không thêm dependency ứng dụng, đổi DNS/Cloudflare, push Git hoặc triển khai lên dịch vụ ngoài. Thay đổi sẵn có trong `next-env.d.ts` được ghi nhận trước khi sửa và giữ lại ở trạng thái dùng types của dev server.

**1. Những vấn đề đã xác minh và xử lý**

- Heading serif thực sự bị tách dấu tiếng Việt trong ảnh baseline. Thay bằng Be Vietnam Pro lưu tại dự án: 12 WOFF2 chia subset/weight, tổng khoảng 190 KB; có giấy phép OFL, preload các subset chính và `font-display: swap`. Chuẩn hóa weight 400/500/600/700, line-height và heading không nghiêng. Đã xem trực tiếp bảy chuỗi yêu cầu trong ảnh specimen.
- Live và localhost ban đầu cùng hiển thị ML Academy, không có khóa học/dự án. Database ứng dụng đã được xác minh hoàn toàn trống và nằm trong dự án; sao lưu bằng SQLite `VACUUM INTO` trước khi nạp catalog có sẵn, không tạo admin. Kết quả: 3 lộ trình, 59 bài, 8 dự án, 4 dataset, 8 tài liệu; số user vẫn là 0 sau E2E. Backup nằm trong `.local/backups/` và không commit.
- Hash notebook thất bại trên Windows vì checkout CRLF so với LF của nguồn đã xác minh. Test dùng newline chuẩn trước khi so hash và source; không thay hay dựng lại stdout tham khảo.
- Gradient Descent trả trọng số của bước phân kỳ nhưng loss của bước trước. Nay giữ đồng bộ trọng số và MSE ở bước hữu hạn cuối; thông báo chính xác ngưỡng dừng.
- Loss MLP bị lệch một bước so với mô hình trả về. Nay có loss bước 0 và loss sau từng cập nhật, dùng binary cross-entropy ổn định qua logit.
- OLS với đặc trưng hằng trả NaN; PCA suy biến có thể gặp chia 0/cancellation. Đã xử lý trường hợp hằng, dùng công thức góc nửa cho eigenvector và kiểm tra đầu vào.
- Cây quyết định dừng ở gain bằng 0 nên không khám phá được XOR. Cho phép bước chia gain 0 để xét các nút con; có regression test XOR chính xác.
- Ô lưới KNN được dự đoán ở góc ô; nay tính ở tâm. Đồ thị chung giữ tỷ lệ vuông cho khoảng cách/góc PCA, có trục, vạch chia, chú thích và clip vùng vẽ.
- Tọa độ SVG có khác biệt bit cuối giữa Node và Chrome, gây cảnh báo hydration ở hero. Chỉ lượng tử hóa tọa độ hiển thị, giữ nguyên độ chính xác tính toán; đã kiểm tra lại không còn cảnh báo hydration.
- Code Lab chưa giải phóng Worker/timer khi unmount và PyProxy sau lần chạy. Đã bổ sung cleanup, bảo vệ kết quả Worker cũ, xử lý lỗi khởi tạo và reset output/trạng thái đồng bộ với code.
- Token reset có race condition giữa kiểm tra và sử dụng. Nay claim token và đổi mật khẩu trong cùng transaction; test đồng thời chỉ cho một yêu cầu thành công và xác minh session cũ bị thu hồi.
- Bcrypt chỉ xử lý tối đa 72 byte UTF-8. Mật khẩu mới được kiểm tra theo byte, gồm tiếng Việt; giữ khả năng đăng nhập của tài khoản cũ. Xử lý xung đột email khi đăng ký đồng thời.
- API progress có thể trả 500 với lesson không tồn tại; một số API chưa áp dụng publication boundary. Progress/bookmark/note/time nay kiểm tra bài có nội dung thuộc khóa đã xuất bản; auth, quyền admin và CSRF được kiểm thử.
- Build Windows luôn regenerate Prisma gây lỗi khóa DLL khi server hiện có dùng client. `ensure-prisma-client.mjs` kiểm tra phiên bản và schema, bỏ qua khác biệt format của Prisma; chỉ generate khi cần. Không tắt kiểm tra hoặc dừng tiến trình của người dùng.
- Filesystem tracing từng kéo toàn bộ dự án vào build. Đã giới hạn loader về `content/` và tách đường dẫn lưu trữ runtime khỏi tracing; build cuối không còn các cảnh báo này.

**2. Nhận diện và trải nghiệm**

Logo SVG riêng lấy hình hai nhánh N và các nút kết nối, cùng favicon SVG/ICO, icon iOS và social preview PNG 1200×630. Giao diện mặc định graphite/xanh ngọc, giữ chuyển sáng/tối, focus rõ và reduced motion. Tên NeuralClone nhất quán trong header, footer, auth, title, canonical, Open Graph và Twitter. Các tên thuật toán và URL học tập được giữ nguyên.

Hero có hồi quy tuyến tính chạy thật, slider số bước và MSE thực. Lộ trình/card/trang đọc/Code Lab/thư viện có cùng typography, spacing và trạng thái. Thêm lọc dự án, dataset, tài liệu; link dataset từ dự án đến đúng anchor. Thêm quy trình thực nghiệm bốn bước nhấn mạnh tách test và fit preprocessing trên train. Empty state có hành động tiếp theo khi không có dữ liệu/kết quả.

Playground chỉ mount/tải thuật toán được chọn, giữ hash/deep link và sáu chức năng hiện hữu. MLP dùng deferred update khi đổi tham số. 48 SVG học thuật được đồng bộ palette; generator cũng được cập nhật. Hình có tọa độ cùng đơn vị giữ đúng tỷ lệ, các bước GD và vị trí kernel được vẽ tĩnh để không chạy hoạt ảnh vô hạn.

SEO dùng metadata riêng cho trang và bài/khóa động, sitemap chỉ liệt kê nội dung đã xuất bản, robots và noindex cho trang riêng/search/reset. Không thêm số liệu người dùng hay structured data chưa có căn cứ.

**3. Kết quả kiểm chứng thực tế**

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run build` | Đạt, gồm TypeScript và sinh trang; không còn lỗi DLL hoặc cảnh báo tracing toàn dự án |
| `npm run verify` | Đạt type-check và 56/56 unit/integration test |
| `tsc --noEmit --noUnusedLocals --noUnusedParameters` | Đạt |
| Playwright | Lượt hợp nhất cuối đạt 21/21 test trong 2,1 phút |
| Responsive | 375, 768, 1440, 1920px; cả sáng/tối; 17 loại màn hình, thêm dashboard/quiz/PCA |
| Học tập | Duyệt/chấm quiz 59 bài, điều hướng/prerequisite, ghi chú/bookmark/tiến độ lưu thật; sáu demo tương tác |
| Pyodide | 12/12 biến thể chạy thật qua CDN trực tiếp, stdout khớp kết quả tham khảo |
| Liên kết nguồn | 80/80 truy cập thành công |
| `npm audit --omit=dev --json` | 0 lỗ hổng được báo trong dependency production |
| Nội dung/spec Python | 59 bài, 0 lỗi cấu trúc; registry 52/52, không thiếu mapping |
| Toán Python CPU | 4/6 đạt; 2 lỗi môi trường do thiếu module `torch`, không báo đạt toàn bộ |
| Lint | Repository không có script/config lint riêng; không thêm hoặc giả lập kết quả lint |

Playwright tự tạo database và lesson overrides riêng trong `.local/ml-curriculum-e2e-*`, build riêng `.next-e2e`, server loopback 3100. Guard từ chối database cá nhân, URL ngoài loopback và cổng 3000. Không có tài khoản test trong database ứng dụng.

Đo Chrome production local không throttle: LCP 100–540 ms, CLS 0–0,00117 trên ba route ở 375/1440px. Các route trong mỗi context dùng chung cache; đây là quan sát lab, không phải Lighthouse/CrUX hoặc cam kết CWV thực tế. Không đo INP ngoài thực tế.

**4. Trước và sau, bằng chứng**

| Trước | Sau |
| --- | --- |
| ML Academy, serif có dấu bị tách | NeuralClone, font Việt được lưu tại dự án |
| Khóa học/dự án trống không có hướng dẫn ở landing | Nội dung repository đã được nạp an toàn; có empty state khi thật sự trống |
| Hero mạng minh họa tĩnh | Thực nghiệm hồi quy có số liệu tính thật |
| Sáu demo cùng mount, thiếu trục | Tải theo lựa chọn, giữ deep link, trục/chú thích và đúng tỷ lệ |
| Metadata chung, thiếu sitemap/canonical | Metadata riêng, sitemap và social preview có thương hiệu |

- [Baseline local desktop](screenshots/before/local-1440.png), [baseline live desktop](screenshots/before/live-1440.png).
- [Local sau sửa](screenshots/after/home-1440.png), [live desktop sau sửa](screenshots/after/live-1440.png), [live mobile sau sửa](screenshots/after/live-375.png).
- [Bảy chuỗi font tiếng Việt](screenshots/after/vietnamese-type-specimen.png).
- Toàn bộ ảnh nhiều trang/theme/width ở `docs/screenshots/e2e/`; before/after tại `docs/screenshots/`.
- [Pyodide stdout](neuralclone-pyodide.json), [kiểm tra liên kết](neuralclone-links.json), [đo browser/live](neuralclone-final-browser.json), [validation tổng hợp](neuralclone-validation.json), [danh sách file](neuralclone-files.json).

Live được mở bằng Chrome sau sửa: HTTP 200, title `Học AI từ gốc | NeuralClone`, canonical `https://neuralclone.site`, desktop/mobile hiển thị thương hiệu mới. Không sửa Cloudflare Tunnel hay DNS để có kết quả này.

**5. Chạy và vận hành**

Development, từ thư mục dự án: `npm run dev -- --hostname 127.0.0.1 --port 3000`. Không chạy thêm nếu cổng đang dùng. Với môi trường mới, làm theo `npm run setup` trong README; không ghi đè `.env` đã có.

Production local: dừng dev server hiện có bằng Ctrl+C trong terminal sở hữu nó, rồi `npm run deploy:local`. Lệnh kiểm tra cấu hình/database/cổng, build, và chỉ start loopback 3000 nếu build đạt. Không tự migrate/reset/seed. Nếu Tunnel hiện trỏ localhost:3000, giữ nguyên Tunnel; nó sẽ nhận nội dung từ tiến trình production ở cùng cổng. Cấu hình cookie cần phù hợp với HTTP local hay HTTPS theo runbook hiện có; không đổi secret giữa các lần chạy.

Các server fixture và server production 3200 do audit tạo chỉ phục vụ kiểm thử và được dừng sau khi xong. Server 3000 có sẵn được giữ nguyên; headers live vẫn phản ánh môi trường development của tiến trình có sẵn, không được coi là một lần triển khai production đã hoàn tất.

**6. Giới hạn và việc còn cần kiểm tra thủ công**

- Môi trường Python đang là 3.14, thiếu PyTorch; curriculum CPU khuyến nghị Python 3.12 và phiên bản đã pin. Chưa tái chạy toàn bộ lab CPU/27 notebook bằng kernel mới trong phiên này. Không sửa kết quả tham khảo để làm test đạt.
- Đã kiểm tra bằng Chrome trên Windows và viewport mô phỏng; chưa dùng thiết bị Android/iOS thật, Safari hay Firefox.
- CSP hiện vẫn ở `Content-Security-Policy-Report-Only` theo cấu hình dự án. Auth/CSRF/XSS renderer có test, nhưng chưa biến audit này thành pentest hoặc chứng nhận bảo mật. Rate limit trong bộ nhớ vẫn dành cho một tiến trình.
- Chưa đổi tiến trình đang public từ dev sang production và chưa kiểm tra cấu hình máy chủ/TLS/backup ngoài dự án; các thao tác dịch vụ ngoài nằm ngoài phạm vi cho phép.
- Không có thay đổi framework, schema/migration mới, xóa tài liệu, xóa URL học tập, xóa dữ liệu người dùng, Git commit/push hay reset.

Danh sách chính xác file tạo/sửa nằm trong `neuralclone-files.json`; không có file tracked bị di chuyển hoặc xóa. Chỉ loại bỏ bốn font TTF vừa tải trong phiên vì đã có các WOFF2 tương đương.
