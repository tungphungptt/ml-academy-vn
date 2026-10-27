# ML Academy VN

Nền tảng học Machine Learning và Deep Learning bằng tiếng Việt: **59 bài học, 133 câu quiz, 13 lab và 27 notebook**. Có công thức KaTeX, playground thuật toán, Code Lab Python, tìm kiếm, tiến độ, bookmark/ghi chú và quản trị nội dung. Quiz được chấm phía server; tài khoản dùng mật khẩu băm và session cookie httpOnly.

## Công nghệ và cấu trúc

Next.js 16 / React 19 / TypeScript strict; Prisma **5.20.0** với SQLite; Markdown + KaTeX; Pyodide trong Web Worker cho lab tương thích trình duyệt. Lab PyTorch chạy CPU bên ngoài trình duyệt.

| Đường dẫn | Nội dung |
| --- | --- |
| `src/app`, `src/components`, `src/lib` | Website, API và logic ứng dụng |
| `content` | Catalog, bài học, quiz, lab và nguồn tham khảo |
| `labs`, `public/notebooks` | Python và notebook có thể tải về |
| `prisma` | Schema, migration có phiên bản, seed chỉ thêm dữ liệu thiếu |
| `scripts`, `tests`, `e2e` | Setup, kiểm tra nội dung, unit/integration và browser tests |
| `docs` | Audit curriculum, math, UI và hướng dẫn vận hành |

## Yêu cầu

- **Node.js 24 LTS** (`>=24.0.0 <25`); môi trường kiểm thử dùng **24.19.0, npm 11.9.0**. Giữ `package-lock.json`, dùng `npm ci`.
- Git; PowerShell trên Windows hoặc shell tương đương. Chạy lệnh từ thư mục repository trên ổ đĩa local, không từ `C:\` hoặc thư mục đồng bộ mạng.
- Kết nối HTTPS để cài dependency/Prisma engines; Code Lab cần CDN khi tải Python lần đầu.
- Docker Engine + Compose plugin nếu chạy container. Python 3 chỉ cần cho kiểm tra nội dung/lab ngoài browser; xem [thực hành curriculum](docs/curriculum-practice.md).

## Cài đặt lần đầu — PowerShell

```powershell
git clone https://github.com/tungphungptt/ml-academy-vn.git
Set-Location ml-academy-vn
Copy-Item .env.example .env
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Dán chuỗi ngẫu nhiên vừa tạo vào `SESSION_SECRET` trong `.env`; đặt `COOKIE_SECURE="false"` cho HTTP local. Không đưa secret vào lịch sử Git hoặc chia sẻ output. Giữ `DATABASE_URL="file:./dev.db"` để dùng `prisma/dev.db`. Không chạy `Copy-Item` lại khi đã có `.env`.

```powershell
npm run setup
```

`setup` cài từ lockfile, tạo Prisma Client và khởi tạo **database trống** bằng migration + seed. Database đã tồn tại không được tự seed/migrate. Script từ chối schema cũ, migration chưa áp dụng hoặc bootstrap dang dở; xem [runbook](docs/self-hosted-deployment.md). Không có admin hay mật khẩu mặc định. Đăng ký tài khoản qua `/register`; chỉ tạo admin bằng seed thủ công với hai biến tùy chọn sau khi đọc runbook.

## Development local

```powershell
npm run local
```

Lệnh hỗ trợ setup local và chạy **Next dev**; `npm run dev -- --hostname 127.0.0.1` chỉ chạy dev server nếu đã setup. `local` giữ hành vi dev hiện có, có thể lắng nghe ngoài loopback; dùng lệnh `dev` có hostname ở trên nếu chỉ muốn loopback. Development không phải production.

## Production local — một lệnh

Sau cài đặt lần đầu và khởi tạo database:

```powershell
npm run deploy:local
```

Lệnh kiểm tra Node, dependency, Prisma Client, cấu hình, lịch sử database và port; chạy `npm run build`, **chỉ khi thành công** mới chạy `npm run start -- --hostname 127.0.0.1 --port 3000`. Mở **http://127.0.0.1:3000**. Log ở foreground; **Ctrl+C** để dừng. Không seed, reset, migrate, tạo admin hoặc tự mở dịch vụ ra Internet. Nếu port bị chiếm, dừng tiến trình đang dùng hoặc đặt `$env:PORT="3001"` rồi chạy lại. Lệnh này dành cho máy local; vận hành VPS là quy trình riêng.

## Biến môi trường

`.env` được Git/Docker ignore. Biến đã được đặt trong process ưu tiên hơn `.env`.

| Biến | Ý nghĩa |
| --- | --- |
| `DATABASE_URL` | Prisma SQLite URL. `file:./dev.db` tính từ thư mục `prisma`; có thể dùng `file:C:/path/app.db` trên Windows hoặc `file:/srv/ml-academy/data/app.db` trên Linux. Không dùng DB production để test. |
| `SESSION_SECRET` | Bắt buộc, ngẫu nhiên ít nhất 32 ký tự; giữ ổn định qua restart. |
| `COOKIE_SECURE` | `false` cho HTTP local; `true` sau HTTPS. `deploy:local` từ chối `true` để tránh mất session trên HTTP. |
| `PORT` | Local mặc định 3000. Compose dùng làm port host, bên trong container luôn 3000. |
| `LESSON_CONTENT_DIR` | Thư mục Markdown admin sửa, mặc định `.local/lesson-overrides`; phải backup cùng SQLite. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Tùy chọn cho **seed thủ công** tạo admin mới; cần cả hai, mật khẩu riêng ít nhất 12 ký tự. Không thay role/password tài khoản đã tồn tại. Bỏ khỏi cấu hình sau khi tạo. |
| `DOCKER_DATABASE_URL`, `DOCKER_LESSON_CONTENT_DIR` | Chỉ Compose: mặc định `file:/data/app.db`, `/data/lesson-overrides`. Nếu đổi, phải đặt trong volume bền vững và di trú có backup, không chỉ đổi đường dẫn. |

## Kiểm thử

```powershell
npm run verify
npx --no-install prisma validate
npx --no-install prisma generate
npm run build
npm audit
python scripts/check_content.py
python scripts/audit_spec.py
```

`verify` chạy route typegen, TypeScript strict và unit/integration tests, gồm math rendering và seed/persistence trên DB tạm riêng. `build` chỉ build, không khởi động server. Xem [kết quả kiểm chứng hiện tại](docs/deployment-validation.md).

Browser tests có ghi dữ liệu và thử đổi trạng thái publication: **chỉ dùng DB tạm riêng**. Xem [hướng dẫn E2E cô lập](docs/self-hosted-deployment.md#browser-tests-tren-database-rieng); không trỏ chúng vào database cá nhân/production. Cài browser bằng `npx playwright install chromium`, rồi chạy `npm run e2e` khi fixture server đã khỏe mạnh.

## Docker local

Cài Docker Desktop trên Windows; tạo `.env` với secret và `COOKIE_SECURE="false"`, sau đó:

```powershell
docker compose up --build -d
docker compose logs -f web
# Dừng, giữ volume/database:
docker compose down
```

Truy cập http://127.0.0.1:3000. Named volume `mldata` lưu SQLite và lesson overrides dưới `/data`; nội dung gốc `/app/content` vẫn thuộc image. **Không dùng `down -v`** nếu cần giữ dữ liệu. Đừng đổi tên Compose project/volume mà không di trú: volume mới sẽ là dữ liệu trống. Backup trước cập nhật image; [runbook](docs/self-hosted-deployment.md) mô tả migration có kiểm soát và khôi phục.

## Troubleshooting

- **npm / `EALLOWSCRIPTS`:** dùng Node 24, kiểm tra `npm --version`, `npm config get allow-scripts`, `npm config get strict-allow-scripts` và lỗi thực tế. npm 11.9.0 trong môi trường kiểm thử không tái hiện lỗi này. Lockfile có install scripts cho `prisma`, `@prisma/client`, `@prisma/engines`, `esbuild`, và `fsevents` tùy chọn trên macOS. Nếu npm/organization của bạn áp allowlist, chỉ duyệt package/version đã kiểm tra theo cú pháp của phiên bản npm đó; không dùng `ignore-scripts`, không cho phép wildcard và không tắt chính sách toàn cục. Không sửa lockfile tùy tiện để ép cài đặt.
- **Prisma HTTP 403/DNS/chứng chỉ:** kiểm tra proxy/firewall tới registry và `binaries.prisma.sh`. Dùng CA tin cậy do đơn vị quản lý cung cấp khi cần; không tắt TLS hoặc kiểm tra checksum, không tải engines từ nguồn lạ. `prisma` và client phải cùng **5.20.0**; chạy lại `npm run setup` sau khi mạng được sửa.
- **DB thiếu/bất đồng schema:** kiểm tra `DATABASE_URL` và đường dẫn thực; backup trước mọi thao tác. `db:initialize` chỉ bootstrap DB trống. Không chạy `db push`, reset hoặc xóa DB để chữa lỗi. Xem runbook cho DB legacy/pending bootstrap.
- **Watchpack EPERM / quét thư mục hệ thống:** chuyển repo về thư mục user có quyền ghi, `Set-Location` đúng repo; dừng dev server khác và tránh ổ mạng. Không chạy Node với quyền Administrator chỉ để che lỗi quyền truy cập.
- **Port đang dùng:** dừng server cũ bằng Ctrl+C hoặc đặt `$env:PORT="3001"` cho `deploy:local`; không tự kill tiến trình khác.
- **Build lỗi TypeScript/thiếu dependency:** `npm run verify`, kiểm tra log đầu tiên; dùng `npm ci`/`npm run setup` đúng Node. Không bỏ strict mode/test để ép build. Nếu đăng nhập local không giữ session, kiểm tra `COOKIE_SECURE=false`.

## Máy chủ riêng sau này

Chưa có VPS/domain nào được cấu hình. [Self-hosted deployment](docs/self-hosted-deployment.md) hướng dẫn Linux, Node/Docker, DNS, HTTPS/reverse proxy, backup/restore, storage, migration và rollback. Chỉ mở ứng dụng qua HTTPS, không expose SQLite, giữ secrets ngoài Git/image và chỉ chạy một instance ghi SQLite. Cần kiểm thử riêng firewall, TLS, dung lượng và khôi phục trên máy chủ thật trước public.
