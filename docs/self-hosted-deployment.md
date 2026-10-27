# Vận hành ML Academy trên máy chủ riêng

Tài liệu chuẩn bị cho tương lai; không cấp phát VPS, thay DNS hay triển khai từ môi trường kiểm thử. Bằng chứng đã chạy local được ghi riêng tại [deployment validation](deployment-validation.md); các lệnh trên VPS, chứng chỉ, firewall, systemd và DNS dưới đây cần được kiểm chứng trên máy chủ thật.

## 1. Chuẩn bị Linux và dữ liệu

Dùng Linux được hỗ trợ, user dịch vụ riêng không có quyền root, Node.js **24 LTS** hoặc Docker Engine + Compose. Cài CA/openssl, Git và công cụ backup SQLite. Checkout một release SHA đã review, chạy `npm ci` (bao gồm build dependencies); không lấy `main` đang thay đổi trong lúc vận hành. Không bật npm lifecycle scripts một cách toàn cục nếu chính sách tổ chức đang chặn chúng.

Chỉ một instance ghi SQLite; không đặt file trên network filesystem và không scale nhiều máy cùng ghi. Chuẩn bị thư mục dữ liệu nằm ngoài release, ví dụ `/srv/ml-academy/data` thuộc user dịch vụ, quyền thư mục 0700. Các ví dụ đường dẫn/domain là chỗ thay thế, không phải tài nguyên đã có.

Cấu hình ngoài Git/image, file chỉ user dịch vụ đọc được:

```dotenv
DATABASE_URL=file:/srv/ml-academy/data/app.db
LESSON_CONTENT_DIR=/srv/ml-academy/data/lesson-overrides
SESSION_SECRET=<replace-with-random-value-at-least-32-characters>
COOKIE_SECURE=true
PORT=3000
```

Tạo secret bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`, truyền qua secret manager/file bảo vệ, giữ ổn định. Không dùng nguyên placeholder. `COOKIE_SECURE=true` khi public HTTPS; loopback HTTP test dùng `false`. Không có biến public origin bắt buộc trong ứng dụng; proxy phải giữ đúng Host và chặn truy cập trực tiếp backend. API từ chối write có Origin khác Host.

## 2. Database và nội dung sửa

Prisma/client pin **5.20.0**, `file:` URL tương đối được tính từ `prisma/`. Native Windows dùng dạng `file:C:/path/app.db`; Linux dùng `file:/absolute/path/app.db`. Lệnh `db:initialize`/container startup chỉ tạo schema và seed khi database **trống**. Với DB có dữ liệu, startup kiểm tra migration history rồi không ghi seed/migration.

```sh
npm ci
npx --no-install prisma validate
npx --no-install prisma generate
# CHỈ lần đầu, sau khi đã kiểm tra DATABASE_URL là vị trí mới/trống:
npm run db:initialize
npm run verify
npm run build
```

Seed thủ công `npm run db:seed` chỉ thêm mục còn thiếu, không ghi đè tài khoản, role/password, quiz hiện có, bài admin sửa hoặc tiến độ. Muốn nhập nội dung release mới vào DB cũ: backup, thử trên bản sao và review diff trước khi chạy seed thủ công. Không tự seed khi restart. Muốn admin mới, cung cấp BOTH `ADMIN_EMAIL`/`ADMIN_PASSWORD` qua môi trường cho lần seed thủ công, dùng mật khẩu riêng >=12 ký tự; seed không nâng quyền tài khoản email đã tồn tại. Gỡ hai biến sau đó; không đặt admin mặc định.

`LESSON_CONTENT_DIR` giữ Markdown admin sửa; nếu chưa đặt thì `.local/lesson-overrides` dưới cwd. **Phải đặt đường dẫn ngoài release** trên VPS. Nội dung bundled ở `content/lessons` chỉ fallback, không mount volume trống che `/app/content`. Bảo toàn cả SQLite **và** overrides. Import thư mục bài đã backup bằng `npm run content:import -- /absolute/path/to/backed-up/lessons`; importer từ chối conflict, không ghi đè overrides.

## 3. Node + systemd (mẫu cần kiểm chứng trên VPS)

Sau build, dùng start production hiện có. Ví dụ unit `/etc/systemd/system/ml-academy.service` (thay user/đường dẫn thực tế):

```ini
[Unit]
Description=ML Academy VN
After=network.target
[Service]
User=mlacademy
WorkingDirectory=/srv/ml-academy/current
EnvironmentFile=/etc/ml-academy/environment
Environment=NODE_ENV=production
ExecStartPre=/usr/bin/node scripts/prepare-db.mjs
ExecStart=/usr/bin/node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3000
Restart=on-failure
RestartSec=5
UMask=0077
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
```

`EnvironmentFile` dùng `KEY=value`, không có `export`; đường dẫn Node phải đối chiếu `command -v node` trên máy thật (không phụ thuộc nvm interactive shell). `ExecStartPre` dừng nếu cần migration/recovery, không tự migrate DB đang có dữ liệu. Admin bootstrap không nên nằm trong environment dịch vụ lâu dài. Dùng `systemctl` để start/stop và `journalctl -u ml-academy -f` xem log; phân quyền sudo riêng. Lệnh `npm run deploy:local` chỉ phục vụ máy local, không thay systemd.

## 4. Docker (cấu hình chung, dữ liệu không đổi chỗ tùy tiện)

`Dockerfile` build production, CMD `scripts/docker-entry.sh` kiểm tra DB và start Next, `/api/health` kiểm tra kết nối DB. `docker-compose.yml` mặc định bind **127.0.0.1:3000**, named volume `mldata:/data`. Cố định project name khi vận hành để không vô tình tạo volume mới:

```sh
docker compose -p mlacademy up --build -d
docker compose -p mlacademy logs -f web
docker compose -p mlacademy down
```

Compose dùng `DATABASE_URL=file:/data/app.db`, `LESSON_CONTENT_DIR=/data/lesson-overrides`. Host `PORT` đổi port host, container vẫn 3000. Có thể đổi qua `DOCKER_DATABASE_URL`/`DOCKER_LESSON_CONTENT_DIR`, nhưng đường dẫn đích phải nằm dưới volume đang mount hoặc volume bổ sung đã review; backup và chuyển dữ liệu lúc dừng ghi trước khi đổi. Đừng mount trống đè lên `/app/content` hoặc chạy `down -v`.

Nếu build qua proxy có CA riêng, dùng `HTTP_PROXY`/`HTTPS_PROXY` build args và BuildKit secret `extra_ca` trỏ tới CA tin cậy. Dockerfile chỉ dùng secret lúc npm/build, không nhúng secret vào image. Không tắt TLS/checksum. Build proxy/DNS là cấu hình máy chủ, cần kiểm tra riêng.

Container hiện dùng user mặc định của base image; hardening non-root, giới hạn tài nguyên, log rotation và tương thích quyền volume cần đánh giá trên máy thật. Không expose Docker socket hoặc backend ra Internet. Smoke runner `python3 scripts/smoke-container.py ml-academy-vn-local-check` chỉ tạo volume/container tạm riêng, kiểm tra auth/quiz/admin/persistence rồi dọn đúng tài nguyên của nó; không chạy nhầm với volume production.

## 5. DNS, reverse proxy và HTTPS (chưa triển khai)

Trỏ bản ghi A/AAAA của domain **do bạn sở hữu** tới VPS; chỉ publish IPv6 khi firewall/proxy đã hỗ trợ. Cho phép 80/443 và SSH hạn chế nguồn; giữ port backend 3000 ở loopback. Cấu hình TLS bằng Caddy hoặc nginx + ACME, kiểm tra renew; không ghi domain giả vào cấu hình đang chạy.

Mẫu nginx bên trong HTTPS server block sau khi đã có chứng chỉ:

```nginx
location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_buffering off;
}
```

Chỉ nhận Host domain đã cấu hình; redirect HTTP sang HTTPS. Kiểm tra cookie có Secure/HttpOnly/SameSite và Origin write validation qua proxy, đăng nhập/admin/progress/quiz ở HTTPS thật; không suy ra từ kết quả HTTP local. Không cache response có session. CSP hiện report-only; cần theo dõi rồi thử policy enforce riêng, không tuyên bố hardened đầy đủ.

## 6. Backup và phục hồi

Backup SQLite nhất quán bằng SQLite online backup API/`.backup`, không `cp` file đang ghi vì WAL có thể chưa checkpoint. Dừng ứng dụng khi cần snapshot đồng bộ với Markdown; backup overrides, cấu hình bí mật theo kênh mã hóa riêng và release SHA. Ví dụ **khi đã dừng mọi writer**, với `sqlite3` đã cài:

```sh
sqlite3 /srv/ml-academy/data/app.db ".backup '/secure-backup/app.db'"
# Sao lưu cả /srv/ml-academy/data/lesson-overrides, giữ quyền truy cập.
sqlite3 /secure-backup/app.db 'PRAGMA integrity_check;'
```

Tạo tên backup mới, giữ nhiều phiên bản và bản ngoài máy chủ; thư mục backup phải tồn tại và được bảo vệ. Với Docker, dùng container/tool hỗ trợ SQLite online backup trên cùng volume hoặc dừng service trước snapshot; không dựa vào một lệnh `docker cp` DB đang chạy. Khôi phục vào **thư mục/volume riêng**, đặt URL/overrides của bản sao, kiểm tra integrity, migration history, users/progress/quizzes, bài admin sửa và tìm kiếm. Không thử restore lên DB production trực tiếp. Định kỳ diễn tập khôi phục, kiểm tra quyền file và dung lượng; backup chưa thử restore chưa đủ bằng chứng.

## 7. Update, schema migration và rollback

1. Chốt release SHA, đọc diff/migration, kiểm tra verify/build, backup và khôi phục bản sao trước.
2. Chạy release mới trên bản sao DB + overrides với secret/port test riêng, xác minh auth, học, quiz, search, admin.
3. Pending migration khiến startup dừng. Chỉ operator chạy `npm run db:migrate` sau review SQL/maintenance/backup; không `db push`, reset hay data-loss flags. Nếu migration thất bại, dùng quy trình recovery Prisma đã review, không tự đánh dấu thành công.
4. Với DB legacy chưa có migration history: **không** áp initial migration mù quáng. Trên bản sao riêng, so sánh `prisma migrate diff --from-url <copy-url> --to-schema-datamodel prisma/schema.prisma --exit-code`. Chỉ khi không khác biệt mới xem xét baseline `20261026000000_initial` bằng `migrate resolve --applied`, với `DATABASE_URL` trỏ **bản sao trên mọi lệnh**. Thiết kế chuyển dữ liệu riêng nếu khác biệt.
5. Bootstrap dang dở: đọc log, backup, kiểm tra không còn initializer. Pending marker cần recovery rõ ràng `npm run db:initialize -- --resume-bootstrap`; không xóa marker/lock tùy tiện.
6. Dừng writer, cập nhật release/image nhưng giữ đúng volume/đường dẫn và secret. Health `GET /api/health` phải 200 + `{"ok":true}`. Kiểm tra restart còn user/progress/overrides; health chỉ thử DB connection, không thay functional checks.
7. Rollback code chỉ an toàn khi tương thích schema hiện tại. Nếu schema đã đổi, theo kế hoạch rollback đã thử trên bản sao; có thể cần restore backup cả DB + overrides khi dừng writer, chấp nhận mất write sau mốc backup. Không tự chạy migration ngược phá dữ liệu.

<a id="browser-tests-tren-database-rieng"></a>

## Browser tests trên database riêng

Các E2E có ghi dữ liệu, kiểm tra quyền và ẩn khóa học tạm; chỉ chạy trên fixture. Ví dụ PowerShell (terminal thứ nhất, từ repository, sau setup), tạo **DB mới riêng**:

```powershell
$fixture = Join-Path ([IO.Path]::GetTempPath()) ("ml-curriculum-e2e-" + [guid]::NewGuid())
New-Item -ItemType Directory $fixture | Out-Null
$env:DATABASE_URL = "file:" + (($fixture -replace '\\','/') + "/app.db")
$env:LESSON_CONTENT_DIR = Join-Path $fixture "overrides"
$env:SESSION_SECRET = node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
$env:ADMIN_EMAIL = ""
$env:ADMIN_PASSWORD = ""
$env:COOKIE_SECURE = "false"
$env:PORT = "3286"
npm run db:initialize
npm run deploy:local
```

Terminal thứ hai cần cùng `DATABASE_URL`/`LESSON_CONTENT_DIR` của fixture (không phải `.env` cá nhân) và `$env:E2E_BASE_URL="http://127.0.0.1:3286"`. Trên Windows native, chỉ chạy nhóm không ghi DB: `npx --no-install playwright test e2e/ui.spec.ts -g "all main screens|keyboard navigation|lab editing|PCA projection"`. Bộ đầy đủ `npm run e2e` hiện có guard test ghi DB yêu cầu đường dẫn Linux `/tmp/ml-curriculum-e2e-*`; chạy trên Linux/WSL với fixture mới dưới `/tmp`, không bỏ guard để dùng DB người dùng. Các bước shell Linux tương ứng là `export DATABASE_URL="file:/tmp/ml-curriculum-e2e-<unique>/app.db"`, `export LESSON_CONTENT_DIR="/tmp/ml-curriculum-e2e-<unique>/overrides"`, cấu hình secret/COOKIE_SECURE/PORT cho fixture, `npm run db:initialize`, `npm run deploy:local`, rồi terminal thứ hai cùng fixture chạy `E2E_BASE_URL=http://127.0.0.1:3286 npm run e2e`. Thay `<unique>` bằng thư mục mới có thật do bạn tạo; không dùng lại DB cá nhân. Cài Chromium bằng `npx playwright install chromium` hoặc chỉ định `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` cho browser tương thích đã cài. Xác minh health trước, để test không fallback khởi động dev server với DB khác. Sau test, Ctrl+C fixture server; xóa biến môi trường trong shell khi trở lại DB cá nhân. Những tài khoản test không bao giờ được seed vào production.
