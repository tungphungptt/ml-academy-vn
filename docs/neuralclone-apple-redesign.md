# NeuralClone — Apple Design, 28/10/2026

Tiếp tục working tree hiện có tại `D:\Projects\ml-academy-vn`. Đã đọc toàn bộ [Apple Design SKILL.md](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md) qua GitHub connector, lưu bản đã đọc và SHA-256 trong `.local/apple-redesign-start`. Không có AGENTS.md áp dụng trong dự án/thư mục cha đã kiểm tra. Snapshot trước sửa gồm **1.550 file**, Git status và bản sao các file nguồn; backup SQLite bằng `VACUUM INTO` tại `.local/apple-redesign-start/before.db`. Không clone/sync/push hoặc đổi hạ tầng.

## Những gì thay đổi trong trải nghiệm

- **App shell:** một lớp navigation trung tính, hơi trong ở phía trên; vị trí route hiện tại rõ. Giữ logo NeuralClone, chuyển màu tương tác sang xanh dương; phân biệt màu điều khiển với màu dữ liệu trong biểu đồ. Menu mobile mở từ nút, có spring có thể đổi hướng, Escape/outside click, focus trở về nút và nội dung đóng không lọt vào thứ tự Tab.
- **Trang chủ:** thông điệp học AI bằng tiếng Việt, hành động chọn lộ trình và Code Lab; thí nghiệm hồi quy vẫn tính thật. Số bài/lab/dự án vẫn lấy từ nội dung hiện có. Dashboard giữ truy vấn tiến độ và gợi ý học tiếp từ dữ liệu thật, không thêm số liệu trang trí.
- **Thư viện/lộ trình:** filter thành một nhóm dễ nhận biết, nhãn lớn hơn; phân cấp chương/bài, mức độ, tiến độ và card thống nhất. Không đổi query, điều kiện lọc hoặc URL.
- **Bài học:** chiều rộng đọc tối đa 46rem, vùng nội dung đặc trên desktop và ít khung trên mobile. Bỏ thông tin module bị lặp ở metadata vì breadcrumb đã thể hiện. Mục lục mobile bám theo vùng đọc, đóng sau khi chọn mục, chuyển focus đến heading; Escape trả focus về summary. Giữ KaTeX, MathML, tabindex và cuộn bàn phím cho công thức dài.
- **Quiz:** card lựa chọn, radio, selected/correct/wrong, trạng thái chấm và lời giải gần câu hỏi. Giữ seed `null`/fieldset chờ hydration để Firefox không mất click đầu, thứ tự xáo trộn, API, đáp án và logic chấm.
- **Code Lab:** lệnh chạy/Stop/Reset/copy/download nằm trước editor trong cả DOM lẫn thứ tự Tab. Output nằm cạnh editor trên desktop, bên dưới ở mobile, có liên kết “Xem output” khi đã có kết quả/lỗi. Vẫn phân biệt tải runtime, tải package, chạy, hoàn tất và lỗi theo message worker hiện có; giữ giới hạn tải 5 phút và chạy mã 90 giây. Không đặt aria-busy quanh live region tải để tránh trì hoãn thông báo trạng thái.
- **Ngưỡng quyết định:** nhóm điều khiển đặt cạnh biểu đồ; trên mobile nhóm gần nhau theo chiều dọc. Ma trận nhầm lẫn có trục nhãn thật/dự đoán, TP/FN/FP/TN và tổng chi phí riêng. Giữ bảng tám dự đoán, chú giải điểm đặc/rỗng, equality, undefined precision và trạng thái hai chi phí 0. SVG dùng hệ tọa độ gọn hơn và nhãn lớn hơn; công thức tính và dữ liệu không thay.
- **Auth/tài khoản và route hỗ trợ:** cùng typography, control, radius, khoảng cách, trạng thái lỗi/empty; giữ return URL, validation, session, quyền truy cập và dữ liệu.

## Nguyên tắc skill được áp dụng

| Nguyên tắc | Triển khai |
| --- | --- |
| Phản hồi tức thì | `:active` phản hồi ngay lúc nhấn; thao tác vẫn commit theo click/native input, có thể hủy trước khi thả. Slider cập nhật trực tiếp, không thêm debounce hoặc animation vào phép tính. |
| Chuyển động có thể ngắt | Spring critically damped dùng nghiệm giải tích, giữ vị trí/vận tốc đang hiển thị khi đổi target. Menu không khóa nút trong lúc đóng/mở; không tạo React render mỗi frame. Có unit test đảo chiều và E2E mở–đóng–mở khi chưa settle. |
| Quan hệ không gian | Menu gắn vào mép trên/phải của nút; mở/đóng cùng đường. TOC đóng về đúng summary; điều khiển demo gần kết quả chịu ảnh hưởng. |
| Vật liệu và độ sâu | Chỉ header dùng blur 18px và nền gần đặc. Menu, paper đọc, editor/output và card dùng nền đặc; không xếp chồng các mặt kính. |
| Typography có thứ bậc | Size, weight, tracking, leading được đặt cùng cấp. Body thoáng hơn label, heading lớn tracking âm vừa phải; spacing/chiều rộng theo rem và token. |
| Quyền chủ động và khả năng tiếp cận | Không thay cuộn bằng custom gesture; dùng native range, details, anchor, keyboard và focus. Reduced motion tắt spring/scale; reduced transparency/contrast có CSS riêng. Không thêm sound/haptics không cần thiết. |

`design-tokens.css` là nguồn chung cho light/dark, neutral/semantic/plot colors, system font/code font, spacing, content width, radius, shadows, header và motion. `apple-design.css` là lớp sản phẩm; `globals.css` tiếp tục giữ các quy tắc chức năng/overflow/editor/route tương thích, đã bỏ block token cũ để không có hai nguồn màu/font.

## Typography và ảnh thực tế

Chuyển sang `system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", "Be Vietnam Pro", sans-serif`. Be Vietnam Pro đầy đủ vẫn được giữ làm fallback cùng giấy phép; không quay lại subset thiếu dấu, không bỏ dấu, không sửa DB hay code literal. Bỏ hai preload WOFF2 vì platform font là lựa chọn đầu.

Trước khi áp dụng rộng, đã chạy **48 specimen mỗi engine** (8 câu × 3 size × NFC/NFD) trên Chrome/Firefox/WebKit: delta độ rộng NFC/NFD bằng 0. Chrome CDP xác nhận cả 48 dùng Segoe UI Semibold, không có glyph font khác xen vào. [Candidate/font evidence](neuralclone-apple-font-candidate.json), [ảnh NFC](screenshots/apple-font-candidate/chromium-NFC.png) / [NFD](screenshots/apple-font-candidate/chromium-NFD.png). Đây là kiểm chứng Windows; không suy ra đã kiểm tra SF Pro trên máy Apple.

[Quan sát resource/font sau sửa](neuralclone-apple-font-resources.json): trang chủ trong browser context mới không request Be Vietnam WOFF2; SVG ngưỡng dùng Segoe UI normal thực tế theo CDP. Chỉ header có blur 18px; spring chỉ chạy khi đổi trạng thái rồi dừng, cập nhật CSS transform/opacity không setState mỗi frame. Không thêm animation library hoặc dependency ứng dụng. Chưa đo một benchmark Core Web Vitals/Lighthouse mới, nên không quy các thay đổi này thành điểm hiệu năng được đo.

Đã dựng và kiểm tra app shell + bài LLM trước khi mở rộng các trang khác: [prototype DOM/console](neuralclone-apple-prototype.json), [mobile](screenshots/apple-prototype/lesson-light-375.png), [desktop](screenshots/apple-prototype/lesson-dark-1440.png).

Baseline mới của chính lượt này: 11 màn hình × 4 chiều rộng × 2 theme = **88 lượt trang**, thêm 8 ảnh chi tiết demo, trên Chrome. Bản sau chụp cùng route/viewport/theme/state trên ba engine; trước/sau dùng fixture học mới chưa có progress/attempt, không ghi vào DB thật. Email fixture account chứa UUID khác nhau; không coi khác biệt email đó là thay đổi sản phẩm.

| Màn hình / cùng điều kiện Chrome | Trước | Sau |
| --- | --- | --- |
| Trang chủ light/1440 | [Trước](screenshots/apple-before/chrome/home-light-1440.png) | [Sau](screenshots/apple-after/chrome/home-light-1440.png) |
| Bài học dark/375 | [Trước](screenshots/apple-before/chrome/lesson-dark-375.png) | [Sau](screenshots/apple-after/chrome/lesson-dark-375.png) |
| Thư viện light/768 | [Trước](screenshots/apple-before/chrome/courses-light-768.png) | [Sau](screenshots/apple-after/chrome/courses-light-768.png) |
| Quiz dark/375 | [Trước](screenshots/apple-before/chrome/quiz-dark-375.png) | [Sau](screenshots/apple-after/chrome/quiz-dark-375.png) |
| Code Lab dark/1440 | [Trước](screenshots/apple-before/chrome/lab-dark-1440.png) | [Sau](screenshots/apple-after/chrome/lab-dark-1440.png) |
| Demo ngưỡng light/375 | [Trước](screenshots/apple-before/chrome/threshold-detail-light-375.png) | [Sau](screenshots/apple-after/chrome/threshold-detail-light-375.png) |
| Đăng nhập light/375 | [Trước](screenshots/apple-before/chrome/login-light-375.png) | [Sau](screenshots/apple-after/chrome/login-light-375.png) |
| Tài khoản light/1920 | [Trước](screenshots/apple-before/chrome/account-light-1920.png) | [Sau](screenshots/apple-after/chrome/account-light-1920.png) |

Đã mở ảnh trình duyệt để kiểm tra dấu, khoảng cách, UI, ma trận/SVG và vùng code; không chỉ dựa vào assertion. Các cặp khác đủ 375/768/1440/1920px, light/dark trong hai thư mục. Firefox/WebKit có ảnh bản sau riêng, không giả lập thành ảnh Safari/iOS thật.

## Lỗi tìm thấy trong quá trình kiểm chứng

1. **Text 200%:** Chrome/Firefox có scrollWidth 389px ở viewport 375px. DOM chỉ đúng h1 chứa từ dài và nút Focus có min-content/flex-shrink ngăn co. Sửa `min-width:0`, emergency wrap cho heading và max-width/shrink của nút; không dùng `overflow-x:hidden` để che. Sau sửa 375px, không phần tử tràn; kiểm tra lại trên cả ba engine. [DOM trước](neuralclone-apple-zoom-before.json) / [sau](neuralclone-apple-zoom-after.json), [ảnh trước](screenshots/apple-issues/text-200-before.png) / [sau](screenshots/apple-issues/text-200-after.png).
2. **Khung range mobile:** selector cũ giới hạn width slider trong demo; thêm rule đúng scope cho slider nhóm điều khiển, tránh nhãn/track lệch nhau khi đổi bố cục.
3. **Harness sau thay UI:** test cũ chọn mọi `tbody` và `role=status`; ma trận mới và native `output` làm selector không còn duy nhất. Scope test bảng tám mẫu và đặt tên riêng “Chi phí bằng 0”. Không bỏ kiểm tra giá trị biên hoặc nới tolerance.
4. **Focus math trong test:** sau navigation, test focus trước khi đưa vùng công thức vào viewport có thể bị quá trình focus navigation ghi đè. Thêm scroll-into-view và assertion focused trước ArrowRight. Công thức thật được kiểm tra cuộn bằng keyboard; không sửa phép toán hoặc ẩn nội dung.
5. **WebKit public Pyodide:** probe đầu hết 390 giây ở lượt tải runtime, 10/16 trang hoàn tất, không console/network failure đã ghi nhận. Replay trực tiếp mới chạy được cùng lab với stdout đúng sau khoảng 36 giây. Chưa có bằng chứng xác định nguyên nhân lần timeout. Probe được thêm progress, lựa chọn engine, output path và polling theo timer thay vì phụ thuộc RAF cho kiểm tra trạng thái worker; không đổi timer ứng dụng, TLS/CORS/integrity hoặc expected để làm pass. Xem bằng chứng/kết quả cuối trong QA; giữ probe thất bại để đối chiếu.
6. **Mục lục che quiz mobile:** visual review sau khi test geometry đạt cho thấy sticky TOC còn theo xuống quiz. Thêm observer giới hạn phần đọc: thanh mục lục mobile ẩn khi article đã ra khỏi viewport, không che câu hỏi. Tăng scroll-padding khi dùng TOC và thêm regression tới `#quiz` kiểm tra thanh đã ẩn; chạy lại cả sáu Apple test sau sửa và mở ảnh quiz mới để xác nhận.

## Kết quả kiểm tra của chính lượt này

[QA mới](neuralclone-apple-qa.json) chứa kết quả cuối, runtime, lệnh và phạm vi; [manifest](neuralclone-apple-change-manifest.json) chứa từng file/hash so với snapshot lúc bắt đầu, không so với Git HEAD.

| Nhóm thực sự chạy trong lượt này | Kết quả cuối |
| --- | --- |
| TypeScript và unit (`npm run verify`) | **66/66 đạt**; thêm một test spring, không dùng lại con số 65 của bàn giao. |
| Production build | `next build` đạt qua E2E server fixture `.next-e2e`, cổng 3100; bản build cuối cho suite Apple đã gồm sửa TOC. |
| Apple UI/interaction | **6/6 đạt**, hai test mỗi engine; 88 lượt trang/theme/viewport mỗi engine, menu ngắt chuyển động, TOC/quiz, keyboard math, text 200%, reduced motion. |
| Cross-browser bảo toàn hành vi | **12/12 đạt** ở Chrome/Firefox/WebKit; auth return/quiz/hydration, Pyodide NumPy/sklearn, Stop/Reset/error, NFC/NFD 384 mẫu mỗi engine, hai theme/bốn width và ngưỡng biên. |
| Regression Chrome | **29/29 đạt**; sweep 67 bài, bảo mật/auth, quiz/notes/progress, UI/contrast, math/typography. Chạy trước sửa cuối TOC; sáu test Apple chạy sau sửa kiểm chứng phần UI bị ảnh hưởng. |
| Pyodide | **14/14 output khớp**, direct Chromium CDN. |
| Tám bài bổ sung | **64 điều kiện**; 0 overflow, 0 KaTeX error, 0 heading trộn font theo CDP. |
| Touch mô phỏng | Chrome và WebKit: tap menu → Code Lab, tap đổi theme đạt; không phải thiết bị thật. |
| Public | Firefox **16/16** trang; WebKit lượt cuối **16/16**, cả hai theme, có chạy threshold Python ở hai điều kiện public; không console/request/socket error ở các lượt cuối được chọn. |
| HMR mới | Local/domain đều **101**, 52/48 frame trong phép thử, đổi và hoàn nguyên heading không reload; file phục hồi byte-for-byte, 0 console error. |
| Bổ sung | `tsc --noEmit --noUnusedLocals --noUnusedParameters` đạt; DB so từng hàng mọi bảng khớp backup; `next.config.js` và 272 file nội dung/config/business được đối chiếu bảo toàn. |

Giữ nguyên hai probe WebKit timeout và [probe 14 trang có một document HTTP 502](neuralclone-apple-public-webkit-active.json). [Lượt cuối 16 trang](neuralclone-apple-public-webkit-final.json) chạy khi các build/suite khác đã dừng, đưa tab lên active và đọc phase bằng Node polling; không thay logic app. Local và URL public `/lab?lab=threshold_cost` cùng được kiểm tra lại HTTP 200. Chưa xác định nguyên nhân timeout/502 trước đó, vì thế không kết luận môi trường mạng/tunnel đã được “sửa” hoặc luôn ổn định.

Các nhóm chạy mới: `npm run verify`, production `next build` qua E2E server fixture, suite Apple (visual/interaction/text enlargement), suite cross-browser (auth/quiz/Pyodide/math/threshold), regression Chrome mặc định, 14 ví dụ Pyodide direct CDN, 64 điều kiện visual của 8 bài bổ sung, probe local/public và HMR thay/hoàn nguyên heading. Các report trước lần sửa hoàn tất có tên `initial`, `intermediate` hoặc `pre-zoom-fix`; không dùng chúng làm kết quả pass cuối.

Môi trường: Windows 11 build 26300, Node 24.19.0, Playwright 1.64.1; Chrome 156.0.8078.49, Firefox 157.0, Playwright WebKit 27.2. Browser chạy headless. Mobile là viewport/touch emulation; text 200% là tăng root font-size để kiểm tra reflow, không giả là thiết bị Dynamic Type thật hoặc kiểm thử browser chrome zoom bằng phần cứng. Reduced transparency/contrast kiểm tra thêm bằng Chromium CDP, không gọi đó là kiểm thử setting OS trên mọi engine.

Các số **65/65, 12/12, 3/3, 29/29, 14/14** trong báo cáo bàn giao trước là baseline. Chỉ bảng QA mới thể hiện những gì đã thực sự chạy lại trong lượt này. Không báo ESLint đã chạy vì dự án không có lệnh lint riêng.

## Chạy lại

```powershell
npm run verify
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.local\ms-playwright"
npx --no-install playwright test --config playwright.apple.config.ts
$env:CROSS_SCREENSHOT_DIR='docs/screenshots/apple-cross'
$env:CROSS_REPORT_PREFIX='neuralclone-apple-cross'
$env:PLAYWRIGHT_JSON_OUTPUT_NAME='docs/neuralclone-apple-cross-results.json'
npx --no-install playwright test --config playwright.cross-browser.config.ts --reporter=list,json
$env:PLAYWRIGHT_CHANNEL='chrome'
$env:PLAYWRIGHT_JSON_OUTPUT_NAME='docs/neuralclone-apple-regression-results.json'
npm run e2e -- --reporter=list,json
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/check_pyodide.mjs --report docs/neuralclone-apple-pyodide.json
node scripts/check-cross-public.mjs --report docs/neuralclone-apple-public.json --screenshots docs/screenshots/apple-public
node scripts/check-cross-public.mjs --engine webkit --report docs/neuralclone-apple-public-webkit-final.json --screenshots docs/screenshots/apple-public-webkit-final
node scripts/check-apple-touch.mjs
node scripts/check-hmr.mjs --report docs/neuralclone-apple-hmr.json --screenshots docs/screenshots/apple-hmr
node scripts/audit-content-visuals.mjs --report docs/neuralclone-apple-content-visuals.json --screenshots docs/screenshots/apple-content
```

E2E tự dùng DB fixture và cổng 3100, không chạy đồng thời hai suite dùng cổng đó. Server người dùng tiếp tục chế độ Next dev trên **3000**. Không đổi `next.config.js`, CSP, allowedDevOrigins, domain hoặc cấu hình tunnel. `next-env.d.ts` do build/typegen sinh được trả đúng bytes bàn giao sau kiểm tra.

## File, dữ liệu và giới hạn

Nguồn chính: tokens/product CSS, layout, Nav + disclosure motion/spring, LessonTools/reading header, Landing, QuizForm, CodeLab và Threshold; bổ sung/cập nhật tests và script evidence. **Không thêm dependency ứng dụng.** WOFF2/SVG học tập, lessons, quizzes, catalog, lab algorithms, notebooks/expected vẫn được bảo toàn; manifest ghi file cụ thể và ảnh mới.

Không import/seed/reset/migrate DB thật. Backup và đối chiếu toàn bộ hàng từng bảng được ghi trong QA. Không phát sinh chức năng hoặc dữ liệu giả.

**Transfer vẫn mở, strict FAIL theo bàn giao:** 334/360 ổn định trong năm lượt trước, baseline 335/360 suy từ accuracy lịch sử, thiếu predictions/checkpoint/build metadata gốc. Không chạy lại training trong nhiệm vụ UI, không sửa expected/output/tolerance, không tuyên bố đã giải quyết. Xem [điều tra gốc](neuralclone-transfer-investigation.md).

Chưa có Safari/macOS, iOS hoặc Android thật; WebKit Windows không đồng nghĩa Safari. Chưa có full screen-reader audit hay nghiên cứu usability với người học thật. Kiểm thử tự động/visual review không thay thế hai phần đó. Lượt tải WebKit public bị timeout được nêu riêng, không xóa khỏi bằng chứng dù replay thành công.
