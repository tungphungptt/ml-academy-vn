# Independent final review — curriculum

Kết luận: **PASS — ready to commit**, sau khi sửa các lỗi dưới đây và chạy lại kiểm tra. Đây là lượt đọc diff/source và thực thi mới; không lấy số PASS của báo cáo trước làm bằng chứng. Bắt đầu từ 143 file chưa commit trên `main`, HEAD `5b88b1889456fecfa06fa2c4921f5abe15a72a24`. Tổng sau review được ghi trong `curriculum-changes.json`.

## Findings đã xác nhận và sửa

| Mức | File/dòng hiện tại | Vấn đề, cách tái hiện và bản sửa |
|---|---|---|
| P1 | `labs/cnn_cpu/library.py:16`, `public/notebooks/cnn_cpu_library.ipynb`, `public/notebooks/transfer_cpu_library.ipynb` | Hai notebook lỗi trong kernel IPython thật: `unrecognized arguments: -f /tmp/...json`, `SystemExit: 2`. Generator cũ chạy Python CLI nên không phát hiện. Notebook bỏ tham số do kernel sở hữu và dùng cấu hình mặc định; CLI terminal vẫn parse nghiêm ngặt, `--augment` vẫn chạy và flag sai vẫn exit2. Regenerate notebook từ source thực, không đổi expected metric để né lỗi. |
| P1 | `src/app/api/quiz/route.ts:6`, regression `e2e/curriculum.spec.ts:77` | Khi course bị ẩn, direct lesson/search chặn nhưng API quiz vẫn trả HTTP200 với 3 đáp án/lời giải cho USER đã đăng nhập. Đã tái hiện trên DB tạm. API nay chỉ lấy quiz của lesson có content thuộc course published; hidden/missing quiz trả404, không trả results và không tạo attempt. Hợp đồng request/response cho quiz public không đổi. |
| P2 | `content/lessons/ridge-lasso.md:10` | Công thức nghịch đảo chưa nêu trường hợp lambda=0, X thiếu hạng. Bổ sung full-rank/pseudoinverse và ví dụ có assertion normal matrix suy biến nhưng regularization dương cho nghiệm hữu hạn/duy nhất; so với sklearn Ridge trong regression test. |
| P2 | `content/quizzes/hyperparameter-tuning.json:3` | Câu hỏi “số lần huấn luyện” đáp30 bỏ sót refit mặc định. Giờ hỏi rõ số fit CV không tính refit; lời giải ghi tổng31 khi refit=True. Regression spy gọi fit SVC thật xác nhận 30+1, không mock kết quả mô hình. |
| P2 | `content/lessons/cross-validation.md:38` | Gán độ lệch CV cho train folds chồng lấn chưa đúng. Phân biệt tương quan scores/variance với khác biệt kích thước train và các nguồn bias. |
| P2 | `content/lessons/probability.md:29`, `content/lessons/naive-bayes.md:28` | Câu cũ còn khẳng định MLE nhất quán chỉ do nhiều dữ liệu/MAP tự chữa overfit, hoặc Laplace cho mọi NB, dù phần bổ sung đã có điều kiện. Sửa ngay phát biểu gốc để không mâu thuẫn: MLE cần giả định, prior có thể sai; pseudocount cho mô hình count/rời rạc, Gaussian ổn định variance. |
| P2 | `content/lessons/softmax-regression.md:28`, `content/lessons/cnn-practice.md:39` | Xóa phát biểu “chưa có lab riêng” đã lỗi thời; liên kết lab thật. Sửa “không có lớp học được” trong fixed-filter CNN: Logistic Regression head vẫn học, chỉ convolution filters cố định. |
| P2 | `content/quizzes/feature-leakage.json:13`, `content/lessons/ml-intro.md:42` | Quiz leakage cần gắn với quy trình SelectKBest fit toàn bộ đã biết, không suy chắc chắn từ riêng một score cao. Đáp án bài tập nhập môn được căn đúng năm ví dụ thuộc ba nhóm của đề, không lẫn RL/giảm chiều ngoài nhóm được hỏi. |

Không xóa câu hỏi, test, bài cũ hoặc dữ liệu. Các thay đổi API ở trên là sửa rò đáp án liên quan publication, không mở rộng chức năng/đổi schema. Không refactor giao diện.

## Phạm vi đã đọc và đối chiếu

Đọc toàn bộ 59 Markdown (50 sửa + 9 mới), 133 câu hỏi/đáp án/lời giải trong 59 quiz, 19 biến thể script lab, source cells của 27 notebook, catalog/metadata/coverage 46 mục, seed/persistence/lesson overrides, các thay đổi frontend/search/publication, script validation/generator và báo cáo/receipt. So sánh toàn bộ tracked diff với HEAD và mọi file mới, kể cả JSON metadata/output/hash; snapshot đầu review ở `/tmp/ml-independent-review/initial-files.json` để kiểm tra không mất công việc trước đó.

Bài Autoencoder được bổ sung lập luận rank(XAB)≤k và citation SVD cụ thể đã đọc, thay vì dựa riêng vào homepage D2L cho liên hệ PCA. Trang sách chuyên biệt autoencoders.html đã thử thêm nhưng request bị hủy; không dùng nó như nguồn đã đọc.

Không thấy placeholder/bài rỗng, trùng slug/content file hay mất ID cũ. Ba nhóm chồng nội dung đã phân vai, không phải duplicate bài: xác suất/thống kê, attention/Transformer, shape/fixed-filter/trained CNN. Bài tập tự luận có đáp án/rubric, khác quiz trắc nghiệm mỗi câu một điểm. Tất cả 133 đáp án đã đọc; mapping DB và đáp án được kiểm tra thêm bằng test thực thi.

Đối chiếu trực tiếp lại năm trang ML cơ bản (home/categories/math/index/TabML bố cục), cùng các chương SVD, hard-margin SVM (`2017/04/09/smv/`), MLE/MAP, LDA: HTTP200. Đã đọc các đoạn công thức/giả định liên quan; đối chiếu Ridge với sklearn và hành vi parse_args/sys.argv với tài liệu Python chính thức, HTTP200. Phân biệt economy SVD của NumPy (`min(n,d)`) với compact SVD giữ rank thực ở tài liệu tham khảo; công thức trong bài hợp lệ. Nguồn DL mở rộng và những lần truy cập ban đầu vẫn được giữ trong `curriculum-sources.json`; không coi một URL HTTP200 là bằng chứng đã đọc toàn bộ nguồn đó.

Tất cả 78 URL trong registry/Markdown/resources/datasets được retry với proxy và TLS bình thường: **71 thành công, 7 request bị hủy** (FastAPI và sáu arXiv). Không tắt TLS/checksum, không tuyên bố đã đọc toàn văn các nguồn bị chặn. Link check giữ exit code thất bại vì bảy mục này; không whitelist chúng thành PASS.

## Kiểm thử độc lập sau sửa

| Kiểm tra | Kết quả và hành vi thực sự được kiểm tra |
|---|---|
| `npm run verify` | PASS: strict TypeScript và **35 test**. Thêm kiểm tra hash/source/stdout notebook so với script và fresh seed có đủ59 bài/133 prompt/options/keys/explanations đúng thứ tự. |
| Seed/persistence integration | PASS: nâng fixture50→59, seed lặp, giữ nguyên các record/IDs/quizzes/admin edits/users/password/role/progress/notes/bookmarks/attempts; đổi tên module vẫn reconcile qua anchors; restart không ghi lại DB. Có cả learner không bị promote, course ẩn không bị publish lại. |
| `python scripts/check_curriculum_math.py` | PASS: 3 regression số học: Ridge thiếu hạng so với sklearn; đếm30 fit CV +1 refit SVC thật và đối chiếu quiz; phản ví dụ PyTorch gradient=4 dù tích activation-only bound=.25². |
| `python scripts/check_notebooks.py --report docs/curriculum-notebook-execution.json` | PASS: **27/27**, nbformat schema hợp lệ; cell thứ tự1..N; mỗi notebook một kernel IPython/process mới, output stdout khớp bản ghi. Không dùng exec giả kernel, không cập nhật expected để làm đạt. Runner kiểm tra cả tập file với lab/project registries, không cho tập rỗng thành PASS. |
| Python lesson blocks | PASS: **62** standalone blocks, gồm Ridge rank-deficient, normalization, attention/Transformer causal invariance, backward, serving HTTP200/400. Hai `python snippet` chỉ compile cú pháp, không tính là thực thi. |
| CPU labs | PASS: **19** biến thể; output trước/sau sửa giữ nguyên. Chạy riêng `cnn_cpu --augment` đạt accuracy .9222/reload_equal; flag CLI sai exit2. Transfer tạo checkpoint mới trong cùng lần chạy, không dựa artifact từ phiên trước. |
| `npm run e2e` trên production build và DB `/tmp/ml-curriculum-e2e-*` | PASS: **7 test**, gồm DOM hiển thị đủ59 trang; đủ133 câu quiz/option/lời giải, chọn đáp án theo tên sau shuffle và chấm133/133; completion bài CNN còn sau reload; course/search/filter/prerequisites/pager/download; hidden pages/search và API quiz404/no leak/no attempt. Ba test cũ giữ nguyên. |
| Pyodide | PASS: **12** biến thể trong browser/WASM, khớp stdout. Tài nguyên CDN nguyên bản được tải bằng Python TLS/platform CA vì Chromium trực tiếp thiếu CA proxy; không phải kiểm tra CDN/TLS trực tiếp từ Chromium. |
| `npx prisma validate`, `npx prisma generate` | PASS, Prisma/client5.20.0, schema/migrations không đổi. |
| `npm run build` | PASS: production compilation, TypeScript và27 route page generation; có warning tracing filesystem động, không phải lỗi build. |
| Content/specification | PASS:59 lesson records; 52/52 mapping specification. Mapping và regex cấu trúc không tự chứng minh đúng học thuật; kết luận nội dung dựa vào phần đọc/đối chiếu ở trên. |
| Docker build và container smoke | PASS: image `ml-academy-vn-independent-review`, SHA `fe194e44c928030bb31113dbdd0909d74d2b79976b677861dcfee75a647c10a4`; build với proxy/CA chuẩn, smoke health/auth/quiz/progress/admin edit/search/recreate giữ SQLite/overrides/users. Không tạo dịch vụ Render. |
| Artifact/secret/diff | Quét lại toàn bộ file mới/sửa, kiểm tra manifests/hash, không có database/checkpoint/log/private key/token thật; `git diff --check` sạch. |

Trong review này đã cài nbformat5.10.4, nbclient0.10.2, ipykernel6.30.1 vào môi trường Python thử nghiệm, không vào Node/Docker web app. Không đổi package.json/lockfile, không tắt strict mode, không reset DB và không truy cập production. Generator chỉ chứng minh CLI/output; test kernel thật là bổ sung bắt buộc để tránh lặp lại lỗi notebook vừa tìm thấy.

## Giới hạn còn lại

- Số59 bài published là quan sát trên fresh fixture, không phải xác nhận production đã được seed. DB hiện hữu vẫn cần backup, thử manual seed trên bản sao và review overrides/quiz/source edits; không tự ghi đè để ép bằng bản phát hành. Tiến độ cũ giữ ID, tỷ lệ có thể đổi do thêm bài.
- Bảy URL chưa xác minh toàn văn; license upstream của dataset/trọng số ngoài chưa kiểm chứng đầy đủ. Không phát lại dataset/weights hoặc gán license phần mềm cho dataset.
- Hai contextual snippet FastAPI/torchvision chưa chạy; serving loopback và transfer tự pretrain đã chạy. Notebook transfer cần checkout repository, không phải một file portable độc lập.
- GAN/VAE/diffusion là giới thiệu Advanced; Transformer kiểm tra encoder–decoder/position/masks/gradient, chưa benchmark huấn luyện ngôn ngữ. Chỉ một split/seed nhỏ cho các thí nghiệm; không báo CI/generalization production. Metrics không bị sửa để tạo kết quả tốt hơn.
- Không commit, push, merge, Render/deploy, tạo dịch vụ trả phí hoặc migration production. Không có CI GitHub mới vì chưa push. Các server/kernel/container kiểm thử là tài nguyên local tạm.
