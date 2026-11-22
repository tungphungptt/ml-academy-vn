# NeuralClone — Firefox, WebKit và điều tra Transfer

Ngày thực hiện: 28/10/2026. Đây là lượt tiếp nối `neuralclone-final-polish.md`; các số liệu trong báo cáo cũ vẫn là baseline. Không clone/sync/push, không đổi redesign, dữ liệu học tập, cổng 3000, domain hoặc cấu hình tunnel.

## Môi trường và phạm vi

- Windows 11 build 26300; Node 24.19.0; Playwright 1.64.1.
- **Firefox 157.0**, revision 1555; **Playwright WebKit 27.2**, build 2370. Đã cài và khởi chạy engine thật trong `.local/ms-playwright`, không chỉ đổi user-agent.
- Đối chứng Chrome 156.0.8078.49. Cả ba chạy headless trên Windows. [Bằng chứng khởi chạy](neuralclone-cross-browser-environment.json).
- Responsive 375/768/1440/1920px, dark/light. Firefox là desktop engine đổi viewport. Một số lượt public WebKit 375px có `isMobile`, touch và device-scale emulation; **không phải Safari/iPhone/iOS thật**. Chưa có thiết bị Android thật hoặc full screen-reader audit.
- Các kiểm thử ghi tài khoản/điểm/tiến độ dùng SQLite fixture riêng và production build loopback **3100**. Không chạy đăng ký/quiz ghi dữ liệu trên server thật 3000. Backup DB thật: `.local/cross-review-start/before.db` bằng `VACUUM INTO` trước thao tác; snapshot working tree/Git được giữ cùng thư mục.

## Lỗi tái hiện và bản sửa

| Mục | Tái hiện | Nguyên nhân và cách sửa |
| --- | --- | --- |
| WebKit CSP | Console báo report-only không có `report-to`, policy không có tác dụng theo cách engine xử lý. | `next.config.js`: chuyển sang **CSP thực thi**, kiểm tra header và chạy lại ứng dụng/Pyodide dưới policy. Không tắt log hoặc bỏ CSP. |
| Firefox/WebKit trên domain | Beacon Cloudflare được hạ tầng hiện có chèn vào vi phạm `script-src`; policy cũ chỉ cho self/jsDelivr. | Cho đúng `static.cloudflareinsights.com` ở script-src và `cloudflareinsights.com` ở connect-src, theo [tài liệu Cloudflare](https://developers.cloudflare.com/fundamentals/reference/policies-compliances/content-security-policies/). Không đổi analytics/tunnel/DNS, không thêm wildcard. Giữ hạn chế eval theo dev/production và các directive còn lại. |
| Pyodide tải lạnh, rõ nhất Firefox | Lần tải scikit-learn hết 90 giây; worker bị terminate khi wheel vẫn tải, gây `NS_BINDING_ABORTED`, chưa có output Python. | Worker phát phase tải runtime/tải package/chạy; `CodeLab.tsx` dành 5 phút cho tải, **90 giây chạy mã chỉ bắt đầu khi môi trường sẵn sàng**. Stop dùng được mọi phase; dependency thiếu trả lỗi rõ trước khi chạy Python. Không tăng giới hạn chạy mã, không tắt CORS/TLS/integrity. |
| Quiz Firefox | Hai lượt `check()` thất bại: click đầu không ghi nhận đáp án, progress còn 0/3; DOM có lựa chọn trước khi hydration/xáo trộn hoàn tất. | `QuizForm.tsx` dùng seed `null`, disable fieldset SSR cho đến khi effect khởi tạo shuffle hoàn tất; cập nhật state chức năng. E2E giữ JavaScript ở cổng tải, xác nhận chưa thể trả lời, sau đó trả JS và kiểm tra click đầu/bàn phím được ghi nhận. Không thêm sleep để lờ lỗi. |
| Công thức dài trên mobile | Ảnh cận cảnh cho thấy công thức cần cuộn trong khung; span KaTeX chưa có tab stop nên WebKit không cung cấp đường bàn phím rõ ràng để xem phần ngoài khung. | `MarkdownContent.tsx` thêm tabIndex, role region và nhãn cuộn cho display math, giữ mọi style/MathML của KaTeX. Kiểm tra cả ba engine: focus → ArrowRight làm scrollLeft tăng, cuộn cuối và chụp ảnh. Không thu nhỏ chữ hoặc cho tràn cả trang. |

Bằng chứng trước sửa: [public console](neuralclone-cross-public-before.json), [kết quả engine ban đầu](neuralclone-cross-browser-results-before.json), [Firefox quiz](neuralclone-cross-firefox-learning-before.json), [Pyodide download đang bị ngắt](neuralclone-firefox-pyodide-before.json). Lượt tải lạnh đầu còn có một số `NS_ERROR_DOM_BAD_URI` không tái hiện trong debug tải trực tiếp; không kết luận các lỗi đó đều do timeout hoặc CORS. [Debug sau sửa](neuralclone-firefox-pyodide-diagnosis.json) ghi HTTP 200/CORS `*`, không failed request và output scikit-learn thật.

Hai vấn đề của **harness** cũng được sửa riêng: đăng nhập setup vượt quota IP sau khi thêm nhiều engine; và config nạp lại trong worker tạo session secret khác runner. Các bài font/hydration nay nhận session fixture có guard DB/loopback; secret E2E ngẫu nhiên được runner truyền nhất quán xuống worker. Luồng đăng ký/đăng nhập thật vẫn chạy trên từng engine. Không nới rate limit hoặc đổi cơ chế auth production. Cleanup route tải chậm đợi handler hoàn tất. Các lượt thất bại trước khi sửa harness được giữ riêng, không dùng số đó làm kết quả cuối.

## Kiểm chứng trong lượt này

| Lệnh / nhóm | Kết quả mới thực sự chạy |
| --- | --- |
| `npm run verify` | TypeScript đạt; **65/65 unit test** đạt. |
| Suite cross-browser đầy đủ | **12/12 đạt**, Firefox 4, WebKit 4, Chrome đối chứng 4; không skip/flaky. |
| Chạy lại visual sau sửa bàn phím math | **3/3 đạt**, một test mỗi engine; gồm 48 điều kiện trang + 384 specimen mỗi engine. |
| Regression Chrome mặc định | **29/29 đạt**, gồm sweep 67 bài, auth/security, quiz, notes/progress, lab, responsive/font. Đây là lượt mới, không chép số 29 từ báo cáo cũ. |
| Production build | `next build` thành công qua `scripts/e2e-server.mjs`, dùng `.next-e2e` và DB fixture; server production test chạy loopback 3100. |
| `check_pyodide.mjs` | **14/14** output khớp qua direct Chromium CDN, không proxy hoặc bỏ TLS. |
| Transfer | 5 process kiểm soát + CLI gốc + 1 notebook kernel mới chạy được; notebook **strict FAIL** được giữ. Không gọi đây là 7/7 notebook hoặc toàn bộ lab CPU vừa chạy lại. |
| Kiểm tra bổ sung | `tsc --noEmit --noUnusedLocals --noUnusedParameters` đạt; `next-env.d.ts` đã phục hồi đúng bytes bàn giao. Dự án không cấu hình lệnh ESLint riêng; không báo ESLint đã chạy. |

Đối chiếu DB thật với backup theo toàn bộ hàng từng bảng: không đổi dữ liệu; `PRAGMA quick_check` đạt. Vẫn 67 lesson, 157 question, 0 user/progress/attempt/note/bookmark. Không có thao tác seed/import/reset/migrate trên DB thật.

Kết quả cuối và lệnh chạy được tổng hợp trong [QA mới](neuralclone-cross-review-qa.json). [Kết quả Playwright](neuralclone-cross-browser-results.json) giữ assertion/engine/duration; [Pyodide 14 ví dụ](neuralclone-cross-pyodide.json) giữ stdout/expected và transport trực tiếp.

Sau suite đầy đủ 12 test, bổ sung kiểm tra bàn phím cho công thức từ phát hiện visual QA; chạy lại riêng ba test visual trên cả ba engine với production build mới. [Kết quả phần chạy thêm](neuralclone-cross-browser-visual-results.json) được giữ riêng, không cộng 3 lượt chạy lại thành 3 tính năng mới hoặc ghi đè kết quả suite đầy đủ. Nhóm 29 regression Chrome cũng có [kết quả mới riêng](neuralclone-cross-chrome-regression.json).

Phạm vi test mỗi engine gồm:

1. Chặn tạm chunk JS để kiểm tra SSR quiz/hydration; chọn bằng pointer rồi bàn phím.
2. Tìm calibration → bài học → đăng nhập/đăng ký quay lại `#quiz` → nộp 3/3 → hoàn thành → chạy threshold Python thật → đổi lab RAG/reload → chạy RAG → tiến độ persisted → học tiếp → logout/login quay lại quiz.
3. Sáu trang × tám theme/viewport = **48 điều kiện trang mỗi engine**: home đã đăng nhập, khóa học, LLM lesson/quiz, CPU guide/notebook link, lab RAG và Playground. Theme toggle thật; menu mobile Escape trả focus; không overflow toàn trang, KaTeX error hoặc ảnh thiếu alt/hỏng. Chụp riêng công thức và demo sau khi đúng component đã sẵn sàng, tránh chụp SSR demo hồi quy trước khi hash được đồng bộ.
4. Font fixture cùng origin dùng đúng `fonts.css`/WOFF2 repository: **384 mẫu NFC/NFD mỗi engine**, tám câu × ba cỡ chữ × hai normalization × tám điều kiện. Đối chiếu độ rộng Range, FontFaceSet, CSS và screenshot. Quiz cũng được kiểm tra NFD. Firefox/WebKit không có API CDP actual-platform-font tương đương Chromium; không suy ra đã đo per-glyph font bằng CDP trên hai engine này.
5. Chạy thật NumPy/scikit-learn; ValueError tiếng Việt, Reset, Stop vòng lặp; threshold 0/1, equality 0,35, bảng tám dự đoán, precision không xác định và hai cost bằng 0. Kiểm tra console, HTTP 5xx và request thất bại; request bị hủy do điều hướng/Stop được ghi riêng.

Ảnh đã mở trực quan gồm [Firefox mobile dark](screenshots/cross-browser/firefox/home-dark-375.png), [WebKit desktop light](screenshots/cross-browser/webkit/home-light-1440.png), [NFC](screenshots/cross-browser/webkit/font-detail-NFC-light-1440.png) / [NFD cùng điều kiện](screenshots/cross-browser/webkit/font-detail-NFD-light-1440.png), [SVG/demo WebKit mobile](screenshots/cross-browser/webkit/threshold-demo-light-375.png), [công thức](screenshots/cross-browser/firefox/formula-dark-375.png), quiz và ảnh cuộn công thức cuối khung trong thư mục tương ứng. Không đổi bộ font đã sửa ở lượt trước. Screenshot `quiz-mobile.png` là ảnh element dài nên sticky header có thể xuất hiện trong phần crop; không dùng vị trí header trong ảnh crop đó để kết luận layout của viewport.

## Local, public và HMR

[Probe sau sửa](neuralclone-cross-public.json): **16 lượt trang mỗi engine**, gồm localhost/domain × dark375/light1440 × home/LLM lesson/Code Lab/Playground. Không console error, failed request được ghi nhận hoặc WebSocket error. Firefox nhận 92 frame HMR, WebKit 126 frame trong lượt đó; trước sửa đã có frame nhưng còn CSP errors (8 và 26 console entries tương ứng). Đây là bằng chứng WebSocket nhận dữ liệu thực, không suy từ HTTP 200. Chưa chạy lại phép thay heading tạm của lượt trước nên không trình bày phép đó như vừa thực hiện.

Trên domain, mỗi engine chạy thêm threshold Code Lab thật ở cả hai điều kiện; output khớp `threshold=0.5 TP=2 FP=2 FN=1 cost=6`. Giữ server Next dev hiện có; Next tự nạp lại file cấu hình, không dừng server/tunnel hoặc chuyển sang production. Production build được dùng trong server test riêng, không gọi đó là kiểm thử triển khai production qua Cloudflare.

Sau bản sửa bàn phím công thức, [probe math riêng](neuralclone-cross-public-math.json) kiểm tra lại lesson local/domain trên Firefox/WebKit, dark375/light1440 (bốn trang mỗi engine), focus/ArrowRight/cuộn cuối. Kết quả này được giữ riêng với probe đầy đủ trước đó; không gộp hoặc đổi tên các số liệu lịch sử. Ở desktop rộng, công thức có thể vừa khung nên không yêu cầu scrollLeft tăng.

## Transfer: kết luận có giới hạn

[Điều tra chi tiết](neuralclone-transfer-investigation.md), [5 lần chạy và toàn bộ predictions/logits](neuralclone-transfer-investigation.json), [đối chiếu provenance](neuralclone-transfer-provenance.json).

- Source Transfer và CNN, sau chuẩn hóa **CRLF → LF**, khớp hash baseline và code notebook. Không phát hiện khác nội dung script; raw hash Windows khác do line ending.
- Ba process mặc định tạo checkpoint/data/split/logits/predictions giống nhau: **334/360** fine-tune, **330/360** frozen. Hai process tắt oneDNN vẫn 334/360 và **0 nhãn khác** so với default; logits/checkpoint thay đổi rất nhỏ. Chưa tái hiện 335/360 khi tắt oneDNN.
- Chạy CLI gốc không instrumentation và notebook kernel mới đều in **0,9278**. Notebook chạy được nhưng **strict comparison vẫn FAIL, exit 1**, vì lịch sử vẫn **0,9306**. Không sửa expected, notebook output lịch sử hoặc tolerance.
- Baseline 335/360 là suy ra từ số làm tròn/tập 360; không phải raw count lưu lịch sử. Chênh một mẫu đúng **không chứng minh chỉ một prediction đổi**. Không có vector/checkpoint baseline để join từng mẫu; thiếu Torch build/CPU/backend metadata lịch sử. Không kết luận Windows, Python patch version hoặc oneDNN là nguyên nhân duy nhất.
- Docker CLI có nhưng Linux daemon không hoạt động; không khởi động dịch vụ/cài subsystem Windows. Thiếu host baseline và artifact lịch sử là trở ngại cụ thể để truy nguyên tiếp. Đây là mục còn mở, không đánh dấu PASS.

## Chạy lại và rollback

[Manifest đầy đủ](neuralclone-cross-review-change-manifest.json) liệt kê file mới/sửa theo SHA-256 từ đầu lượt, bao gồm ảnh và JSON bằng chứng. Các file runtime chính: `next.config.js`, `public/pyodide-worker.js`, `CodeLab.tsx`, `QuizForm.tsx`, `MarkdownContent.tsx`. Bổ sung cấu hình/suite cross-browser, fixture session có guard, hai test worker, kiểm tra SSR quiz/math và script điều tra Transfer; không thêm dependency ứng dụng hoặc xóa file/dữ liệu. Nội dung Transfer/runbook chỉ được bổ sung bằng chứng và làm rõ giới hạn, không thay thuật toán hoặc output lịch sử.

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH="$PWD\.local\ms-playwright"
npx --no-install playwright install firefox webkit
npx --no-install playwright test --config playwright.cross-browser.config.ts
node scripts/check-cross-public.mjs
node scripts/check-cross-public.mjs --math-only
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run e2e
$env:PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH='C:\Program Files\Google\Chrome\Application\chrome.exe'
node scripts/check_pyodide.mjs --report docs/neuralclone-cross-pyodide.json
npm run verify
$env:PYTHONUTF8='1'
.local/polish-cpu/Scripts/python.exe -X utf8 scripts/investigate_transfer.py
.local/polish-cpu/Scripts/python.exe -X utf8 scripts/check_notebooks.py public/notebooks/transfer_cpu_library.ipynb --report docs/neuralclone-transfer-notebook-review.json
```

Lệnh notebook cuối được kỳ vọng tiếp tục trả **1 do strict mismatch** trong môi trường này. Không chạy seed/import trên DB thật. E2E tự build và dùng DB/cổng riêng; không chạy đồng thời hai suite chiếm 3100. Manifest mới được tính từ snapshot **working tree lúc bắt đầu lượt này**, giữ nguyên thay đổi chưa commit có trước.

Rollback policy chỉ cần hoàn nguyên những directive CSP thay trong lượt này ở `next.config.js` (header Report-Only và hai origin analytics), giữ `allowedDevOrigins` từ bản HMR trước. Hành động đó sẽ phục hồi policy cũ và các cảnh báo tương ứng; không cần thay đổi hạ tầng. Không có chuyển đổi dịch vụ vận hành nào cần rollback.
