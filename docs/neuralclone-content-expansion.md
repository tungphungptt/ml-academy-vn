# NeuralClone — đào sâu học liệu và thí nghiệm tính toán

Làm việc trực tiếp trên bản studio tại `D:\Projects\ml-academy-vn`, ngày 28–29/10/2026. Giữ Lora + Be Vietnam Pro, hai theme, nội dung cũ và các bản sửa chức năng. Không thêm dependency. Không đổi chế độ Next dev, cổng 3000, domain, tunnel, Origin/HMR hoặc expected Transfer.

## Phạm vi và lựa chọn

[Ma trận](neuralclone-content-expansion-matrix.md) và [kiểm kê máy đọc được](neuralclone-content-inventory.json) bao phủ 67 Markdown, 67 bộ quiz (157 câu), mapping Code Lab, notebook và minh họa. Đây là kiểm kê cấu trúc toàn chương trình; không phải tuyên bố mọi khẳng định trong 67 bài đã được kiểm chứng lại. Metadata verification có sẵn trong catalog là kết quả lịch sử.

Đọc sâu, bổ sung và kiểm chứng bốn bài liên tiếp trong nền tảng tính toán: [Đạo hàm](../content/lessons/derivatives.md), [Hồi quy tuyến tính](../content/lessons/linear-regression.md), [Gradient Descent](../content/lessons/gradient-descent.md), [Backpropagation](../content/lessons/backpropagation.md). Khoảng trống chung là thiếu liên hệ trực tiếp giữa số trung gian, công thức, hình, code và cập nhật tham số. Giữ slug, thứ tự, prerequisite và liên kết hiện có; bổ sung liên kết giữa các phần mới.

## Những gì được làm rõ

| Bài | Nội dung bổ sung | Tham chiếu tính tay |
|---|---|---|
| Đạo hàm | Giá trị hàm khác độ dốc; sai phân tiến/trung tâm, sai số, điều kiện trơn; hướng gradient với chuẩn Euclid | x=1,h=0.5: tiến 2.5, trung tâm và đạo hàm 2 |
| Hồi quy | Residual có dấu, đóng góp từng mẫu vào MSE/gradient; đơn vị; MSE và nửa MSE | w=1,b=0: loss=14/3,dw=−28/3,db=−4; đổi y₃=9 tại w=2 cho loss=3 |
| Gradient Descent | Cập nhật đồng thời từ trạng thái cũ; learning rate bằng 0 và quá lớn; Hessian, điều kiện hội tụ chỉ cho bài toán bậc hai cụ thể | η=.05: w=22/15,b=1/5,loss=127/135; η=.5: loss=2594/27 |
| Backpropagation | Forward/local derivative/upstream gradient; ReLU bị chặn, điểm gãy và quy ước gate=0; backward khác optimizer step | x=1,w₁=2,w₂=3,t=5: loss=.5,dw₁=3,dw₂=2 |

Mỗi bài có câu hỏi tự kiểm tra và giải thích, ví dụ số, nguồn gắn gần nội dung cùng danh mục tham khảo. Chín câu quiz được cải thiện lời giải, giữ ID, lựa chọn, đáp án và thứ tự. Không thêm bài hoặc số liệu thành tích giả.

## Nguồn đã đọc

[Source map](neuralclone-content-source-map.json) ghi URL, tên, tổ chức, ngày truy cập, phần đã đọc và bài được hỗ trợ. Sáu nguồn: Google MLCC (Loss, Gradient descent), Stanford CS231n (Optimization phần 1 và 2), D2L (Linear Regression), PyTorch 2.14 (Autograd mechanics). Không coi danh mục nguồn cũ là đã đọc lại. Các ví dụ số nhỏ là phép suy riêng của dự án, không phải kết quả nghiên cứu ngoài. Quy ước nửa MSE và quy ước gradient tại điểm không khả vi được giải thích riêng.

## Ánh xạ tương tác

| Điều khiển | Hàm thực thi trong learningMath.ts | Hình / bảng / output |
|---|---|---|
| x,h | quadratic | Parabol, cát tuyến, tiếp tuyến; sai phân và đạo hàm |
| w,b,y₃ | linear | Dữ liệu, đường dự đoán, residual; đóng góp loss/dw/db từng mẫu |
| w,b,y₃,η; chạy một bước/phát/dừng/đặt lại | descent → linear | Cùng phép cập nhật, dãy loss, tham số và gradient hiện tại |
| x,w₁,w₂,t; chọn nút | backprop | Đồ thị a→h→prediction→loss, gradient, gate và giá trị tại nút |

Điều khiển, SVG, bảng và JSON dùng cùng state và hàm thuần. “Xem code” đọc chính file TypeScript đang thực thi từ server; bản Python đọc cùng file `.py` tải về. Marker Markdown có allowlist, không thực thi code do Markdown cung cấp. Minh họa chỉ tải khi bấm mở, dùng ba điểm hoặc mạng scalar nhỏ; không gọi dịch vụ huấn luyện.

Phát từng bước dùng timer có cleanup, dừng ngoài viewport/tab ẩn; reduced motion cho thao tác từng bước và toàn bộ dữ liệu. Có giới hạn 30 bước và thông báo trước khi áp dụng bước vượt loss 10⁹. Native slider dùng được bằng bàn phím/cảm ứng; bảng có vùng cuộn focus được, JSON/Python cung cấp phương án đọc số. Không làm mượt số liệu qua animation khiến hình và output lệch thời điểm. Hệ studio và phản hồi có sẵn được giữ; áp dụng Apple Design ở phản hồi tức thì, quan hệ điều khiển–kết quả, tiết chế chuyển động và reduced motion.

## Pipeline và dữ liệu

Markdown là nguồn đọc động qua `readLesson`; không cần thay body trong database. `LessonBody` chèn bốn thí nghiệm vào nguồn này. Quiz dùng `scripts/import-content-expansion.ts`: sao lưu SQLite bằng VACUUM INTO, transaction, so sánh trước/sau, bỏ qua bản đã áp dụng và giữ chỉnh sửa độc lập. Hai lần nhập thực tế: 9 thay đổi, sau đó 0 thay đổi/9 đã áp dụng; không có conflict. [Bằng chứng](neuralclone-expansion-import.json), [lần hai](neuralclone-expansion-idempotency.json).

[Kiểm tra conflict](neuralclone-expansion-import-safety.json) dùng bản sao riêng có người học, tiến độ, bài làm, bookmark, ghi chú và thời gian học: 8 cập nhật + 1 conflict được giữ; lần hai 0 cập nhật + 8 đã áp dụng + 1 conflict; các bảng dữ liệu học tập và answer key khớp trước/sau. [Đối chiếu database thật](neuralclone-expansion-data-preservation.json) được tạo ở bước bàn giao.

## Kiểm chứng và cách chạy lại

- `npm run verify`: TypeScript và 70/70 unit đạt sau khi sửa phép so sánh −0 với 0 trong test gradient. Không coi −0 là gradient khác về mặt toán học.
- `npx tsx scripts/check-learning-parity.ts`: 88 đầu vào, 1.531 phép so sánh số; sai số tuyệt đối lớn nhất 4.263256414560601e−14, tiêu chí abs≤1e−10+1e−10×abs(reference). [Kết quả](neuralclone-expansion-numerical.json).
- Python 3.12.10 chạy ba code block hiện có và cell mới thành công. [Output và phạm vi](neuralclone-expansion-python-examples.json). Notebook chưa lưu output kernel; không tuyên bố đã chạy Jupyter.
- `node scripts/verify-expansion-import.mjs`: chỉ dùng bản sao trong `.local`, kết quả như trên.
- `npx playwright test --config playwright.learning.config.ts`: Chrome/Firefox/WebKit, thí nghiệm và hình/bảng/keyboard/NFC-NFD, hai theme, 375/768/1440/1920px, tăng chữ CSS 200%. Kết quả cuối và các lượt thất bại được giữ trong JSON riêng; xem phần bàn giao bên dưới.
- `node scripts/check-expansion-live.mjs --skip-python` (lượt cuối), `node scripts/check-expansion-pyodide.mjs` (worker riêng): kiểm tra 4 bài mỗi origin, tải đầu và reload; lưu từng lần, HTTP/request/console/HMR, trace; chạy Python mới qua Code Lab thật ở localhost. Không viết dữ liệu tài khoản trên server thật.

Các lỗi tái hiện trong QA: test range nhận chuỗi `.05` không hợp lệ trên Chrome/WebKit (sửa test thành `0.05`); nút mở lab, pager và menu desktop tràn khi tăng chữ 200% (sửa wrap/cuộn trong vùng); slider tham số sau bước tối ưu bị browser lượng tử hóa (dùng step any cho tham số được tính). Giữ các kết quả lỗi để không mất lịch sử kiểm chứng.

Ảnh sau nằm trong `screenshots/expansion/<browser>/` và `screenshots/expansion-live/`; trace trong `traces/neuralclone-expansion-*.zip`. Ảnh widget cao có thể chứa navigation sticky ở vị trí scroll của trình duyệt; ảnh viewport live giúp đọc đúng trạng thái sử dụng. Không tuyên bố có ảnh trước tương đương khi chưa chụp; bản Markdown gốc được sao lưu riêng trong `.local/expansion-start/content`.

Đối chiếu live cuối: 16/16 lượt (4 bài × tải đầu/reload × 2 origin) HTTP 200, output và bước tối ưu đúng, không console error, HTTP lỗi hoặc request thất bại. HMR nhận handshake 101 và frame thật: localhost 124 frame, domain 145 frame. Đây là kiểm tra kết nối trong lượt quan sát, không phải phép sửa file để chứng minh hot update. [Bằng chứng](neuralclone-expansion-live.json); có trace local/public. Lượt đầu giữ tại `neuralclone-expansion-live-first.json`: có hydration mismatch khi file component được sửa trong lúc probe đang mở trang; lượt cuối dùng mã ổn định không tái hiện. Không suy ra từ đó nguyên nhân 502 lịch sử.

Pyodide 0.26.2: file Python mới được đưa vào editor thật, worker chạy assertion `descent(1,0,.05)` cho loss=127/135 và in `EXPANSION_PARITY_OK`. [Kết quả](neuralclone-expansion-pyodide.json). Tài nguyên chính thức được tải qua Python/platform TLS, có SHA256 từng asset, rồi fulfill nguyên byte; chưa kết luận đường CDN trực tiếp của Chromium ổn định. Lượt kiểm thử trước gặp SyntaxError do code được điền khi editor chưa sẵn sàng, tạo chuỗi nối với code cũ; helper nay chuyển variant và chờ trạng thái trước khi điền. Giữ raw error tại `neuralclone-expansion-pyodide-first.json`. Lượt direct đầu không thu được alert nên chưa đủ bằng chứng xác định nguyên nhân lỗi của chính lượt đó. Không sửa worker hay nới thời gian thực thi để làm PASS.

## Kết quả trình duyệt cuối

`neuralclone-expansion-browser-results.json`: **6/6 đạt**, Chrome 156.0.8078.49, Firefox 157.0, WebKit 27.2 trên Windows. Mỗi engine kiểm tra 4 bài × 2 theme × 4 chiều rộng = 32 trường hợp; tổng 96, có kiểm tra reflow chữ 200%, NFC/NFD, bảng cuộn bàn phím và ảnh thật. Các file `neuralclone-expansion-<engine>-visual.json` ghi đủ 32 trường hợp và không có lỗi console/request. Các file interaction ghi kết quả điều khiển, bước tối ưu, dừng/phát và reduced motion. Đã mở một số ảnh mobile/desktop để kiểm tra trực quan, không tuyên bố xem thủ công toàn bộ 96 ảnh.

Lượt WebKit trước hết 5 giây khi trạng thái vẫn là tải chunk; snapshot thể hiện `Đang mở thí nghiệm`, không phải thao tác bị mất. Test cuối đợi chunk tối đa 30 giây và vẫn kiểm tra lỗi/request. Nút mở cũng được khóa trước khi hydration hoàn tất. Các JSON `browser-first/second/third/fourth/fifth-results` giữ lịch sử lỗi, không cộng vào số PASS cuối.

Hồi quy liên quan: **9/9 đạt** trong `neuralclone-expansion-regression.json`, lệnh `npx playwright test e2e/curriculum.spec.ts e2e/math-rendering.spec.ts e2e/final-polish.spec.ts --grep-invert 'learner returns' --reporter=list,json`. Gồm render toàn bộ 67 bài, search/filter, publication guard, deep link lab, login quay lại quiz, đổi lab giữ code, demo ngưỡng ở biên/chi phí 0 và công thức trong bài/quiz. Không ghi đây là toàn bộ suite 29 bài của lượt trước; luồng đăng ký + chạy Python trong bài test bị loại không được tính là vừa chạy lại.

E2E chạy trên **production build riêng** `.next-e2e`, cổng 3100, SQLite fixture riêng qua `scripts/e2e-server.mjs`; server dev thật 3000 vẫn giữ nguyên. Build production đó thành công và phục vụ các test; không chạy `next build` vào thư mục `.next` đang phục vụ domain. `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` đạt; `next-env.d.ts` được hoàn nguyên đúng snapshot sau build. `npm test` cuối: 70/70 đạt. `git -c core.safecrlf=false diff --check` đạt. Dự án không cấu hình lint riêng, không báo đã chạy lint. Tổng hợp trong `neuralclone-expansion-qa.json`.

## Giới hạn còn mở

63 bài còn lại cần kiểm toán ngữ nghĩa sâu theo từng chủ đề; ma trận không thay thế công việc này. Không chạy lại toàn bộ lab PyTorch hoặc 14 ví dụ Pyodide cũ trong phạm vi này. Các số kiểm thử từ bản studio là baseline lịch sử, không cộng vào kết quả mới.

Transfer vẫn **strict FAIL**, 334/360 so với baseline lịch sử 335/360; không đổi expected/output. Nguyên nhân 502 lịch sử chưa xác định; các probe hữu hạn không bảo đảm uptime tương lai. Không có Safari/macOS/iOS/Android thật; WebKit Windows và viewport giả lập không đại diện thiết bị thật. Tăng chữ CSS 200% không phải Dynamic Type hay kiểm chứng browser toolbar zoom.
