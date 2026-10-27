# UI/UX và production local — 2026-10-27

**PASS — local/UI review.** `verify` 48/48, E2E 14/14; [receipt thực tế](ui-browser-validation.json).

Tiếp tục từ working tree redesign hiện có, không làm lại nội dung, không reset/stash/commit/push. Baseline Git `c2a08ce965e62b4e9b5259d80add19d6fbedc83c`; đây là snapshot pha review trước công bố Git. [Runbook local/VPS](self-hosted-deployment.md), [kiểm thử vận hành](deployment-validation.md).

## Hệ thống giao diện

Giữ phong cách học thuật: nền giấy sáng / nền mực xanh tối, chữ xanh rừng, điểm nhấn đồng và lam. Headline serif hệ thống (Georgia/Times), body system sans, code monospace. Không tải font hoặc thêm dependency. Token ở một `:root` của `globals.css`; `color-scheme` + `light-dark()` hỗ trợ lựa chọn lưu trong localStorage và mặc định hệ thống.

`PageHeading`, `SectionHeading`, `CourseCard`, `EmptyState`, `Icon` dùng chung; icon SVG tự vẽ, có tên truy cập ở control. `HighlightedText` giữ dấu tiếng Việt, React escape nội dung, không chèn HTML. Navbar/footer có namespace riêng; TOC/breadcrumb/pager không bị style nav toàn cục. Reduced motion, focus-visible, skip link, forced-colors editor và print reader được xử lý riêng.

| Màn hình | Thay đổi |
| --- | --- |
| Trang chủ | Hero gọn trên mobile; số liệu từ DB published/registry thật, course card và bài gợi ý đã published. |
| Dashboard | Bài kế tiếp, số bài hoàn thành/thời gian/quiz thật; progress và empty state; ngày theo múi giờ Việt Nam. |
| Courses/detail | Lọc + sort, thứ tự card ổn định sau lọc; chương, thời lượng, lesson rows, trạng thái hoàn thành. |
| Lesson | Cột đọc 760px, TOC sticky desktop / disclosure mobile, metadata, focus mode, prerequisites, lab, quiz, notes, nguồn, pager. Công thức dài scroll trong surface riêng. |
| Quiz | Chọn đáp án, pending/disabled, network error giữ lựa chọn, retry; chấm thật qua API; đúng/sai bằng text/icon/border, lời giải chỉ sau nộp. Anchor cho cả người chưa đăng nhập. |
| Lab | Code/editor, actual output, expected output và hướng dẫn tách rõ; worker/Stop/timeout không đổi; CPU có hướng dẫn, không giả nút Run. |
| Search | Filter và highlight có dấu, snippet text an toàn; liên kết bài/quiz/lab/notebook theo registry/DB thật. |
| Hỗ trợ | Datasets, resources, projects, playground, auth/account/reset/admin, loading/error/404 cùng token/layout; error công khai không lộ exception nội bộ. |

## Sửa lỗi có bằng chứng

- Screenshot mobile trước vòng chỉnh cho thấy nút focus chạm metadata, hero cao và border input nhạt: chỉnh khoảng cách, chiều cao minh họa và control-border riêng. Kiểm tra lại ảnh thật và contrast tính từ CSS trong Chromium.
- Quiz anonymous trước đó không có `id=quiz`, nên deep link từ search không tới đích. Thêm section/heading/login notice; SSR regression xác nhận không đưa option vào trạng thái khóa, E2E bấm link thật.
- PCA khi chuyển palette có `stroke="var(--mut)6"` không hợp lệ, khiến 60 đường chiếu biến mất; chú giải PC2 còn ghi xanh lá trong khi trục đã lam. Test browser mới tái hiện FAIL trên build cũ; sửa stroke + opacity riêng và chú giải cùng màu trục, kiểm tra computed style ở cả hai theme.
- Không thay/xóa assertion baseline để đạt test. Hai selector trong test UI mới được sửa để scope alert vào quiz (tránh Next route announcer) và kiểm tra disabled trên radio thực tế (Playwright không nhận fieldset như control disabled).

## Browser và screenshot

Chromium thật ở **375, 390, 768, 1440px**, light/dark, reduced-motion. Matrix 17 màn hình × 8 cấu hình = **136 lượt**, thêm dashboard có dữ liệu × 8. Kiểm tra main h1, image alt, geometry controls, không document overflow, không KaTeX error, hydration/page errors và contrast mẫu. Không tuyên bố đây là chứng nhận WCAG toàn diện.

17 màn hình: home, courses, course detail, lesson, lab Pyodide, lab CPU, search có kết quả, search trống, projects, datasets, resources, playground, login, register, reset invalid, admin không quyền, 404. E2E có thao tác bàn phím/skip/menu Escape/TOC/focus; quiz mạng lỗi/pending/chấm thật; note/bookmark/progress sau reload, copy clipboard và dashboard từ DB. Test curriculum mở đủ **59 slug**; math E2E kiểm tra KaTeX visual + MathML và overflow trên 8 bài đại diện ở 2 viewport × 2 theme.

Đã mở xem thủ công ảnh homepage mobile/desktop, lesson desktop/mobile dark, courses mobile dark, lab desktop dark/mobile, search tablet, login tablet, dashboard mobile light/desktop dark, quiz mobile. Các ảnh khác trong matrix được kiểm tra bằng chương trình, không tuyên bố đã đọc thủ công từng ảnh.

Ảnh chọn lọc: [trước redesign](screenshots/ui-before-home-1440.png), [home desktop light](screenshots/ui-home-light-1440.png), [lesson mobile dark](screenshots/ui-lesson-dark-390.png), [dashboard mobile](screenshots/ui-dashboard-light-375.png), [lab desktop dark](screenshots/ui-lab-dark-1440.png), [PCA sau sửa](screenshots/ui-pca-dark-390.png), [quiz mobile](screenshots/ui-quiz-light-390.png). Không lưu browser cache, DB hay trace vào repository. Screenshot quiz thủ công chờ scroll kết thúc; screenshot tự động bắt giữa smooth-scroll không được dùng làm ảnh minh chứng cuối.

## Bảo toàn dữ liệu và giới hạn

Giữ **59 bài, 133 câu quiz, 13 lab, 27 notebook**; không đổi Markdown/quiz/registry/Python/notebook, schema/migration/seed/auth/API hoặc math parser. Seed/persistence test xác nhận admin edits, users/roles/passwords, progress, notes, quizzes, overlays và DB bytes. Chỉ test trên DB tạm riêng.

Production local và Docker được kiểm chứng trên Linux; chưa chạy Windows thật/Safari/Firefox/assistive technology. Chưa test thủ công toàn bộ admin CRUD ở mọi kích thước; quyền/API admin và persistence có container smoke. Pyodide cần CDN, kiểm tra trong proxy dùng bytes từ CDN chính thức qua TLS/CA tin cậy; không đại diện direct Chromium TLS trên mạng khác. Không triển khai VPS/domain hay dịch vụ cloud; xem các giới hạn vận hành trong deployment validation.

## Danh sách file cuối

72 đường dẫn: **51 sửa, 2 xóa, 19 tạo mới**. `M` sửa, `D` xóa, `??` tạo mới; snapshot trước stage/commit.

```text
 M .env.example
 M README.md
 M docker-compose.yml
 M docs/curriculum-audit.md
 M docs/curriculum-final-review.md
 M docs/deployment-validation.md
 M docs/math-rendering-audit.md
 D docs/render-deployment.md
 M package.json
 M playwright.config.ts
 D render.yaml
 M scripts/check_pyodide.mjs
 M scripts/smoke-container.py
 M src/app/account/page.tsx
 M src/app/admin/page.tsx
 M src/app/courses/[slug]/page.tsx
 M src/app/courses/page.tsx
 M src/app/datasets/page.tsx
 M src/app/error.tsx
 M src/app/globals.css
 M src/app/lab/page.tsx
 M src/app/layout.tsx
 M src/app/learn/[slug]/page.tsx
 M src/app/loading.tsx
 M src/app/not-found.tsx
 M src/app/page.tsx
 M src/app/playground/page.tsx
 M src/app/projects/page.tsx
 M src/app/reset/page.tsx
 M src/app/resources/page.tsx
 M src/app/search/page.tsx
 M src/components/AuthForm.tsx
 M src/components/BookmarkNotes.tsx
 M src/components/CodeBlock.tsx
 M src/components/Landing.tsx
 M src/components/LessonActions.tsx
 M src/components/LessonTools.tsx
 M src/components/Nav.tsx
 M src/components/PasswordForm.tsx
 M src/components/QuizForm.tsx
 M src/components/ResetForm.tsx
 M src/components/ThemeToggle.tsx
 M src/components/lab/CodeEditor.tsx
 M src/components/lab/CodeLab.tsx
 M src/components/playground/KMeans.tsx
 M src/components/playground/Knn.tsx
 M src/components/playground/LinReg.tsx
 M src/components/playground/Nn.tsx
 M src/components/playground/Pca.tsx
 M src/components/playground/Plot.tsx
 M src/components/playground/Tree.tsx
 M src/lib/content.ts
 M tests/persistence.test.ts
?? docs/screenshots/ui-before-home-1440.png
?? docs/screenshots/ui-dashboard-light-375.png
?? docs/screenshots/ui-home-light-1440.png
?? docs/screenshots/ui-lab-dark-1440.png
?? docs/screenshots/ui-lesson-dark-390.png
?? docs/screenshots/ui-pca-dark-390.png
?? docs/screenshots/ui-quiz-light-390.png
?? docs/self-hosted-deployment.md
?? docs/ui-browser-validation.json
?? docs/ui-ux-redesign.md
?? e2e/ui.spec.ts
?? scripts/deploy-local.mjs
?? src/components/CourseCard.tsx
?? src/components/EmptyState.tsx
?? src/components/HighlightedText.tsx
?? src/components/Icon.tsx
?? src/components/PageHeading.tsx
?? tests/deploy-local.test.ts
?? tests/ui.test.tsx
```

Review trước công bố đã chạy lại verify **48/48**, E2E **14/14**, build/start production local, Prisma/content/spec/audit; không cần sửa thêm source. Remote `main` đã được fetch và branch làm việc fast-forward tới `ddd0825` mà không thay đổi working files. Receipt có mục `prepublicationReview`; kết quả CI/PR không được suy ra từ test local.
