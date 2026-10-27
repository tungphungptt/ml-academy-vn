# Math rendering và trải nghiệm học — kiểm định 2026-10-26

**PASS — ready for review**, với các giới hạn ở cuối báo cáo. Đây là kết quả đọc source/diff và chạy kiểm tra trong checkout hiện tại; không phải chứng nhận production hoặc bảo đảm không còn lỗi.

## Baseline và phạm vi

Bắt đầu trên `codex/expand-verify-ml-dl-curriculum`, HEAD `19596bcb59afdb752d71e9b44de9231f630d08bb`, working tree sạch. Không reset/stash, commit, push, merge, deploy hoặc thao tác database production. Các thay đổi curriculum đã commit trước đó vẫn nguyên trong lịch sử. Bộ này sửa nội dung/render/khám phá kiến thức, không đổi dependency, Prisma schema/migration, seed, auth/API contract, Dockerfile hoặc cấu hình triển khai nền tảng cũ.

| Phạm vi | Trước | Sau |
|---|---:|---:|
| Bài học / câu quiz | 59 / 133 | 59 / 133 |
| Core / Intermediate / Advanced theo ưu tiên học | 32 / 24 / 3 | 32 / 24 / 3 |
| Lab / biến thể / notebook | 13 / 19 / 27 | 13 / 19 / 27 |
| Markdown đã sửa trong lượt này | — | 49 |
| File quiz có chuẩn hóa ký hiệu/diễn giải | — | 42 |
| Biểu thức KaTeX trong 59 Markdown | 901 | 1171 |
| Display equations thật trong 59 Markdown | 0 | 56 |
| Python block thực thi / contextual compile-only | 62 / 2 | 63 / 2 |

Số biểu thức đo bằng SSR, không phải số định lý hoặc chứng minh đúng. [Inventory](math-rendering-content.json) giữ từng file, SHA256 và số trước/sau; có thể tái lập bằng `npx tsx scripts/audit_math_rendering.tsx --report docs/math-rendering-content.json`. Cùng renderer hiện tại được dùng cho cả Markdown baseline và sau sửa để cô lập tác động của cú pháp nguồn. Coverage 46 chủ đề ở [matrix hiện có](curriculum-coverage.json) được giữ; không bổ sung bài chỉ để tăng số lượng. Các chủ đề Advanced vẫn có giới hạn thực nghiệm đã ghi ở [audit curriculum](curriculum-audit.md).

## Nguyên nhân gốc và kiến trúc đã kiểm tra

1. `react-markdown`, `remark-math`, `rehype-katex` và CSS KaTeX đã tồn tại. Không thiếu thư viện. Tuy nhiên nguồn dùng `$$công thức$$` trên **cùng một dòng**: parser hiện tại xử lý nó như inline math. Kiểm tra SSR baseline xác nhận **0** `.katex-display`, dù có 901 biểu thức KaTeX.
2. Nhiều đáp án/rubric viết `dL/dw=(2/N)Σe_ix_i`, `sqrt(...)`, chỉ số/ma trận Unicode ngoài delimiter. Chúng là text đối với parser. CSS không thể biến các chuỗi này thành toán có cấu trúc.
3. `QuizForm` render prompt, options và explanation bằng text; `CodeLab` cũng render description bằng text. LaTeX trong những trường này không qua math parser.
4. CSS cũ có vùng cuộn `.katex-display` nhưng nguồn không tạo display node. Các rule toàn cục cho `nav` còn làm khối tiên quyết sticky; sidebar TOC tại viewport 1300–1449 có thể vượt cạnh phải.

Phân loại nguồn: giữ LaTeX inline đã đúng; chuyển biểu thức Unicode/ASCII đã đọc sang LaTeX; tách delimiter display ra dòng riêng; kiểm tra dấu/hệ số/kích thước và sửa những diễn giải quá rộng bên dưới. Code blocks, pseudo-code, output terminal và nhãn SVG có chủ đích không bị thay thành toán bằng regex runtime. Quét heuristic chỉ hỗ trợ tìm vị trí, không tự quyết định ý nghĩa công thức.

Dòng dữ liệu thực tế:

- `content/catalog.json`: metadata lộ trình, priority tier, prerequisite DAG, loại bài; không thay thứ tự/slug trong lượt này.
- Prisma/SQLite: publication, tiêu đề/thứ tự do admin quản lý, quiz và quan hệ người học. Lesson route và search vẫn kiểm tra publication từ DB.
- `readLesson` trong `src/lib/lessonFiles.ts`: ưu tiên override được admin lưu trên persistent disk, rồi mới dùng Markdown đóng gói.
- Seed add-only đọc catalog/quiz khi tạo bản ghi mới; restart database đã có dữ liệu không tự migrate/seed. Không đổi vòng đời này.
- Lab source từ `labs/`, registry `content/labs.json`; notebook tải về giữ source/output đã kiểm định. Liên kết lab–bài học thêm metadata, không thêm bảng DB.

## Renderer và cú pháp thống nhất

`src/components/MarkdownContent.tsx` dùng **một** pipeline `ReactMarkdown → remark-math → rehype-katex`. Lesson, câu hỏi/lựa chọn/lời giải quiz và mô tả lab dùng chung component. Không chạy auto-render DOM lần hai, không thêm dependency.

- Inline: `$x_i^2$`.
- Display: dòng `$$`, nội dung, rồi dòng `$$` riêng. Trong danh sách, indent cả block theo item. Không chọn `\(...\)`/`\[...\]` làm cú pháp nguồn; chúng không được quảng bá là được hỗ trợ.
- KaTeX `htmlAndMathml`, `trust: false`, `strict: "error"`. MathML hiện diện cho công nghệ hỗ trợ; visual HTML có `aria-hidden`. Raw HTML/JavaScript URL/HTML macro không được tin cậy.
- Chế độ inline cho quiz bỏ các block container không hợp lệ trong `legend`, `label`, `p`, giữ toán và code inline. Regression kiểm tra cả nội dung admin nhiều dòng.
- Code block giữ syntax highlighting Python và nút copy; `$`, `_`, `{}` trong code không thành math. Output stdout và code editor tiếp tục là code/text.
- Ảnh độc lập có `figure`, `figcaption` từ alt, không tạo `figure` bên trong `p` gây hydration sai.
- Display có nền/border nhẹ theo theme, căn giữa khi đủ chỗ, cuộn ngang **bên trong** khi dài. Không giấu overflow của toàn trang. Cỡ chữ, khoảng cách và focus state giữ theo hệ thiết kế hiện có.

Các đường không có tính năng math riêng: ô nhập Markdown/admin cần hiển thị cú pháp để sửa, ghi chú cá nhân hiện vẫn là text; notebook do Jupyter render Markdown. Không tuyên bố auto-convert mọi chuỗi ASCII trong dữ liệu cũ.

## Chỉnh học thuật và giảng giải

| File | Chỉnh sửa và bằng chứng |
|---|---|
| `linear-regression.md` | Dùng residual có dấu `ŷ−y` nhất quán. Giữ MSE mean không có 1/2, gradient `2/N`, phân biệt gradient vector và đạo hàm scalar. Ví dụ `7/6≈1.1667` có phép tính từng bước và code finite difference cho cả w/b: `dw=-4.6667`, `db=-2`. Nêu D2L dùng half-squared loss, nên không sao hệ số gradient từ nguồn sang một convention khác. |
| `loss-functions.md` | MAE có đạo hàm sign(error) khi khác 0, không khả vi tại 0. Giải thích hình SVG vẽ **½·MSE**, khác MSE của ví dụ. Code Huber thực sự có hai nhánh và kiểm tra delta dương; numerical test lấy hàm trực tiếp từ bài, kiểm tra giá trị/đạo hàm nối tại ±delta. |
| `neural-recommendation.md`, `dl-regularization.md` | Công thức recommendation giờ mô tả `L_data` đúng với code MSE + AdamW. Không viết hạng L2 như thể đã cộng vào loss; decay của AdamW tách riêng. Numerical counterexample bằng PyTorch: cùng gradient, AdamW/Adam coupled L2 cho bước khác nhau. Nhãn L2/SGD trong bài regularization được làm rõ. |
| `attention-transformer.md`, quiz | Key là vector khóa, không phải class label. Bổ sung shape Q/K/V, chiều softmax và đầu ra. Lập luận scale `sqrt(d_k)` nêu điều kiện độc lập/mean 0/variance 1; không hứa chặn mọi input. |
| `svm.md` | C đánh đổi norm với **tổng mức độ** vi phạm lề, không đếm số điểm vi phạm. Giữ margin chuẩn tắc, slack, điều kiện kernel PSD và distinction SVC/LinearSVC. |
| `pca.md` | PCA tối đa phương sai của phép chiếu với số chiều giữ lại đã chọn; không hứa giữ mọi thông tin dự đoán. Giữ điều kiện centering/scaling và train-only fit. |
| `k-means.md`, `gmm.md` | Đổi khẳng định “chỉ tìm được cụm cầu” thành điều kiện dữ liệu mà inertia phù hợp; không coi hình dạng cụm là giới hạn biểu diễn tuyệt đối. Điều kiện hội tụ/khởi tạo và Gaussian limit vẫn được giữ. |
| `gradient-descent.md` | Khả vi chưa đủ bảo đảm hội tụ; phải xét bước học/tính chất gradient. Giữ protocol so batch/SGD/minibatch theo update/budget. |
| 49 Markdown, 42 quiz | Chuẩn hóa MLE/MAP, entropy, BCE/CE, SVD/PCA, SVM, optimizer, CNN receptive field, GRU, positional encoding, norm và đáp án số. Giữ đúng mean/sum, dấu, chỉ số, convention hàng/cột và điều kiện đã audit. Không đổi correct index hoặc số lựa chọn của bất kỳ câu nào. |

Bài Linear Regression có thêm cầu nối trực giác → đạo hàm → phép tính → code → kết quả → bài tiếp theo. Các đoạn điều kiện dài ở PCA/SVM/GD/optimizer được tách theo ý. Nội dung đúng được giữ, không áp khuôn một cách máy móc hoặc thay toàn bộ giáo trình.

## Nguồn đã mở/đọc

[Source registry](curriculum-sources.json), mục `math_rendering_review_access`, giữ title, tác giả/tổ chức, URL, ngày truy cập, HTTP/error, hash và phạm vi hỗ trợ. Không sửa các receipt lịch sử để biến lần truy cập lỗi thành thành công.

- MLCB home/categories/index: HTTP200, đã đọc danh mục/thuật ngữ và mapping ML. Đây là nguồn điều hướng; kiểm định bài thuật toán chi tiết tiếp tục dùng các article/snapshot đã ghi ở audit trước.
- D2L tiếng Anh: home và **Linear Regression**, **Forward/Backward Propagation** HTTP200, đã đọc phần loss/gradient/chain rule. So loss có hệ số 1/2 với MSE của dự án và kiểm tra số độc lập.
- `vi.d2l.ai/` và URL chương tương ứng chưa truy cập được; retry homepage có cause `Request was cancelled.` Đã mở/đọc Markdown `d2l-ai/d2l-vi/master/chapter_linear-networks/linear-regression.md` và README qua raw GitHub HTTP200. Đây là kiểm chứng source dịch, **không** xác nhận website tiếng Việt hoạt động. Một filename thử `_vn.md` trả 404, không dùng làm nguồn.
- PyTorch Tutorials hiện hành: HTTP200, đã đọc tổ chức/tutorial scope. **CrossEntropyLoss 2.14** và **AdamW 2.14** HTTP200 đã đọc nội dung API. URL `stable` của CE trước đó chỉ trả HTML redirect 507 byte: không lấy response này làm bằng chứng đã đọc API. Làm rõ input prediction là logits, target API còn hỗ trợ class probabilities.
- sklearn User Guide và chương clustering/K-means HTTP200, đã đọc taxonomy và phần giả định inertia/local minima/cluster shape. Không suy rằng đã đọc mọi chương từ một trang mục lục.
- KaTeX supported-functions URL trong lượt này fetch thất bại; khả năng thực tế được chứng minh bằng phiên bản pin hiện có và regression SSR/browser, không ghi rằng đã đọc trang bị chặn.

Không sao chép prose/code/hình từ nguồn; ví dụ finite difference và code kiểm tra viết trong dự án. Không tải dataset/weights mới. Danh sách 80 URL nguồn của release được kiểm tra lại: **73 đạt HTTP, 7 bị hủy request** (6 arXiv, FastAPI); xem [receipt](math-rendering-links.json). Không tắt TLS, checksum hoặc đổi status để làm check xanh.

## UI/UX đã thực hiện

Breadcrumb có khóa học/module, thời gian đọc tính từ prose ở 180 đơn vị phân cách khoảng trắng/phút và ghi rõ chưa tính suy luận/thực hành. Thời lượng học do catalog/DB quản lý vẫn được giữ riêng. TOC, highlight mục đang đọc, progress, timer, bookmark, notes và bài trước/sau tiếp tục hoạt động.

Lesson có card thực hành liên quan; 13 lab có link ngược về bài theo title và notebook download. Search thêm lọc lộ trình, độ khó, priority tier và loại kiến thức/thực hành; vẫn chỉ lấy bài published, đọc admin override. Course search dùng cùng chuẩn hóa tiếng Việt có/không dấu; có empty state và xóa filter. Không refactor layout toàn site hoặc thêm nút chạy giả cho lab local.

## Kiểm thử thực tế

Python CPU dùng `/workspace/.venvs/ml-academy-curriculum/bin/python`: Python 3.12.14, NumPy 2.3.5, pandas 2.2.3, Matplotlib 3.10.8, sklearn 1.8.0, torch 2.14.1+cpu. Dùng một thread và output/cache riêng trong `/tmp`.

| Lệnh/kiểm tra | Kết quả |
|---|---|
| `npm run verify` (typegen, strict `tsc --noEmit`, `npm test`) | **PASS: 42/42**, gồm 35 test cũ và 7 test renderer mới; không xóa test/tắt strict |
| `python scripts/check_curriculum_math.py` | **PASS: 6/6**, gồm MSE/finite difference, Huber lấy từ source, AdamW vs coupled L2, Ridge thiếu hạng, số CV fit/refit và full sigmoid gradient |
| `python scripts/check_content.py` | **PASS: 59**, 0 lỗi metadata/DAG/slug/files/quiz/internal links/sections |
| `python scripts/audit_spec.py` | **PASS: 52/52** historical mappings; không đồng nghĩa tự động xác nhận độ sâu kiến thức |
| `npx tsx scripts/audit_math_rendering.tsx --report docs/math-rendering-content.json` | **PASS: 59 source**, 1171 visual+MathML nodes, 56 display, 0 KaTeX lỗi/unrendered math |
| `python scripts/run_lesson_code.py` | **PASS: 63 block thực thi**, 0 fail; **2 snippet chỉ compile** được ghi riêng; expected stdout không bị sửa để né lỗi |
| `python scripts/check_notebooks.py --report /tmp/ml-math-review/notebooks.json` | **PASS: 27/27**, mỗi notebook một kernel IPython mới; source/metadata/order/recorded stdout; không regenerate expected |
| `npx prisma validate`; `npx prisma generate` | **PASS: 5.20.0** schema/client; giữ checksum/TLS |
| `npm run build` | **PASS** production compile, TypeScript, 27 pages; không đổi deploy config |
| `npm run e2e -- --reporter=list,json` với server production, DB fixture riêng | **PASS: 9/9**, 59 bài/133 quiz, progress/auth/hidden-course/search/lab/notebook, math DOM/theme/mobile; 0 skipped/flaky |
| `npm run e2e -- e2e/math-rendering.spec.ts` sau bổ sung assertion cuộn ngang | **PASS: 2/2**; công thức dài thực sự scroll trong vùng riêng, không chỉ bị clip |
| `node scripts/check_pyodide.mjs --trusted-proxy-download` | **PASS: 6 lab / 12 variant**, browser WASM thật khớp stdout; transport fixture TLS bên dưới |
| `npm audit --json` | **PASS: 0 vulnerabilities**; dependency/lockfile không đổi |
| `NODE_USE_ENV_PROXY=1 npm run check:links -- --report docs/math-rendering-links.json` | **BLOCKED: exit 1**, 73/80 HTTP đạt, 7 request bị hủy; không báo PASS cho lệnh này |
| Lint | **Chưa có lint script/tool được pin trong repository**; không tự thêm cấu hình/dependency hoặc gọi TypeScript là lint |
| `git diff --check`, kiểm tra file/secret/artifact | **PASS**, xem giới hạn scan bên dưới |

E2E dùng `DATABASE_URL=file:/tmp/ml-curriculum-e2e-math-final-.../app.db`, override riêng, ADMIN_EMAIL/PASSWORD rỗng, secret phiên ngẫu nhiên không lưu trong repo, COOKIE_SECURE=false chỉ cho HTTP loopback. Khởi tạo migration/seed **chỉ** fixture rỗng; không dùng DB gốc hay production. Các test persistence cũ vẫn kiểm tra byte dữ liệu/restart/admin edits/account/role/quiz/progress và seed idempotent.

Một lượt verify đầu chạy đồng thời với `prisma generate` gặp thiếu engine tạm thời. Đã xác định generate thay file engine trong khi test tải nó; generate xong rồi chạy tuần tự đạt. Một lượt E2E đầu so cả backtick Markdown với text DOM nên thất bại; sửa đối chiếu prose/code và TeX annotation, vẫn kiểm tra mọi lựa chọn/correct key/score/explanation. Không bỏ test. Screenshot đầu chụp khi animation mở trang còn opacity 0; browser test nay đợi `.page` opacity 1, không coi `toBeVisible`/LaTeX text đơn thuần là đủ.

## Browser và ảnh chụp

Chromium `/usr/bin/chromium`, production build thật. Mở `linear-regression`, `gradient-descent`, `backpropagation`, `pca`, `svm`, `transformer-architecture`, `loss-functions`, `activations`; 2 theme × 2 viewport (1440×900, 375×900): **32 tổ hợp**. Kiểm tra visual glyph geometry, MathML, display nodes, không KaTeX lỗi/hydration/pageerror, không overflow document. Activations mobile có kiểm tra scrollLeft thực sự di chuyển. Luồng quiz/lời giải/lab sau đăng nhập cũng có assertion pageerror/hydration riêng; lượt cuối kiểm tra lại riêng luồng này đạt 1/1 (4,1 giây).

Chụp 16 full-page screenshot trong `/tmp/ml-math-review/screenshots`; log/evidence ở `/tmp/ml-math-review/`. Ảnh lưu cùng diff, không có tài khoản/email thật:

- [Linear Regression — light desktop](screenshots/math-linear-light-1440.png)
- [Linear Regression — dark mobile](screenshots/math-linear-dark-375.png)

Hai ảnh minh họa lưu trong repo dùng reduced-motion theo hỗ trợ accessibility; bộ 32 trường hợp vẫn kiểm tra animation và chờ nó hoàn tất. Đã xem trực tiếp ảnh Linear Regression và Backpropagation; ảnh đầy đủ các route còn lại được chụp bởi test, không phải hình mock.

## Giới hạn và điều kiện áp dụng

- **Dữ liệu đã tồn tại:** source mới không tự ghi đè quiz/Markdown override admin đã sửa. DB cũ có thể vẫn chứa quiz ASCII/citation cũ; cần đối chiếu bản backup/copy và cập nhật có chủ đích qua công cụ admin trước khi quảng bá rằng production đã đồng nhất release. Không tự reseed để làm số liệu đẹp.
- MathML/aria/contrast/focus/viewport được kiểm tra cấu trúc và browser, chưa thử với người dùng screen reader thật, Safari/Firefox, thiết bị vật lý hoặc mọi kích thước/phóng to.
- Bảy URL release và website D2L Việt chưa xác minh trực tiếp do môi trường; paper full text/giấy phép dataset còn các giới hạn đã ghi trong audit trước. HTTP200 và số lượng test không tự chứng minh mọi phát biểu học thuật.
- Hai contextual snippet FastAPI/torchvision không được thực thi vì cần model/weights/context ngoài; advanced GAN/VAE/diffusion không có benchmark training mới. 27 notebook/lab hiện có và code CPU được kiểm tra trong phạm vi đã công bố.
- Pyodide dùng nguyên bytes từ CDN chính thức, tải qua Python TLS/platform CA rồi fulfill cho Chromium do CA proxy của browser. **Không** phải kiểm tra CDN/TLS trực tiếp của Chromium; không dùng ignore-certificate-errors.
- Lint chưa có; không có lượt Docker build/CI/production deployment trong công việc này. Build/runtime/browser cục bộ không thay cho CI hoặc giám sát production.
- Scan không thấy credential thật, DB fixture, checkpoint, cache/log thừa hoặc dữ liệu cá nhân trong thay đổi. Không tuyên bố scan bảo đảm tuyệt đối không có secret.

Danh sách chính xác các file sửa/mới ở phần dưới. Kết luận: **PASS — ready for review**.

## Danh sách file

Tổng **118 file** sửa/mới trong working tree của lượt này. Inventory học thuật trước đó vẫn là snapshot lịch sử. Hai PNG dưới đây là bằng chứng UI có chủ đích; không có database/model/log trong danh sách.

<details>
<summary>Toàn bộ đường dẫn</summary>

- `content/labs.json`
- `content/lessons/activations.md`
- `content/lessons/anomaly-detection.md`
- `content/lessons/attention-transformer.md`
- `content/lessons/autoencoder.md`
- `content/lessons/autograd.md`
- `content/lessons/backpropagation.md`
- `content/lessons/bayesian-estimation.md`
- `content/lessons/bias-variance.md`
- `content/lessons/cnn.md`
- `content/lessons/convex-optimization.md`
- `content/lessons/cross-validation.md`
- `content/lessons/decision-tree.md`
- `content/lessons/derivatives.md`
- `content/lessons/dl-regularization.md`
- `content/lessons/embeddings.md`
- `content/lessons/gan-vae-diffusion.md`
- `content/lessons/gmm.md`
- `content/lessons/gradient-descent.md`
- `content/lessons/k-means.md`
- `content/lessons/knn.md`
- `content/lessons/lda.md`
- `content/lessons/linear-algebra-decompositions.md`
- `content/lessons/linear-regression.md`
- `content/lessons/logistic-regression.md`
- `content/lessons/loss-functions.md`
- `content/lessons/metrics.md`
- `content/lessons/ml-intro.md`
- `content/lessons/mlp.md`
- `content/lessons/naive-bayes.md`
- `content/lessons/neural-recommendation.md`
- `content/lessons/numpy-pandas.md`
- `content/lessons/optimizers.md`
- `content/lessons/pca.md`
- `content/lessons/perceptron.md`
- `content/lessons/polynomial-regression.md`
- `content/lessons/probability.md`
- `content/lessons/pytorch-practice.md`
- `content/lessons/random-forest.md`
- `content/lessons/recommendation.md`
- `content/lessons/ridge-lasso.md`
- `content/lessons/rnn-lstm.md`
- `content/lessons/sequence-models-cpu.md`
- `content/lessons/softmax-regression.md`
- `content/lessons/statistics.md`
- `content/lessons/svm.md`
- `content/lessons/training-diagnostics.md`
- `content/lessons/transfer-learning.md`
- `content/lessons/transformer-architecture.md`
- `content/lessons/vectors-matrices.md`
- `content/quizzes/activations.json`
- `content/quizzes/anomaly-detection.json`
- `content/quizzes/attention-transformer.json`
- `content/quizzes/autograd.json`
- `content/quizzes/backpropagation.json`
- `content/quizzes/bayesian-estimation.json`
- `content/quizzes/bias-variance.json`
- `content/quizzes/cnn-practice.json`
- `content/quizzes/cnn.json`
- `content/quizzes/convex-optimization.json`
- `content/quizzes/decision-tree.json`
- `content/quizzes/derivatives.json`
- `content/quizzes/dl-regularization.json`
- `content/quizzes/gan-vae-diffusion.json`
- `content/quizzes/gmm.json`
- `content/quizzes/gradient-descent.json`
- `content/quizzes/knn.json`
- `content/quizzes/lda.json`
- `content/quizzes/linear-algebra-decompositions.json`
- `content/quizzes/linear-regression.json`
- `content/quizzes/logistic-regression.json`
- `content/quizzes/loss-functions.json`
- `content/quizzes/metrics.json`
- `content/quizzes/ml-intro.json`
- `content/quizzes/naive-bayes.json`
- `content/quizzes/optimizers.json`
- `content/quizzes/perceptron.json`
- `content/quizzes/polynomial-regression.json`
- `content/quizzes/probability.json`
- `content/quizzes/python-ml.json`
- `content/quizzes/pytorch-practice.json`
- `content/quizzes/random-forest.json`
- `content/quizzes/ridge-lasso.json`
- `content/quizzes/rnn-lstm.json`
- `content/quizzes/sequence-models-cpu.json`
- `content/quizzes/softmax-regression.json`
- `content/quizzes/statistics.json`
- `content/quizzes/svm.json`
- `content/quizzes/training-diagnostics.json`
- `content/quizzes/transfer-learning.json`
- `content/quizzes/transformer-architecture.json`
- `content/quizzes/vectors-matrices.json`
- `docs/curriculum-audit.md`
- `docs/curriculum-execution.json`
- `docs/curriculum-pyodide-execution.json`
- `docs/curriculum-sources.json`
- `docs/math-rendering-audit.md`
- `docs/math-rendering-content.json`
- `docs/math-rendering-links.json`
- `docs/screenshots/math-linear-dark-375.png`
- `docs/screenshots/math-linear-light-1440.png`
- `e2e/curriculum.spec.ts`
- `e2e/math-rendering.spec.ts`
- `scripts/audit_math_rendering.tsx`
- `scripts/check_curriculum_math.py`
- `src/app/courses/page.tsx`
- `src/app/globals.css`
- `src/app/lab/page.tsx`
- `src/app/learn/[slug]/page.tsx`
- `src/app/search/page.tsx`
- `src/components/MarkdownContent.tsx`
- `src/components/QuizForm.tsx`
- `src/components/lab/CodeLab.tsx`
- `src/lib/content.ts`
- `src/lib/publishedContent.ts`
- `src/lib/reading.ts`
- `src/lib/search.ts`
- `tests/math-rendering.test.tsx`

</details>
