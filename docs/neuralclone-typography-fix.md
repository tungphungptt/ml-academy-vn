# NeuralClone: điều tra và sửa typography tiếng Việt

> **Apple Design, lượt tiếp nối 28/10:** ứng dụng hiện ưu tiên system font đã kiểm chứng NFC/NFD; giữ nguyên WOFF2 đầy đủ làm fallback, không quay về subsetting thiếu dấu. Kết quả và ảnh mới ở [báo cáo Apple redesign](neuralclone-apple-redesign.md). Những kết quả Be Vietnam Pro bên dưới mô tả đúng các phiên bản trước, không phải phép đo font hiện tại.

> **Bổ sung cross-browser 28/10:** Firefox 157.0 và Playwright WebKit 27.2 chạy thực trên Windows, cả dark/light và 375/768/1440/1920px. Mỗi engine kiểm tra 384 specimen NFC/NFD cùng WOFF2/CSS hiện tại, quiz NFD và screenshot; đã mở cặp ảnh NFC/NFD trực tiếp. Không đổi font hoặc bỏ dấu. Xem [báo cáo cross-browser](neuralclone-cross-browser-review.md). Không gọi WebKit Windows/emulation là Safari/iOS; không tuyên bố có CDP per-glyph font inspection trên Firefox/WebKit.

> Kiểm chứng tiếp ngày **28/10/2026**: giữ nguyên bộ font đã sửa. Lượt E2E mới kiểm tra lại 384 specimen; thêm 40 lần kiểm tra actual platform font trên heading, prose, câu hỏi, lựa chọn và nút quiz ở 4 viewport × 2 theme sau khi chuyển DOM text sang NFD. Không có font hệ thống xen trong các vùng này. Kết quả và phạm vi thiết bị của lượt mới nằm trong [final polish](neuralclone-final-polish.md); các số liệu/ảnh ngày 27/10 bên dưới vẫn là baseline lịch sử.

Ngày kiểm tra: **27/10/2026**. Tiếp tục trên working tree hiện có, giữ redesign và các thay đổi chưa commit. Chrome headless trên Windows; kiểm tra localhost:3000 và neuralclone.site thực tế. Không thay đổi DNS, tunnel hoặc triển khai bên ngoài.

## Nguyên nhân đã xác minh

Không dùng việc `document.fonts.ready` thành công để kết luận đúng glyph. Chrome DevTools Protocol `CSS.getPlatformFontsForNode` cho biết font thực sự vẽ từng heading. Trước sửa, câu “Bắt đầu từ điều bạn tò mò.” trên cả local/live là **NFC**, dùng **Be Vietnam Pro SemiBold**, không có font serif được tái hiện ở phiên đang chạy. Không có bằng chứng để gán lỗi hiện tại cho một serif cũ. DOM không chia câu này thành span từng ký tự; không phát hiện khoảng trắng chèn vào giữa từ trong chuỗi gốc.

Tuy nhiên, thử cùng tám câu bằng **NFD** tái hiện lỗi font hỗn hợp: Be Vietnam Pro xen **Segoe UI Semibold** trong cùng phần tử. Bộ font Google chia subset và các `unicode-range` trước đó không bao phủ đầy đủ dấu kết hợp cần cho những chuỗi thử nghiệm. `font-family` computed vẫn báo Be Vietnam Pro dù glyph đã fallback. Trong 384 mẫu (8 câu × NFC/NFD × 24/36/64px × 4 viewport × 2 theme), **144 mẫu trước sửa có glyph fallback**. Đây là lỗi thực sự mà kiểm tra tải font/geometry trước đây bỏ sót.

Một yếu tố độc lập làm heading NFC trông chật là tracking: hero `-0.065em` (−4,68px ở 72px), section `-0.04em` (−1,216px ở 30,4px). Dấu tiếng Việt càng khó đọc khi khoảng cách nén mạnh. Dữ liệu gốc không bị sửa bằng cách bỏ dấu hay chèn khoảng trắng.

## Cách sửa

- `src/app/fonts.css`: bốn face normal, weight 400/500/600/700, mỗi face chứa bộ glyph đầy đủ; bỏ subsetting và `unicode-range`. Vẫn `font-display: swap` và fallback hệ thống khi font chưa tải.
- `public/fonts/be-vietnam-pro-full-{400,500,600,700}-v2.woff2`: tạo từ TTF chính thức của Google Fonts, giữ bảng GPOS/GSUB. Mỗi file có 459 glyph; không thiếu codepoint nào trong tám câu NFC/NFD. Tổng bốn file **149.712 byte**, không phải toàn bộ đều preload.
- `src/app/layout.tsx`: chỉ preload full 400 và 600. URL có hậu tố `v2` để trang mới không dùng nhầm subset trong cache cũ. Giữ các file subset cũ để trang đã cache vẫn tải được tài nguyên.
- `src/app/globals.css`: hero `-0.025em`, h1 `-0.02em`, h2/section `-0.015em`; giữ kích thước heading. Bật kerning/ligatures bình thường, word-spacing bình thường. Không dùng variation setting hoặc text transform để vá glyph.
- `src/lib/normalizeProse.ts`, `MarkdownContent`, `PageHeading`, `SectionHeading`: chuẩn hóa prose sang NFC lúc render. **Không thay database, code literal, công thức, raw HTML hay xóa dấu.** Bộ font đầy đủ vẫn phải render được NFD trực tiếp; normalization không che một font thiếu glyph.
- `scripts/build-brand-fonts.py` và wrapper `scripts/prepare-brand-fonts.mjs`: quy trình tái tạo kiểm tra cmap và shaping tables, không quay lại pipeline subset lỗi. FontTools chỉ là công cụ phát triển trong `.local/font-tools`, không thêm dependency frontend. Giấy phép OFL giữ trong `public/fonts`.

## Bằng chứng trước/sau cùng điều kiện

Các ảnh là screenshot trình duyệt, không phải ảnh mockup. Có cả theme light/dark và chiều rộng **375, 768, 1440, 1920px**. Các specimen trước/sau giữ cùng font-size, chuỗi và tracking `-0.04em` để cô lập ảnh hưởng bộ glyph; heading thật dùng tracking đã sửa.

| Điều kiện | Trước | Sau |
| --- | --- | --- |
| Câu được báo lỗi, dark/1440 | [Heading trước](screenshots/typography-before/heading-dark-1440.png) | [Heading sau](screenshots/typography-after/heading-dark-1440.png) |
| Câu được báo lỗi, light/375 | [Heading trước](screenshots/typography-before/heading-light-375.png) | [Heading sau](screenshots/typography-after/heading-light-375.png) |
| Toàn bộ câu NFC/NFD, dark/1440 | [Specimen trước](screenshots/typography-before/specimen-dark-1440.png) | [Specimen sau](screenshots/typography-after/specimen-dark-1440.png) |
| Trang chủ, dark/375 | [Trang trước](screenshots/typography-before/home-dark-375.png) | [Trang sau](screenshots/typography-after/home-dark-375.png) |
| Website công khai/1440 | [Live trước](screenshots/typography-before/live-1440.png) | [Live sau](screenshots/typography-after/live-1440.png) |

[Dữ liệu DOM/font trước](neuralclone-typography-before.json), [sau](neuralclone-typography-after.json), [coverage từng file font](neuralclone-font-coverage.json). Các cặp khác nằm cùng hai thư mục screenshot.

Kiểm tra cmap bổ sung xác nhận **144 tổ hợp nguyên âm/dấu thanh viết hoa và thường**, ASCII, Đ/đ ở cả NFC/NFD trong đủ bốn weight, giữ GPOS/GSUB: [kết quả alphabet](neuralclone-font-alphabet.json). Đây là kiểm tra file font; không gộp thành các ca browser đã chạy. Font builder cũng kiểm tra tập ký tự mở rộng này trước khi ghi WOFF2.

Sau sửa: **0/384 mẫu dùng font fallback**, không overflow; kiểm tra E2E đo bằng DOM Range cho NFC/NFD cùng chuỗi có chênh lệch chiều rộng không quá 0,1px. Đã mở ảnh heading desktop/mobile để xem trực tiếp khoảng cách và dấu. Các ảnh bài học mới cũng được xem trực tiếp, gồm heading dài và sơ đồ; không chỉ dựa trên test pass.

## Regression và cách chạy lại

`tests/typography.test.tsx` kiểm tra NFC cho prose và giữ nguyên code NFD. `e2e/typography.spec.ts` kiểm tra 384 mẫu bằng actual platform font, độ rộng NFC/NFD và overflow. `scripts/audit-typography.mjs --after` tạo ảnh/JSON local và live. `scripts/audit-content-visuals.mjs` kiểm tra heading của tám bài mới trong 64 điều kiện trang/theme/viewport; không có heading fallback, KaTeX error hoặc overflow.

```powershell
npm run verify
$env:PLAYWRIGHT_CHANNEL='chrome'
npm run e2e
node scripts/audit-typography.mjs --after
node scripts/audit-content-visuals.mjs
```

Tái tạo font khi cần: cài `fonttools[woff]` trong virtualenv phát triển rồi chạy wrapper với `FONTTOOLS_PYTHON` trỏ đúng interpreter; wrapper tự nhận `.local/font-tools/Scripts/python.exe` nếu có. Không cần FontTools khi chạy/build website từ các WOFF2 đã có.

## Giới hạn

Đã kiểm tra Chromium/Chrome Windows và viewport mô phỏng; chưa kiểm tra Safari/iOS/Android trên thiết bị thật. Không tái hiện được trạng thái serif cũ, cache hoặc extension cụ thể trên máy người dùng. Vì vậy không tuyên bố mọi môi trường đã được kiểm chứng. Hard reload để tải HTML/CSS mới nếu tab còn giữ bản cũ. Font fallback tạm thời trước khi tải xong vẫn có thể xảy ra theo `swap`; điều đã kiểm tra là không còn fallback glyph xen trong từ sau khi font sẵn sàng.
