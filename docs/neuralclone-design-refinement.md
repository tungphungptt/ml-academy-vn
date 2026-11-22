# NeuralClone — studio học tập và sổ tay khoa học

Ngày bắt đầu: 28/10/2026. Tiếp nối bản Apple Design, giữ toàn bộ nội dung/logic và thay đổi chưa commit. Đã đọc đầy đủ [Apple Design SKILL.md](https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md); bản đã đọc/hash, Git status, snapshot và backup DB ở `.local/refinement-start`. Không có AGENTS.md áp dụng được tìm thấy. Snapshot có 2.452 file; DB trước sửa có 67 lesson, 157 question, 0 user/progress/attempt/note/bookmark. Các con số kiểm thử Apple trong bàn giao là lịch sử, không phải kết quả chạy mới.

## Khảo sát trước thiết kế

Đọc bài LLM, dữ liệu lệch lớp/calibration/threshold và luồng bài thực hành; chạy thật luồng tìm calibration → bài → đăng ký quay lại quiz → chấm 3/3 → lưu hoàn thành → Python threshold → RAG → học tiếp → login trở lại quiz trong DB fixture, không dùng DB thật. [Kết quả discovery](neuralclone-refinement-discovery.json). Chụp mới 88 lượt trang ở hai theme/bốn width trên Chrome trước chỉnh UI; không dùng lại ảnh bàn giao làm baseline mới.

| Màn hình | Người học cần | Điểm cần cải thiện / quyết định |
| --- | --- | --- |
| Trang chủ | Biết học gì, bắt đầu đâu, thử được một ý tưởng | Hệ sans và card bo tròn khá đồng đều. Dùng tiêu đề serif, lời dẫn gần gũi, minh họa MLP có phép tính rõ và giữ thí nghiệm hồi quy thật. |
| Thư viện | Quét chủ đề/độ khó, lọc và nhận ra tiến độ | Phân nhóm bằng số chương, đường kẻ, icon/nodes; giữ filter GET và dữ liệu thật. |
| Bài dài | Đọc không mệt, hiểu công thức, biết bài trước/sau | Thử hai phối font trên trích đoạn thật, giới hạn chiều rộng cột đọc; nhịp heading/đoạn/ví dụ khác nhau. Không reveal/parallax văn bản bài đang đọc. |
| Quiz | Biết đã chọn gì, vì sao sai và học tiếp | Giữ chấm điểm/hydration guard; phản hồi ngắn, giải thích tại câu hỏi, chuyển động nhỏ khi xuất hiện kết quả. |
| Code Lab | Biết đang tải hay đang chạy; thấy code và output thật | Giữ phase tải/runtime và timer hiện có; tăng tương phản thông tin và kết nối bài học/thực hành. |
| Ngưỡng | Thấy tham số làm đổi dự đoán và chi phí thế nào | Giữ phép tính, matrix/bảng/biên; nhấn nhóm điều khiển và thống nhất typography/plot annotations. |
| Auth/tài khoản | Điền nhanh, hiểu lỗi và quay lại đúng bài | Cùng ngôn ngữ studio, không thay validation/session/return path. |

## Hướng thị giác và chuyển động

Nền giấy ấm/ink tối, điểm nhấn teal và copper; motif “điểm dữ liệu — đường nối — ghi chú lề” có hệ thống. Hai family chính: thử Lora + Be Vietnam Pro và Newsreader + Be Vietnam Pro trước khi chọn; monospace cho code và KaTeX cho math giữ vai trò riêng. Không dùng ảnh stock hoặc trang trí số liệu giả.

Áp dụng skill: phản hồi press tức thì trên control; spring menu giữ vị trí/vận tốc khi đổi hướng; minh họa dữ liệu có pause/step và dừng ngoài viewport/tab; reveal chỉ các khối định hướng, nội dung mặc định luôn hiện nếu JS/animation không chạy. Vật liệu trong chỉ dành cho chrome, vùng đọc đặc; reduced motion giữ đủ thông tin dạng tĩnh. Mọi hành động có keyboard thay thế, không khóa input chờ animation.

## Typography đã chọn

Đã thử **hai phương án bằng nội dung NeuralClone thật**, không chọn từ ảnh quảng cáo font: Lora + Be Vietnam Pro và Newsreader + Be Vietnam Pro. Mỗi phương án có 96 mẫu NFC/NFD, chữ hoa, dấu câu, normal/semibold/italic/bold italic. Chromium CDP xác nhận một face custom cho mỗi mẫu; chênh lệch chiều rộng NFC/NFD bằng 0. [Dữ liệu thử font](neuralclone-refinement-type-trials.json), ảnh [Lora](screenshots/refinement-type-trials/Lora-light-1440.png) và [Newsreader](screenshots/refinement-type-trials/Newsreader-light-1440.png).

Chọn **Lora cho display/heading và Be Vietnam Pro cho nội dung/UI**. Lora có nét serif và italic ấm, rõ ở tiêu đề nhỏ, tạo cảm giác sổ tay khoa học. Hai face Lora normal/italic tổng 176.172 byte; Newsreader thử nghiệm tổng 454.284 byte và không được đưa vào public. System font vẫn là fallback của UI; lựa chọn font riêng thực hiện theo yêu cầu typography của sản phẩm.

| Vai trò | Font / cách dùng |
| --- | --- |
| Hero | Lora 500; 48–83px trên desktop, khoảng 43px ở mobile; italic cho “Hiểu từ gốc.”; line-height 1,16 |
| Tiêu đề trang/bài | Lora 500, tracking −0,02em; bài 32–51px, line-height 1,3–1,4 |
| Heading trong bài | Lora 500 ở h2; Be Vietnam Pro semibold ở h3/h4 để phân biệt cấp |
| Đọc dài | Be Vietnam Pro 16px/1,95; mobile 15px/2; chiều rộng đọc giới hạn bằng token, không kéo văn bản theo toàn màn hình |
| Navigation/control | Be Vietnam Pro 400/500/600/700; nhãn rõ, focus/press giữ cùng quy ước |
| Caption/metadata/số | Be Vietnam Pro; số dùng tabular-nums khi thích hợp; số chương và điểm nhấn editorial dùng Lora |
| Code/toán | Giữ monospace hệ thống và KaTeX; công thức dài vẫn có vùng cuộn focus được |

Font lấy từ [Google Fonts Lora](https://github.com/google/fonts/tree/main/ofl/lora), [Newsreader](https://github.com/google/fonts/tree/main/ofl/newsreader), [Be Vietnam Pro](https://github.com/google/fonts/tree/main/ofl/bevietnampro), kiểm tra ngày 28/10/2026. File được chuyển WOFF2 **không subset**, giữ GPOS/GSUB; kiểm tra cmap 195 code point bắt buộc cho tiếng Việt và combining marks. [Manifest build font](neuralclone-refinement-font-build.json) ghi URL, hash, size và axis. License OFL nằm trong public/fonts. Không thêm unicode-range chia một từ thành nhiều subset.

Self-host cùng origin, tương thích CSP hiện có; preload chỉ Be Vietnam Pro regular và Lora normal, các face khác tải khi dùng. Be Vietnam Pro có italic thật ở 400/600/700. Lora variable cung cấp normal/italic 400–700. Không thêm font CDN, không đổi CSP. Regression CDP kiểm tra **3.360 mẫu** qua bảy vai trò/ba cỡ chữ/hai dạng Unicode/tám điều kiện theme–width, mỗi mẫu đúng một custom font; thêm 40 kiểm tra NFD tại tiêu đề, đoạn đọc, legend/option quiz và nút thật. Firefox/WebKit dùng FontFaceSet, computed styles, hình học NFC/NFD và ảnh; không tuyên bố có API actual-font CDP trên hai engine đó.

Đã kiểm tra thêm [20 selector render thật trên local/public](neuralclone-refinement-public-rendered-fonts.json), không ép `document.fonts.load` để đổi kết quả: h1 dùng Lora Medium và phần em dùng Lora Medium Italic; đoạn đọc dùng Be Vietnam Pro Regular, strong dùng Bold, nhãn SVG dùng Medium. Mọi face là custom đúng family, không có fallback trong các đoạn được kiểm tra; computed weight/style cũng khớp giữa hai origin. h1 tổng hợp hai face Lora do có em là chủ ý, không phải tách dấu trong một từ.

## Bố cục, màu và tương tác

- Token dùng chung chuyển sang nền giấy ấm, mực xanh rừng và copper; light/dark đều có surface, accent, trạng thái, border/control và shadow riêng. Material chỉ áp dụng navigation/chrome; vùng đọc ổn định.
- App shell, trang chủ, thư viện, trang khóa học/bài, quiz, lab, threshold, tìm kiếm, dự án/dataset/tài liệu, auth/tài khoản dùng cùng hệ typography và đường kẻ/nodes. Không sửa nội dung bài, câu hỏi, dữ liệu, API hoặc điều kiện chấm điểm.
- Hero kết hợp lời dẫn gần gũi với SVG forward pass MLP 2–2–1. Phép tính thực: h1=0,70; h2=0,29; z=0,606; sigmoid(z)=0,6470278089459086. Unit test đối chiếu số sigmoid tính độc lập bằng Python Decimal. Minh họa ghi rõ trọng số cố định, chưa huấn luyện/calibration, không gán độ chính xác giả.
- Thí nghiệm hồi quy cũ được **giữ nguyên**, chuyển xuống phần “Thay một con số. Nhìn điều thay đổi.”; vẫn chạy phép tối ưu thực, có liên kết bài học.
- SVG có title/description, giải thích từng bước, pause/play/restart, nút “Từng bước” và phần mở phép tính. Chạy tự động một lượt rồi dừng; không loop vô hạn. WAAPI pause/play giữ currentTime. Dừng ngoài viewport/tab ẩn; reduced motion cho sơ đồ tĩnh đầy đủ và nút bước thủ công.
- Reveal ngắn chỉ áp dụng khối định hướng/card/header, không giấu đoạn đọc hoặc câu hỏi. Nội dung luôn sẵn nếu JS/animation không chạy. Parallax chỉ dịch đường kẻ trang trí tối đa 12px khi fine pointer, desktop và hero trong viewport; không chặn cuộn.
- Menu spring hiện có giữ nguyên vị trí/vận tốc khi bị ngắt. Control phản hồi press tức thì; quiz có phản hồi nhẹ khi trả kết quả; trạng thái runtime/thư viện/thực thi/lỗi của Code Lab được giữ nguyên.

| Nguyên tắc Apple Design | Vị trí áp dụng / lợi ích |
| --- | --- |
| Phản hồi thao tác tức thì | Button/control có press/focus; slider không chờ animation, học viên thấy kết quả ngay |
| Interruptible motion, presentation state | Menu spring và packet pause/play; thao tác liên tiếp không nhảy về đầu |
| Quan hệ không gian | Menu mở dưới navigation, mục lục đi cùng bài; biểu đồ và nút điều khiển chung một figure |
| Typography và hierarchy | Serif cho định hướng, sans cho học/điều khiển, nhịp đoạn–heading–ví dụ khác nhau |
| Material thể hiện độ sâu | Navigation nổi nhẹ, surface đọc đặc; không phủ blur lên nội dung học |
| Accessibility theo preference | Reduced motion, reduced transparency/increased contrast, keyboard và touch thay thế |

## Những lỗi đã tái hiện và sửa trong lượt này

1. **Tiêu đề mobile thành cột hẹp:** h1 mới có metrics khác nhưng nút tập trung vẫn chia một flex row. Chuyển header ở width ≤800px sang grid một cột, nút nằm hàng riêng. [Ảnh lỗi thực](screenshots/refinement-issues/narrow-title-before.png) và [sau sửa cùng bài/dark/375px](screenshots/refinement-after/firefox/lesson-dark-375.png).
2. **Tràn ngang khi tăng chữ 200%:** flex item của PageHeading giữ min-width:auto, từ “Playground” mở rộng trang thành 393px tại viewport 375px. Cho vùng tiêu đề min-width:0/max-width:100% và h1 overflow-wrap:anywhere. [Số đo trước](neuralclone-refinement-zoom-before.json) → [sau](neuralclone-refinement-zoom-after.json): cả bài dài, CPU guide, threshold và login đều scrollWidth=375. [Ảnh bài tăng chữ](screenshots/refinement-issues/text-200-after.png) minh họa cách đọc, không phải ảnh chứng minh riêng lỗi Playground trước sửa.
3. **Số trên neuron chưa kích hoạt thiếu contrast:** opacity toàn group 0,5 làm chữ đạt 2,84:1 light / 4,32:1 dark. Giữ opacity chữ bằng 1, phân biệt bước bằng viền/nền. Sau sửa đạt 12,30:1 / 12,59:1. [Trước](neuralclone-refinement-contrast-before.json) / [sau](neuralclone-refinement-contrast-after.json), tổng 18 cặp kiểm tra. Đây là kiểm tra các cặp đã chọn, không phải chứng nhận accessibility toàn bộ.
4. **WebKit treo screenshot sau thay document liên tiếp:** lỗi nằm ở call log Playwright chờ `document.fonts.ready`; kiểm tra main-world báo loaded, mở login/register riêng đều font-ready và chụp được. Giữ nguyên bước chờ font, tách page cho mỗi ảnh WebKit và tiếp tục kiểm tra HTTP/font/layout/console. Lượt đầy đủ sau đó đạt. Không tắt log, không dùng `PW_TEST_SCREENSHOT_NO_FONTS_READY`. [Lượt lỗi](neuralclone-refinement-webkit-reused-page-failure.json), [kiểm tra trang riêng](neuralclone-refinement-webkit-font-diagnosis.json). Chưa xác định sâu nguyên nhân native/utility-world của WebKit; không quy thành lỗi ứng dụng hoặc nguyên nhân HTTP 502.
5. **Cảnh báo hydration do thao tác screenshot quá sớm trên dev:** [lượt đối chiếu public đầu](neuralclone-refinement-public-ui-first-attempt.json) có một cảnh báo ở local light/1440. Diff chỉ ra `caret-color:transparent` trên slider; mã Playwright 1.64.1 tại `inPagePrepareForScreenshots` thêm inline style này khi chụp trước hydration. Harness mới chờ effect reduced-motion đã mount và dùng `caret:'initial'`, không can thiệp DOM để giấu caret. [Bốn lượt kiểm tra lại](neuralclone-refinement-public-ui.json) đều không console error. Không thêm suppressHydrationWarning hoặc che log ứng dụng.

Các lượt thất bại đầu tiên được giữ trong `neuralclone-refinement-initial-results.json`, `neuralclone-refinement-ui-second-attempt.json` và `neuralclone-refinement-webkit-diagnosis.json`; kết quả cuối được lưu riêng, không trình bày lượt lỗi thành pass.

## Ảnh trước/sau và chuyển động

Baseline và ảnh sau đều chụp mới trong lượt này: 11 màn hình × hai theme × 375/768/1440/1920px, viewport height 1000px, reduced motion để so layout. Baseline Chrome; ảnh sau Chrome/Firefox/WebKit. Fixture giữ cùng bài và trạng thái học; quiz có thứ tự lựa chọn được xáo trộn hợp lệ, không phải pixel-golden deterministic. Một số cặp đại diện:

| Màn hình / điều kiện | Trước | Sau |
| --- | --- | --- |
| Trang chủ / light 1440 | [Ảnh](screenshots/refinement-before/chrome/home-light-1440.png) | [Ảnh](screenshots/refinement-after/chrome/home-light-1440.png) |
| Trang chủ / light 375 | [Ảnh](screenshots/refinement-before/chrome/home-light-375.png) | [Ảnh](screenshots/refinement-after/chrome/home-light-375.png) |
| Thư viện / light 768 | [Ảnh](screenshots/refinement-before/chrome/courses-light-768.png) | [Ảnh](screenshots/refinement-after/chrome/courses-light-768.png) |
| Bài LLM / dark 375 | [Ảnh](screenshots/refinement-before/chrome/lesson-dark-375.png) | [Ảnh](screenshots/refinement-after/chrome/lesson-dark-375.png) |
| Quiz / dark 768 | [Ảnh](screenshots/refinement-before/chrome/quiz-dark-768.png) | [Ảnh](screenshots/refinement-after/chrome/quiz-dark-768.png) |
| Lab / light 1920 | [Ảnh](screenshots/refinement-before/chrome/lab-light-1920.png) | [Ảnh](screenshots/refinement-after/chrome/lab-light-1920.png) |
| Threshold / light 1440 | [Ảnh](screenshots/refinement-before/chrome/threshold-detail-light-1440.png) | [Ảnh](screenshots/refinement-after/chrome/threshold-detail-light-1440.png) |
| Đăng nhập / dark 375 | [Ảnh](screenshots/refinement-before/chrome/login-dark-375.png) | [Ảnh](screenshots/refinement-after/chrome/login-dark-375.png) |
| Tài khoản / light 1440 | [Ảnh](screenshots/refinement-before/chrome/account-light-1440.png) | [Ảnh](screenshots/refinement-after/chrome/account-light-1440.png) |

Đã mở và xem trực tiếp ảnh hero desktop/mobile, thư viện, bài dài mobile, quiz tablet và lab desktop ở các engine/theme khác nhau. Các ảnh còn lại được kiểm tra cùng DOM/assertions; không tuyên bố đã xem thủ công từng ảnh. [Trace chuyển động Chromium](traces/neuralclone-refinement-chrome.zip) có ảnh, DOM và thao tác; đường dẫn video thực nằm trong [báo cáo motion](neuralclone-refinement-chrome-motion.json). Mở trace bằng `npx playwright show-trace docs/traces/neuralclone-refinement-chrome.zip`.

## Điều tra timeout/502 và HMR

[Runtime trace mới](neuralclone-refinement-runtime-trace.json) có **bốn lượt đã định trước, không retry ngầm**: WebKit local/public × tải đầu/tải lại, chạy threshold Python thật. Tất cả HTTP document 200, output khớp chính xác; không console error, request failed hay socket error. Tổng thời gian lần lượt khoảng 35,4s / 6,1s local và 12,6s / 24,3s public. HMR nhận 6/9 frame theo cold/reload ở mỗi origin. Đây là phạm vi bốn lượt, không phải bảo đảm không bao giờ có 502.

Phân loại riêng HTTP status, WebSocket frame/error và giới hạn quan sát tool 120s; ứng dụng vẫn giữ loading budget 300s và execution 90s. [Khả năng lấy log](neuralclone-refinement-log-availability.json): không tìm thấy persistent server log trong dự án; tunnel hiện tại không cấu hình logfile và không lấy được stdout lịch sử. Vì vậy không thể đối chiếu trực tiếp thời điểm HTTP 502 cũ với Next/tunnel. Free RAM đầu một lượt khoảng 245MiB nhưng chính lượt đó vẫn hoàn tất; thiếu RAM chỉ là giả thuyết chưa chứng minh, không kết luận nguyên nhân.

[HMR kiểm chứng mới](neuralclone-refinement-hmr.json): localhost và neuralclone.site cùng nhận handshake 101 + frame thực; đổi tạm heading, browser cập nhật và hoàn nguyên **không navigation/reload**, giữ marker client-state. File Landing được khôi phục byte-for-byte. Không thay Next dev/port 3000/domain/tunnel/Origin/HMR config.

[Đối chiếu UI local/public](neuralclone-refinement-public-ui.json): bốn lượt đọc trang chủ (light/1440 và dark/375 tại mỗi origin), HTTP 200, không request failed/console error/overflow; computed body/display font và màu nền khớp từng cặp. [Ảnh public light](screenshots/refinement-public/public-light-1440.png), [dark mobile](screenshots/refinement-public/public-dark-375.png). Hai lần thực hiện phép đối chiếu được lưu riêng; không coi lượt đầu có cảnh báo là pass.

## Kiểm chứng và bàn giao

Môi trường vừa chạy: **Windows 11 Home build 26300, Node 24.19.0, Playwright 1.64.1; Chrome 156.0.8078.49, Firefox 157.0, WebKit 27.2**, headless desktop. Viewport/touch mobile là giả lập trên máy tính, không phải Safari/iOS/Android thật.

| Kiểm tra thực sự chạy mới | Kết quả / bằng chứng |
| --- | --- |
| `npm run verify` (Next typegen, TypeScript, unit) | **67/67**, không fail; `.local/refinement-verify-final.log` |
| `npx tsc --noEmit --noUnusedLocals --noUnusedParameters` | Exit 0, log rỗng; next-env.d.ts được khôi phục đúng bytes trước lượt sau build cuối |
| Production build + start fixture | Đạt qua `scripts/e2e-server.mjs 3100` của các suite; output `.next-e2e`, DB riêng, không chuyển server thật sang production |
| UI/interactions Chrome/Firefox/WebKit | **6/6**, [JSON](neuralclone-refinement-after-results.json); 88 trang/engine, hai theme/bốn width; console/request lỗi bằng 0 |
| Cross-browser học/quiz/lab/threshold | **12/12**, [JSON](neuralclone-refinement-cross-results.json); gồm hydration chậm/first-selection Firefox, auth return, math focus/scroll, Python stdlib/NumPy/sklearn, stop/reset/error recovery |
| Regression Chrome | **29/29**, [JSON](neuralclone-refinement-regression-results.json); bao gồm 67 bài, filter, publication/access guards, dữ liệu tiến độ và strict font CDP |
| Motion ba engine | **3/3**, [JSON](neuralclone-refinement-motion-results.json); có sample currentTime khi pause, trace/video thật |
| Toàn bộ biến thể Pyodide | **14/14**, [JSON](neuralclone-refinement-pyodide.json), direct Chromium CDN; output so sánh exact, không sửa expected |
| Touch giả lập 375px | Chrome + WebKit tap menu, chuyển Code Lab, đổi theme đạt; [JSON](neuralclone-refinement-touch.json) |
| Tăng chữ 200% | UI suite ba engine và chẩn đoán Chrome bốn route không tràn trang; không coi đây là kiểm tra browser toolbar zoom hoặc Dynamic Type trên máy thật |
| Contrast | 18 cặp được chọn đạt; số diagram không còn bị làm mờ; chi tiết ở báo cáo contrast |
| Font loading/CLS | 8 lượt Chrome cold context, trì hoãn font 250ms, CLS **0,001613–0,006644**, không overflow; [JSON](neuralclone-refinement-layout-observation.json). Đây là phép đo lab, không phải field Core Web Vitals/Lighthouse |
| HMR + public | HTTP 101, frame, đổi/hoàn nguyên không reload ở hai origin; 4 runtime probe và 4 UI comparison cuối đạt trong phạm vi đã ghi |
| Whitespace | `git -c core.safecrlf=false diff --check` exit 0; flag chỉ áp dụng lệnh để tránh cảnh báo chuyển LF/CRLF của Git trên PowerShell, không đổi cấu hình repo/hệ thống |

Các số trong bảng là kết quả lượt studio này. Không cộng các lần chạy lại thành thêm test case. Regression 29 chạy trước sửa contrast rất nhỏ của sơ đồ; cross-browser 12, motion 3 và UI 6 cuối chạy sau sửa đó. Một lần gọi nhầm `playwright.cross.config.ts` dừng trước khi chạy test; lần đúng dùng `playwright.cross-browser.config.ts`. ESLint chưa được cấu hình, không báo đã chạy lint.

Các con số 66 unit/6 Apple UI/12 cross/29 regression/14 Pyodide trong bàn giao cũ chỉ là **tham chiếu lịch sử**. Không dùng kết quả WebKit public 16/16 cũ để thay thế phép đối chiếu mới.

### Lệnh tái hiện

Trong PowerShell tại thư mục dự án, đặt browser cache của dự án (các binary đã có, không cài mới toàn hệ thống):

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.local\ms-playwright"
$env:DESIGN_REPORT_PREFIX="neuralclone-refinement"
$env:DESIGN_SCREENSHOT_PREFIX="docs/screenshots/refinement"
npx playwright test --config playwright.apple.config.ts
npx playwright test --config playwright.motion.config.ts
$env:CROSS_REPORT_PREFIX="neuralclone-refinement-cross"
$env:CROSS_SCREENSHOT_DIR="docs/screenshots/refinement-cross"
$env:PLAYWRIGHT_JSON_OUTPUT_NAME="docs/neuralclone-refinement-cross-results.json"
npx playwright test --config playwright.cross-browser.config.ts --reporter=list,json
$env:PLAYWRIGHT_CHANNEL="chrome"
$env:PLAYWRIGHT_JSON_OUTPUT_NAME="docs/neuralclone-refinement-regression-results.json"
npx playwright test --reporter=list,json
npm run verify
```

Các suite chạy **tuần tự**, tự build production/seed DB fixture ở 3100. Guard cấm dùng 3000/DB cá nhân cho auth/write test. Lệnh kiểm tra không được dùng để reset DB thật. Rerun sẽ cập nhật artifact mang prefix này; sao chép artifact trước nếu cần giữ lần chạy cụ thể.

```powershell
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
node scripts/check_pyodide.mjs --report docs/neuralclone-refinement-pyodide.json
node scripts/trace-public-runtime.mjs --report docs/neuralclone-refinement-runtime-trace.json
node scripts/measure-study-layout.mjs
node scripts/check-hmr.mjs --report docs/neuralclone-refinement-hmr.json --screenshots docs/screenshots/refinement-hmr
```

HMR command có thay tạm một tiêu đề và tự khôi phục trong finally; dùng khi chủ động kiểm chứng dev, không chạy đồng thời người khác sửa Landing. Font build có thể tái hiện bằng môi trường FontTools hiện có: `.local/font-tools/Scripts/python.exe scripts/build-refinement-fonts.py`; đầu ra ứng viên ở cache riêng, không tự cài font Windows. Không thêm dependency ứng dụng.

### File và dữ liệu

Nhóm file triển khai: `src/app/{design-tokens.css,fonts.css,studio.css,layout.tsx}`, `src/components/{Landing,KnowledgeFlow,StudioMotion}.tsx`, `src/lib/flowModel.ts`. Nhóm kiểm chứng: `tests/flow-model.test.ts`, năm spec liên quan ở e2e, config Playwright, `scripts/{build-refinement-fonts.py,trace-public-runtime.mjs,measure-study-layout.mjs}`. Năm WOFF2 mới và Lora OFL là asset mới; không xóa font/ảnh cũ. Danh sách tạo/sửa cùng SHA-256 đầy đủ nằm trong [manifest](neuralclone-design-refinement-change-manifest.json), bao gồm từng screenshot/JSON/video/trace.

[QA tổng hợp](neuralclone-refinement-qa.json) đối chiếu **2.442 file trước lượt không thuộc mười file hiện có được chỉnh có chủ đích**; tất cả nguyên hash, bao gồm báo cáo cũ, content, labs, notebook, ảnh cũ, config Origin/HMR và package/lock. Không có file bị di chuyển/xóa. Tất cả bảng DB khớp dữ liệu với backup, PRAGMA quick_check=ok; vẫn 67 bài/157 câu hỏi, không ghi user/progress fixture vào DB thật. Backup ở `.local/refinement-start/before.db`.

Server 3000 tiếp tục Next dev; các phép đọc cuối localhost/domain `/api/health` đều 200. Không dừng server thật, đổi tunnel, DNS hoặc đồng bộ/push GitHub. Nếu mở website đang chạy, tải lại để nhận asset/style mới; không cần đổi cấu hình vận hành. Cho môi trường local đang tắt, dùng quy trình `npm run dev -- --port 3000` đã có, không khởi động bản thứ hai khi cổng đang được dùng.

### Những mục còn mở

- **Transfer vẫn strict FAIL:** 334/360 so với baseline lịch sử suy ra 335/360; năm lượt ổn định là dữ liệu bàn giao. Lượt thiết kế này không chạy lại training, không đổi expected, tolerance, output lịch sử hoặc kết luận thiếu metadata/checkpoint/predictions gốc.
- Chưa xác định nguyên nhân HTTP timeout/502 cũ; không có log lịch sử đủ để kết luận. Phép thử mới có giới hạn không bảo đảm availability mọi thời điểm.
- WebKit chụp nhiều document trên một page có trường hợp chờ font vô hạn; fresh-page workaround đã được kiểm chứng, nguyên nhân engine/utility-world sâu hơn chưa xác định.
- Chưa có Safari/macOS, iOS/Android thiết bị thật; không có full screen-reader audit. Reduced transparency/increased contrast được giả lập bằng Chromium CDP. Chưa kiểm chứng browser toolbar zoom/OS Dynamic Type; CSS text-size 200% đã kiểm tra.
- Không đưa ra điểm Lighthouse hoặc tuyên bố Core Web Vitals thực địa từ phép đo CLS trong lab.
