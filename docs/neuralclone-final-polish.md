# NeuralClone — hoàn thiện và kiểm chứng ngày 28/10/2026

> **Lượt tiếp nối Firefox/WebKit/Transfer, cùng ngày:** đã cài và chạy Firefox 157.0, Playwright WebKit 27.2 trên Windows; sửa CSP, thời hạn tải Pyodide và race hydration quiz Firefox. Xem [báo cáo tiếp nối](neuralclone-cross-browser-review.md), [QA của lượt mới](neuralclone-cross-review-qa.json) và [manifest riêng](neuralclone-cross-review-change-manifest.json). Các số liệu bên dưới thuộc lượt polish trước, không phải kết quả được mặc định chạy lại. Transfer hiện ổn định 334/360 ở 5 process; chưa xác định nguyên nhân baseline khác 335/360 vì thiếu artifact lịch sử, strict mismatch vẫn được giữ. Thiết bị Safari/iOS/Android thật vẫn chưa xác minh.

Tiếp tục dự án tại `D:\Projects\ml-academy-vn`, giữ redesign và nội dung đã có. Đã đọc bốn báo cáo bàn giao và manifest 419 file, xác nhận các file của manifest tồn tại. Không tìm thấy AGENTS.md trong dự án hoặc các thư mục cha áp dụng. Ghi trạng thái Git và SHA-256 của **1.007 file nguồn/tài sản đang có** trước khi sửa trong `.local/polish-start`; không reset, clone, push hoặc đồng bộ GitHub.

Các con số dưới đây là kết quả **vừa chạy trong lượt 28/10**, trừ các giá trị được ghi rõ là baseline. Không dùng các báo cáo pass ngày 27/10 làm kết quả mới.

## 1. HMR 502: tái hiện, nguyên nhân và bằng chứng sửa

Luồng thực tế: trình duyệt → Cloudflare → cloudflared → `http://localhost:3000` → Next.js **16.4.3 development**. Đọc ingress thực qua endpoint metrics/config loopback của cloudflared, chỉ ghi hostname/service, không đọc token/credentials. Domain và port đang đúng; không đổi tunnel hoặc DNS.

Trước sửa:

| Phép thử handshake | Kết quả |
| --- | --- |
| Local, `Origin: http://localhost:3000` | **101 Switching Protocols** |
| Gọi thẳng origin local, Host/Origin của neuralclone.site | Không có HTTP response hợp lệ; raw socket trả **`Unauthorized`** |
| Public `wss://neuralclone.site/_next/hmr` | **502**, server Cloudflare |

Log `.next/dev/logs/next-development.log` trước khi config reload ghi `Blocked cross-origin request ... /_next/hmr from "neuralclone.site"` và yêu cầu `allowedDevOrigins`. Đọc mã Next tại `node_modules/next/dist/server/lib/router-utils/block-cross-site-dev.js` và upgrade handler của `router-server.js`: Next kiểm tra **Origin**, không mặc nhiên cho mọi Host của tunnel. Nhánh chặn dùng `socket.end('Unauthorized')`; cloudflared không nhận được HTTP upgrade response hợp lệ nên đường public trả 502. Vì vậy HTTP 200 của trang không chứng minh HMR hoạt động.

Sửa duy nhất cấu hình dự án:

```js
allowedDevOrigins: ["neuralclone.site", "127.0.0.1"],
```

Không dùng wildcard, không tắt origin check, không ẩn console hoặc dev overlay. `localhost` đã được Next cho phép mặc định; `127.0.0.1` hỗ trợ truy cập loopback trực tiếp. Origin không tin cậy `untrusted.example` vẫn bị chặn. Next tự reload process con khi config thay đổi; phép probe ngay trong thời gian chuyển có connection refused tạm thời, sau khi khởi động ổn định cả local/domain đều 101. Không kill cloudflared hoặc chuyển cổng.

`node scripts/check-hmr.mjs` mở hai trình duyệt thật, theo dõi Network/CDP và WebSocket frames; thay tạm heading trong `Landing.tsx`, chờ giao diện đổi **không reload**, rồi hoàn nguyên và chờ cập nhật lần nữa. Biến JavaScript gắn trên `window` được giữ cả hai lần, chứng minh không phải tải lại toàn trang. SHA-256 của file sau thử nghiệm khớp byte-for-byte bản trước thử nghiệm.

| Môi trường | Handshake | Frame nhận | Đổi/hoàn nguyên không reload | Console/page error |
| --- | --- | --- | --- | --- |
| localhost:3000 | 101 | 40 | Đạt cả hai | 0 |
| neuralclone.site | 101 | 36 | Đạt cả hai | 0 |

Bằng chứng: [probe trước](neuralclone-polish-hmr-before.json), [probe sau](neuralclone-polish-hmr-after.json), [browser HMR](neuralclone-polish-hmr-browser.json), ảnh [heading tạm trên domain](screenshots/final-polish/hmr-live-temporary.png) / [đã hoàn nguyên](screenshots/final-polish/hmr-live-restored.png).

Đối chiếu tài liệu chính thức ngày 28/10: [Next allowedDevOrigins](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins), [Cloudflare WebSockets](https://developers.cloudflare.com/network/websockets/). Kết luận nguyên nhân còn được xác minh trực tiếp bằng raw socket, log và mã phiên bản đang cài, không chỉ suy từ tài liệu.

## 2. Luồng học và giao diện đã sửa

- **Mất bài đang học khi đăng nhập:** trước đây login/register thành công luôn về `/`. Giờ liên kết từ bài/quiz mang đích quay lại; chuyển qua lại login/register vẫn giữ đích. Quiz dùng `#quiz`; menu điều hướng cũng giữ bài đang đọc. `safeReturnPath` chỉ nhận route nội bộ hợp lệ, chặn URL ngoài, network-path, backslash/control characters, endpoint API và vòng lặp auth.
- **Chọn lab nhưng URL vẫn chỉ lab cũ:** chọn dropdown hiện cập nhật query `lab` bằng History API. Reload/share mở đúng lab. Edits còn giữ khi đổi qua lại lab trong cùng trang; không hứa lưu edits sau reload.
- **Hướng dẫn CPU phụ thuộc GitHub:** thêm lệnh PowerShell, virtualenv/Python 3.12, requirements và CPU wheel ngay trong Code Lab; chỉ dẫn macOS/Linux, checkpoint và thư mục chạy. Link GitHub cũ vẫn HTTP 200, nên không gọi đây là sửa một 404. Mục đích là hướng dẫn trong trang bám source hiện tại, không phụ thuộc bản ngoài chưa đồng bộ.
- **Tràn ngang trong hướng dẫn CPU mới:** E2E tái hiện trang rộng **761px** ở viewport 375px do min-content của grid/details chứa dòng lệnh dài. Sửa track `minmax(0,1fr)` và `min-width:0` của guide; sau sửa scrollWidth **375px**. Code vẫn cuộn trong khung, không che overflow toàn trang. [Trước](neuralclone-polish-cpu-overflow-before.json) / [sau](neuralclone-polish-cpu-overflow-after.json), [ảnh sau](screenshots/final-polish/cpu-guide-overflow-after.png).
- **Cuối track thiếu hành động tiếp:** thêm liên kết khám phá lộ trình tiếp theo. Không tự đánh dấu đã hoàn thành cả track.
- **Demo ngưỡng thiếu khả năng đối chiếu từng dự đoán:** thêm TN, điểm đặc/rỗng thể hiện predicted class, chú giải và bảng tám dự đoán có header/caption. Thêm trạng thái hai chi phí bằng 0. Nhãn thật không chỉ dựa vào màu; bảng giúp đọc số khi SVG thu nhỏ trên mobile.

E2E đã đi qua tìm bài → đến quiz → đăng ký và quay lại đúng quiz → chấm bài → lưu hoàn thành → chạy `threshold_cost` bằng Pyodide thật → trở về bài, kiểm tra tiến độ → mở bài tiếp theo. Tất cả tài khoản/attempt/note của test nằm trong database fixture riêng cổng 3100.

## 3. Nội dung và tính đúng đắn

Đọc lại tám bài mới và 24 câu quiz, cùng nội dung liên quan về metrics, attention/Transformer, transfer và triển khai. Không thêm bài hoặc quiz mới trong lượt này.

Đã sửa/làm rõ:

- Boosting: định nghĩa vai trò của cây $h_m$ và shrinkage $\eta$ ngay sau công thức.
- Ngưỡng theo cost: nêu chi phí không âm và tổng dương; khi cả hai bằng 0, không dùng phân số 0/0 và không có ngưỡng tối ưu duy nhất theo cost.
- NLL: cần ít nhất một target hợp lệ; batch bị mask hết phải được xử lý theo protocol.
- Retrieval Recall: nêu quy ước cho query không có tài liệu relevant, đánh giá abstention riêng.
- Differential privacy: lượng hóa trên mọi dataset kề nhau/tập đầu ra; giải thích ngẫu nhiên của cơ chế, epsilon/delta và đơn vị bảo vệ record/user.
- Transformer: sửa cách nói “coi như túi từ” thành tính equivariant của self-attention không mask/không vị trí.
- Transfer: bổ sung bảng diễn giải lần chạy Windows và baseline, không thay output đã ghi.

Demo ngưỡng được kiểm tra ở 0, 1, đúng bằng score, không dự đoán dương, không có nhãn dương, dữ liệu rỗng, input không hữu hạn và chi phí 0. Ví dụ: t=0 cho TP=3/FP=5/cost=5; t=1 cho TN=5/FN=3/cost=12, precision không xác định; t=0,35 có TP=3/FP=3/FN=0/cost=3. Plot, bảng và metric cùng dùng quy tắc `score >= threshold`.

## 4. PyTorch CPU và notebook: kết quả thực, không đổi đáp án để pass

Môi trường riêng `.local/polish-cpu`: **Windows 11, Python 3.12.10, PyTorch 2.14.1+cpu, NumPy 2.3.5, pandas 2.2.3, Matplotlib 3.10.8, scikit-learn 1.8.0, SciPy 1.18.1**; CPU một thread, CUDA unavailable. Cài từ PyPI và index CPU chính thức, giữ TLS. Không thay Python hệ thống hoặc dependency frontend.

Đã chạy đủ 7 lab: MLP/XOR, tabular pipeline, CNN, GRU, neural recommendation, autoencoder và transfer. **7/7 thực thi không lỗi; 6/7 khớp stdout baseline tuyệt đối.** Bảy notebook tương ứng cũng thực thi trong kernel IPython riêng, không có lỗi Python/kernel; strict comparison với baseline đạt **6/7**.

Sai khác còn lại là transfer:

| Môi trường | Frozen accuracy | Fine-tune accuracy | Backbone frozen |
| --- | --- | --- | --- |
| Baseline Linux/Python 3.12.14 | 0,9167 | 0,9306 = 335/360 khi làm tròn | Không đổi |
| Windows/Python 3.12.10, CLI và notebook mới | 0,9167 | 0,9278 = 334/360 khi làm tròn | Không đổi |

Đọc source xác nhận pretrain chỉ trên train, split giữ nguyên, validation chọn checkpoint, test chỉ đo sau các giao thức đã định, checkpoint tự tạo và freeze assertion đạt. CLI và kernel cho cùng kết quả mới. Chưa định vị một kernel/backend số học cụ thể gây khác biệt; không khẳng định riêng Python hoặc OS là nguyên nhân duy nhất. Không sửa registry/notebook baseline, không thêm tolerance để báo pass. Hai runner strict vẫn trả mã 1 vì sai khác đã ghi rõ này.

`check_notebooks.py` được cải thiện để lưu riêng **executed**, **matchesRecorded**, stdout thật và stdout baseline ngay cả khi so sánh thất bại. Người đọc có thể phân biệt lỗi chương trình với sai khác số liệu. Đối chiếu output thực của cả bảy notebook với CLI cùng môi trường đạt **7/7**; phép so với baseline vẫn chỉ **6/7**. [Báo cáo CPU](neuralclone-polish-cpu.json), [notebook](neuralclone-polish-notebooks.json), [hướng dẫn tái hiện](curriculum-practice.md).

Hai Python fence Transformer đã chạy với forward, mask và backward trên CPU: `(2,4,11) True`, `(2,3,12) True`. PyTorch có warning nested-tensor API đang prototype; giữ warning trong [báo cáo](neuralclone-polish-transformer.json), không coi đây là model ngôn ngữ đã huấn luyện.

## 5. Kiểm thử thực sự chạy trong lượt này

| Lệnh/phạm vi | Kết quả mới |
| --- | --- |
| `npm run verify` | TypeScript + **62/62 unit/integration**, 0 skipped |
| `npm run build` | Production build và TypeScript đạt |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | Đạt; khôi phục `next-env.d.ts` đúng byte của bàn giao sau build/typegen |
| `npm run e2e` với Chrome | **29/29 đạt**, production fixture/SQLite riêng; gồm 4 test polish mới |
| Math rendering sau lần chỉnh prose cuối | **7/7 đạt**, render toàn bộ bài/quiz bằng KaTeX strict |
| `python -X utf8 scripts/check_content.py` | 67 records, 0 lỗi cấu trúc/link nội bộ/prerequisite |
| `scripts/check_modern_content.py` | **11/11** Python fence mới khớp kết quả; [báo cáo](neuralclone-polish-modern-execution.json) |
| `scripts/check_curriculum_math.py` trong venv CPU | **6/6** numerical regression đạt |
| `scripts/check_cpu_labs.py` | 7/7 thực thi, **6/7 strict stdout**, transfer variance như trên |
| `scripts/check_notebooks.py` — 7 notebook CPU | 7/7 kernel thực thi, **6/7 strict stdout**; không ghi “7 test pass” |
| Hai Transformer PyTorch fence | **2/2** chạy và assertion đạt |
| `scripts/check_pyodide.mjs` | **14/14** biến thể browser đạt qua CDN trực tiếp; [báo cáo](neuralclone-polish-pyodide.json) |
| `scripts/check_links.mjs` | **104/104** URL nguồn HTTP đạt; [báo cáo](neuralclone-polish-links.json) |
| `scripts/check-hmr.mjs` | Local/domain 101, nhận frame, thay/hoàn nguyên source không reload |
| `scripts/check-learning-browser.mjs` | **28** lượt mở trang local/live HTTP 200, 0 console/page error, 0 request thất bại, **28 handshake 101**; có touch emulation; [báo cáo](neuralclone-polish-browser.json) |
| `git diff --check` | Đạt |

Không có ESLint cấu hình trong repo, không báo “lint pass”. Build/verify/E2E logs nội bộ ở `.local/polish-*.log`. [QA tổng hợp](neuralclone-polish-final-qa.json) và [manifest thay đổi của riêng lượt này](neuralclone-polish-change-manifest.json) cung cấp số liệu/file cụ thể.

Lượt E2E đầu có 4 failure: một state test ngưỡng không reset cost giữa điều kiện, một overflow CPU thật, hai lỗi fixture tiêu quá quota đăng ký. Đã sửa overflow; reset tham số test đúng mỗi điều kiện; seed tài khoản setup vào **DB fixture** thay vì tiêu quota API đăng ký. Không tăng/tắt rate limit production. Chạy lại toàn bộ 29 E2E đạt. Luồng đăng ký thật vẫn được kiểm tra.

## 6. Visual QA, accessibility và phạm vi trình duyệt

Kiểm tra lại **375/768/1440/1920px × light/dark** trên 17 màn hình chính; thêm bảng/dự đoán demo ngưỡng ở đủ tám điều kiện. Kiểm tra mobile menu, bàn phím/Escape/focus, TOC, code editor, code block, math overflow, trạng thái pending/error/retry quiz và tiến độ persisted. Các bài/quiz render đúng; không overflow toàn trang sau sửa guide.

384 mẫu typography NFC/NFD được chạy lại bằng actual platform font. Thêm 40 phép kiểm tra NFD trên h1, prose, question, option và button của quiz thật; không font hệ thống xen vào các vùng chữ này. Không thay bộ WOFF2 đã sửa ở lượt trước.

Đã mở ảnh thật, gồm [quiz có lời giải trên mobile](screenshots/final-polish/quiz-result-mobile.png), [demo light/375](screenshots/final-polish/threshold-light-375.png), [CPU guide sau sửa](screenshots/final-polish/cpu-guide-overflow-after.png), [lesson light/1440](screenshots/final-polish/lesson-light-1440.png) và bằng chứng HMR. Không kết luận chỉ từ test pass.

Chrome Windows là engine thực tế dùng trong lượt này. Có kiểm tra touch/viewport emulation 375px trên local và public, menu tap dẫn tới khóa học, target menu 40×40px. **Không phải thiết bị iOS/Android thật.** Playwright WebKit và Firefox không được cài sẵn; không gọi Chrome emulation là Safari/WebKit. Contrast của token UI đã được E2E đo; chưa có full screen-reader audit hoặc đánh giá mọi trạng thái màu bằng công cụ accessibility chuyên dụng.

## 7. Dữ liệu, vận hành và rollback

Backup SQLite trước thao tác: `.local/polish-start/before.db` bằng `VACUUM INTO`, trong thư mục dự án và không public/commit. DB thật lúc bàn giao có 67 lesson, 157 question, 0 user/progress/attempt/note/bookmark. Không import/reset/migrate DB thật trong lượt này. Tests ghi vào DB `ml-curriculum-e2e-*` có guard; không sửa expected output/nguồn notebook để che sai khác CPU.

Giữ **cổng 3000, neuralclone.site và ingress tunnel**. Website vẫn là Next dev để tiếp tục phát triển, HMR đã hoạt động; chưa chuyển dịch vụ public sang production. Build production và E2E loopback đã chuẩn bị/kiểm tra source, không thay thế kiểm thử một lần chuyển production qua Cloudflare thật.

Rollback cấu hình HMR: bản `next.config.js` trước sửa nằm tại `.local/polish-start/next.config.js`, đã đối chiếu SHA-256 với baseline. Bỏ property `allowedDevOrigins` vừa thêm để trở lại cấu hình bàn giao, hoặc dùng bản sao khi không có chỉnh sửa khác sau lượt này. Next tự reload; rollback phục hồi cả hành vi chặn HMR cũ. Không có cấu hình Cloudflare/DNS nào cần rollback. `Landing.tsx` trong phép thử HMR đã hoàn nguyên; `next-env.d.ts` cũng được trả về nguyên bản.

Lệnh sử dụng: server hiện có tiếp tục tại `http://localhost:3000`; chỉ chạy `npm run local` khi chưa có server. Kiểm tra HMR thủ công bằng `node scripts/check-hmr.mjs` **chỉ trên development**, vì script có thay tạm một heading và luôn phục hồi. Hướng dẫn CPU đã có ngay trong Code Lab và [runbook thực hành](curriculum-practice.md).

## 8. Những gì còn chưa xác minh

- Transfer chênh một mẫu dự đoán đúng trên tổng 360 giữa baseline và Windows: đã xác minh chạy được, ghi rõ strict mismatch. Chưa có prediction/checkpoint baseline nên không khẳng định số hoặc vị trí prediction đã thay đổi; chưa có môi trường Linux baseline/trace backend để kết luận nguyên nhân kernel cụ thể.
- Khi kết thúc lượt polish ban đầu chưa có WebKit/Firefox. Lượt tiếp nối đã kiểm tra hai engine trên Windows theo báo cáo đầu trang; Safari/iOS/Android vật lý vẫn chưa xác minh.
- Chưa chạy GPU, torchvision tải pretrained weights, LLM fine-tuning, diffusion training hoặc chuyển production qua tunnel. Các phần đó không được tính là pass.
- Không kiểm tra dữ liệu học tập người dùng thật có lịch sử vì DB local không có các bản ghi đó; E2E kiểm tra persistence trên fixture có dữ liệu.
