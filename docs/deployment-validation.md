# Kiểm chứng local/self-hosted — 2026-10-27

**PASS trong phạm vi local đã kiểm chứng.**

Báo cáo pha chuẩn bị trước công bố Git. Phạm vi: tiếp tục working tree UI từ HEAD `c2a08ce965e62b4e9b5259d80add19d6fbedc83c`, branch `codex/expand-verify-ml-dl-curriculum`. Không reset/stash, commit, push, merge, truy cập DB production, cấp phát cloud hay thay DNS. Tài liệu này thay báo cáo triển khai nền tảng cũ; số liệu lịch sử curriculum/math vẫn nằm trong các audit tương ứng.

## Kết quả thực tế

Môi trường Linux, Node **24.19.0**, npm **11.9.0**, Prisma/client **5.20.0**, system Chromium. Dùng nhiều fixture SQLite riêng có tiền tố `/tmp/ml-curriculum-e2e-*`, không dùng `.env`/database cá nhân cho E2E.

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run setup` | PASS trên DB trống tạm: `npm ci` 152 packages, generate client, initial migration + seed. Lần đầu bị cache npm ở home chỉ đọc; retry với `npm_config_cache` trỏ `/tmp` thành công. |
| `npm run verify` | PASS: route typegen + TypeScript strict + **48/48** unit/integration, không skip. |
| `python3 scripts/check_content.py` | PASS: **59 bài**, 0 lỗi cấu trúc. |
| `python3 scripts/audit_spec.py` | PASS: **52/52** registry mappings; 0 partial/missing. |
| Prisma validate/generate | PASS bằng version pin, không bỏ checksum/TLS. |
| `prisma migrate status` | PASS trên fixture riêng: 1 migration, schema up to date. |
| `npm audit` | PASS: **0 vulnerabilities**, gồm dev dependencies. Không đổi dependency/lockfile. |
| `npm run deploy:local` | PASS: build thật bằng `npm run build`, sau đó `npm run start -- --hostname 127.0.0.1 --port 3000`; giữ foreground. |
| Startup + health | PASS: health **200 + `{"ok":true}`**, SHA256 DB trước/sau build/start giống nhau; không seed/migrate. Port bị chiếm từ chối trước build. SIGINT gửi tới process group dừng server. |
| Browser E2E | PASS **14/14**, 0 skipped/flaky/unexpected; [receipt](ui-browser-validation.json). |
| Numerical ML regressions | PASS **6/6** (`scripts/check_curriculum_math.py`, Python venv CPU riêng). |
| Pyodide browser/WASM | PASS **12/12** variants, stdout so với registry thật; code của lab không đổi sau kiểm tra này. Official CDN bytes qua Python TLS + CA của môi trường, không phải direct Chromium/CDN TLS test. |
| Docker build + container smoke | PASS image cuối `sha256:6edbd412489cafda9f104c27119c094c5c20e6e9cd65cceadbdc69c0c5f3fcc7`; smoke health/auth/admin/quiz/progress/notes/overlay, recreate giữ DB bytes và dữ liệu. Volume/container riêng đã dọn. |
| Secret/artifact/preservation/diff review | PASS: 70 file còn tồn tại + 2 file xóa đã review; không credential match/DB/log/cache mới, **200 file bảo vệ byte-identical**, `git diff --check` sạch; inventory tại UI review. |
| `docker compose config --quiet` | PASS; không tạo service/volume. Không in config chứa secrets ra log. |

## Phạm vi an toàn và thay đổi

- Xóa cấu hình và runbook nền tảng không còn dùng; README viết lại theo PowerShell + production local. Runbook [self-hosted](self-hosted-deployment.md) phân biệt bước local đã thử với VPS/HTTPS/DNS chưa triển khai.
- `scripts/deploy-local.mjs` không bootstrap, seed, reset hay migrate. Kiểm tra read-only DB/migration history, từ chối pending bootstrap và thiếu Prisma Client/cấu hình; chỉ gọi start sau build thành công. Dùng npm JS CLI qua Node, không `npm.cmd`/shell interpolation. Test lỗi build dùng executor fixture và xác nhận start không được gọi.
- Compose bind loopback, giữ nguyên named volume và vị trí mặc định `/data/app.db` + `/data/lesson-overrides`. Biến tùy chọn mới chỉ được Compose sử dụng. Không di chuyển dữ liệu hoặc mount lên `/app/content`.
- API, auth/session, Prisma schema/migrations/seed, nội dung, Python lab và notebook giữ nguyên; kiểm tra hashes và regression seed/persistence. UI dùng dữ liệu published DB và registry thật.
- Manifest `curriculum-changes.json` giữ một tên file runbook nền tảng cũ vì đó là inventory lịch sử audit; không phải liên kết/hướng dẫn triển khai. Các từ render/renderer trong code/test toán học là kết xuất giao diện, cần giữ.

## Giới hạn còn lại

- Chưa chạy trên Windows/PowerShell thật, Firefox, Safari hoặc thiết bị vật lý. Production local dùng API Node đa nền tảng, không câu lệnh shell Unix. Integration E2E ghi DB hiện guard đường dẫn Linux; dùng WSL/Linux, không bỏ guard.
- `EALLOWSCRIPTS` không tái hiện với npm 11.9.0: `allow-scripts`/`strict-allow-scripts` không cấu hình, `ignore-scripts=false`. Không sửa `.npmrc`, không mở rộng quyền lifecycle scripts. Nếu npm/organization khác áp allowlist, cần kiểm tra đúng package/version và cú pháp npm tại đó.
- Build còn cảnh báo Turbopack về dynamic filesystem tracing nội dung/overrides; full Docker image có nội dung đầy đủ, không dùng standalone trace. Không tắt warning/validation.
- Docker build trong cloud cần cache/config có quyền ghi, proxy/DNS và CA tin cậy dạng BuildKit secret. Không nhúng CA/private secret/proxy vào app source, không bỏ TLS/checksum. Kết quả không bảo đảm mọi mạng người dùng giống môi trường này.
- Không kiểm chứng VPS thật: systemd, firewall, reverse proxy, TLS/renewal, DNS, restore trên máy chủ, dung lượng và tải đồng thời. SQLite dùng một instance; CSP hiện report-only, container chưa hardened non-root. Phải đánh giá trước public.
- Không chạy lại toàn bộ 27 notebook kernel hoặc xác minh lại toàn bộ nguồn học thuật trong đợt UI/local này; byte nội dung/lab/notebook không đổi. Bằng chứng cũ và nguồn chưa truy cập vẫn được ghi trung thực trong các audit curriculum/math.

## Review trước commit/push

Theo ủy quyền công bố Git tiếp theo, đã fetch `origin`: `main` tiến tới merge commit `ddd08252a08f431c86cd27d4efda249a5912bab3` (PR #2), cây mã giống baseline `c2a08ce`. Branch làm việc được fast-forward, giữ nguyên toàn bộ 72 đường dẫn. Review lại source/diff/file mới không phát hiện lỗi cần sửa code.

Chạy lại `npm run verify` **48/48**, E2E **14/14** (không skip/flaky, gồm hai math-rendering E2E và matrix responsive), Prisma validate, content **59/59**, spec **52/52**, audit **0 advisory**, production build qua `npm run deploy:local`. Server thực tế bind **127.0.0.1:3000**, health **200**, DB SHA256 không đổi sau startup. Test dùng fixture mới riêng. Không chạy lại Pyodide/27 kernel/Docker build trong bước công bố vì code tương ứng không đổi so với kiểm chứng phía trên. CI/PR/merge cần xác minh riêng qua GitHub; kiểm thử local không được coi là CI đạt.
