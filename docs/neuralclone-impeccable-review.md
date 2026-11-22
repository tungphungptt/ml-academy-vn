# NeuralClone — Impeccable: chuẩn bị và trạng thái triển khai

Ngày 29/10/2026. **Chưa hoàn tất critique/audit hoặc sửa UI.** Đang chờ lựa chọn về hai sub-agent theo Codex gate trong reference của skill. Không báo điểm chất lượng khi chưa thực hiện đánh giá độc lập.

## Hiện trạng đã xác minh

CWD `D:\Projects\ml-academy-vn`; đã đọc Git status và giữ thay đổi chưa commit. Không tìm thấy AGENTS.md tại dự án hoặc hai thư mục cha. PRODUCT.md và DESIGN.md trước đó chưa tồn tại; đã tạo từ package.json, layout, tokens, CSS, cơ chế nội dung và báo cáo studio/content expansion. Không thay UI, font, dữ liệu hoặc hạ tầng trong bước chuẩn bị này.

Snapshot file/hash và Git status ở `.local/impeccable-start`; backup SQLite `before.db`. Script snapshot lần đầu sao lưu thành công rồi dừng vì thiếu bản copy Apple skill; đã bổ sung bản copy và hoàn thành metadata trước các chỉnh sửa dự án. Không ghi đè hoặc tạo lại database backup đó.

## Tài liệu đã đọc

Repository chính thức: https://github.com/pbakaus/impeccable. README và bản Codex `.agents/skills/impeccable/SKILL.md` (metadata version 4.8.0), các reference: `operate.md`, `typeset.md`, `critique.md`, `audit.md`, `layout.md`, `clarify.md`, `animate.md`, `harden.md`, `optimize.md`, `adapt.md`, `craft-floor.md`. Bản tham chiếu riêng tại `.local/impeccable-reference`; không cài hook hoặc thay cấu hình Codex/Windows. README được mở qua GitHub connector. Apple Design đã có bản đầy đủ từ đợt trước; đọc lại các nguyên tắc typography, feedback, interruption và reduced motion phù hợp.

Lệnh thực sự thử: `./.agents/skills/impeccable/scripts/impeccable.cmd context --target 'src/app/learn/[slug]/page.tsx'`. Kết quả: CommandNotFoundException vì launcher chưa được cài. `Test-Path` xác nhận không có skill/launcher tại đường dẫn dự án; `Get-Command impeccable` không trả lệnh. Chưa chạy detector/context thành công, overlay, live-server hoặc installer; không coi kiểm tra tự viết là kết quả detector Impeccable. Dùng fallback đọc code/context trực tiếp như SKILL.md hướng dẫn.

## Quyết định đã chốt từ yêu cầu và code

| Bề mặt | Mode | Áp dụng dự kiến | Bằng chứng cần trước sửa |
|---|---|---|---|
| Trang chủ | Persuade | Giữ font display, neural focal motion và bước bắt đầu thật | Ảnh mới desktop/mobile, CTA và trạng thái có/không tiến độ |
| Bài dài/thư viện | Read | Đánh giá measure, nhịp h2/đoạn/code, trọng lượng chữ; giữ đủ suy luận | Computed font/measure/spacing, ảnh cùng theme/width, chữ 200% |
| Quiz/lab/thí nghiệm | Operate | Nhãn sans, thông số cạnh kết quả, trạng thái và recovery rõ | Thao tác thật, keyboard, loading/error, đồng bộ số/hình/code |

Quyết định này là định hướng, không phải phát hiện critique đã chứng minh. Giữ Lora + Be Vietnam Pro, giấy ấm/xanh rừng, SVG hình học khoa học, KaTeX/code font riêng. Không thay font hoặc cấu trúc chỉ để xóa cảnh báo chung. Không cắt lý thuyết để làm vùng đọc ngắn hơn. Không thêm animation khi state trực tiếp đã giải thích rõ thay đổi.

Đã xác minh nguồn `.lesson` hiện 1rem/1.95; h2 Lora 1.6rem/1.5; h3 Be Vietnam Pro 1.0625rem/1.65. Chưa đo lại computed trong browser ở lượt này, nên chưa kết luận các giá trị đó gây lỗi. Các ảnh/test từ content expansion là baseline, không phải ảnh hoặc kết quả mới của Impeccable.

## Học liệu: bước độc lập đã làm

Đọc toàn bộ Markdown của `loss-functions`, `logistic-regression`, `activations`, đối chiếu phần liên quan trong tài liệu chính thức và ghi nghiên cứu trong `neuralclone-impeccable-source-notes.json`. Chưa sửa ba bài hoặc thêm minh họa; chưa đánh dấu kiểm toán/triển khai hoàn tất. Bốn bài của đợt trước giữ nguyên. Ma trận `neuralclone-remaining-content-progress.md/json` ghi đủ 63 bài còn lại, phân biệt 3 bài đã nghiên cứu sơ bộ với 60 bài chưa đọc sâu trong lượt này.

Khoảng trống ưu tiên để xác minh tiếp: BCE từ logits và bước tính trung gian; chính sách tie tại threshold và liên hệ gradient; miền alpha của biểu thức max trong Leaky ReLU, điểm không khả vi và giới hạn suy luận vanishing gradient. Chưa khẳng định mọi nội dung cũ sai; chỉ sửa sau khi có diễn giải, nguồn và kiểm chứng phù hợp.

## Điều kiện đang chờ

[Codex sub-agent gate](https://github.com/pbakaus/impeccable/blob/main/.agents/skills/impeccable/reference/critique.md) yêu cầu xin phép một lần khi có spawn_agent nhưng chưa được cho phép rõ ràng. Đã hỏi qua công cụ câu hỏi: cho phép hai agent độc lập, hoặc một agent với giới hạn được ghi rõ. Không suy ra chấp thuận từ thời gian chờ. Chưa spawn, chưa chạy Assessment A/B, chưa chấm heuristic/audit score. Sau lựa chọn sẽ tiếp tục critique trước detector, lưu phát hiện có vị trí/bằng chứng/ảnh hưởng/P0–P3, rồi mới sửa và chụp trước/sau.

## Kiểm thử và giới hạn

Lượt này mới kiểm tra filesystem/Git, nguồn tài liệu và tính hợp lệ của tài liệu/ma trận; chưa chạy build/unit/E2E hoặc kiểm tra browser. Không nhận các số 70 unit/6 browser/9 regression trước đó là vừa chạy. Chưa có ảnh trước/sau mới hoặc component UI được sửa. Không đổi dependency, database, port 3000, Next dev, domain, tunnel, CSP hoặc HMR.

Transfer strict FAIL 334/360 so với 335/360 vẫn giữ nguyên; nguyên nhân 502 lịch sử chưa xác định; Safari/iOS/Android trên thiết bị thật chưa kiểm tra.
