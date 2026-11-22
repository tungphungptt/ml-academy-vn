# NeuralClone: cập nhật nội dung và QA cuối

> **Tiếp nối Firefox/WebKit và Transfer 28/10/2026:** xem [review mới](neuralclone-cross-browser-review.md) và [điều tra Transfer](neuralclone-transfer-investigation.md). Đã kiểm tra engine thực trên Windows, sửa race quiz/thời gian tải Pyodide/CSP; 14 ví dụ Pyodide vừa chạy lại qua CDN trực tiếp đều khớp. Transfer hiện đếm được 334/360, kết quả lặp ổn định nhưng chưa tái hiện baseline 335/360 suy từ accuracy lịch sử. Expected và strict comparison giữ nguyên; không thêm bài học mới để che phần chưa xác minh.

> **Bàn giao tiếp ngày 28/10/2026:** lỗi HMR 502 đã được tái hiện và sửa ở allowlist của Next dev; có handshake 101 cùng phép thử đổi/hoàn nguyên heading mà không reload. Đã sửa luồng đăng nhập quay lại quiz, URL chọn lab, hướng dẫn CPU và trường hợp biên của demo ngưỡng. Các kết quả kiểm thử bên dưới thuộc ngày 27/10; không dùng chúng làm kết quả vừa chạy. Xem [báo cáo final polish](neuralclone-final-polish.md) và [bằng chứng HMR mới](neuralclone-polish-hmr-browser.json).

Thực hiện ngày **27/10/2026**, tiếp tục working tree hiện tại. Giữ redesign, URL, dữ liệu và server cổng 3000; không clone, đồng bộ GitHub, push hay thay đổi Cloudflare/DNS.

## Kết quả triển khai

| Hạng mục | Trước | Sau |
| --- | --- | --- |
| Bài học / câu quiz | 59 / 133 | **67 / 157** |
| Module | Các module hiện có | Thêm `modern-practice` cuối Track B, `modern-ai` cuối Track C |
| Lab / notebook | 13 / 27 | **15 / 29** |
| Biến thể Code Lab chạy browser | 12 | **14** |
| Playground | 6 thí nghiệm | **7**, thêm quyết định theo ngưỡng/cost |
| Visual gốc | Giữ các visual hiện có | Thêm 8 SVG, chú thích và liên kết xem hình đầy đủ |

## Bài mới và kết quả đã chạy

Mỗi bài có prerequisite links, mục tiêu, trực giác, lý thuyết/công thức, ví dụ, giới hạn/hiểu lầm, bài tập có đáp án và nguồn. Ví dụ nhỏ được ghi rõ là minh họa, không phải benchmark hoặc kết quả train một mô hình lớn.

| Bài | Kiểm chứng cụ thể | Nguồn chính/lý do chọn |
| --- | --- | --- |
| [Gradient Boosting](../content/lessons/gradient-boosting.md) | Bốn mẫu, dự đoán `[1.5,1.5,2.5,2.5]`, MSE 1 → 0,25 | [scikit-learn ensemble](https://scikit-learn.org/stable/modules/ensemble.html#gradient-boosting): lấp phần boosting còn thiếu. |
| [Mất cân bằng/calibration/ngưỡng](../content/lessons/imbalanced-learning.md) | 8 điểm tự tạo; t=0,3/0,5/0,7 cho cost 3/6/9 khi CFP=1, CFN=4 | [Threshold tuning](https://scikit-learn.org/stable/modules/classification_threshold.html), [calibration](https://scikit-learn.org/stable/modules/calibration.html): nối metric với quyết định. |
| [MLOps/tái lập/drift](../content/lessons/mlops-reproducibility.md) | Hash/split ổn định theo ID; fingerprint đổi khi giá trị đổi; histogram TV=0,3 | [Google monitoring](https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring), [PyTorch reproducibility](https://docs.pytorch.org/docs/stable/notes/randomness.html): bổ sung provenance/vận hành. |
| [Responsible AI](../content/lessons/responsible-ai.md) | Hai nhóm cùng selection=0,5 nhưng TPR=0,5/1,0; giải thích privacy riêng | [Model Cards](https://arxiv.org/abs/1810.03993), [Datasheets](https://arxiv.org/abs/1803.09010), [Dwork–Roth](https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf): không đồng nhất một tỷ lệ với fairness. |
| [Nền tảng LLM](../content/lessons/llm-foundations.md) | “Học máy”: 7 ký tự NFC, 10 byte UTF-8, 9 ký tự NFD; kiểm tra NLL/perplexity trên xác suất toy | [HF tokenization](https://huggingface.co/learn/llm-course/chapter6/5), [causal LM](https://huggingface.co/learn/llm-course/chapter7/6): phân biệt byte/character/token và training/inference. |
| [PEFT/LoRA/quantization](../content/lessons/efficient-finetuning.md) | Layer 4096²: 16.777.216 weights, rank8 có 65.536 adapter params; merge sai số số học phù hợp; toy quantization max error 0,0571 | [LoRA](https://arxiv.org/abs/2106.09685), [QLoRA](https://arxiv.org/abs/2305.14314): không suy tham số thành RAM/tốc độ hay nhầm uniform quantization với NF4. |
| [RAG/vector search](../content/lessons/rag-vector-search.md) | Tính cosine/top-k/Recall trên vector tự tạo; notebook lexical có ACL và abstain | [RAG gốc](https://arxiv.org/abs/2005.11401), [text features](https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction): dạy retrieval trước generation. |
| [Đánh giá/an toàn LLM](../content/lessons/llm-evaluation-security.md) | Fixture 3 ca tự tạo: coverage 0,6667, accuracy có điều kiện 0,5, unsupported=0,5 | [Indirect injection](https://arxiv.org/abs/2302.12173), [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework): tách correctness, support và quyền tool. |

Tất cả nguồn được kiểm tra trong ngày 27/10/2026; [ledger nguồn và phạm vi sử dụng](neuralclone-research-sources.json). Đây là nội dung gốc bằng tiếng Việt, không sao chép bài ngoài hoặc benchmark. PEFT main là tài liệu đang phát triển, được ghi rõ; code ví dụ không phụ thuộc một API main chưa chạy.

## Thực hành, visual và điều hướng

- `threshold_cost`: code stdlib cùng số liệu với bài và demo; thay ngưỡng/cost thay đổi kết quả thật.
- `rag_retrieval`: fit vocabulary/IDF trên ba tài liệu tiếng Việt tự viết, reuse ở query; lọc quyền trước top-k, không overlap thì từ chối. Đây là **lexical baseline**, không có semantic encoder hoặc LLM giả.
- Hai notebook chứa đúng source và stdout của lần chạy CPU; E2E đối chiếu source notebook với editor. Cả hai cũng đã chạy thật trong Pyodide Worker. Code Lab chỉ tải NumPy/scikit-learn khi code cần, tránh tải NumPy cho các lab stdlib mới.
- Tám SVG dùng chung palette/nét vẽ, mô tả đúng số liệu và pipeline trong bài. Đã xem ảnh desktop/mobile thực tế; có caption và liên kết “Xem hình đầy đủ” có tên truy cập được bằng bàn phím. Hình luôn có alt text; không dùng stock/watermark.
- Search dùng catalog/DB hiện có, không tạo chỉ mục song song. Các bài nằm đúng track, prerequisites trước bài mới; các link lesson/lab, quiz và sitemap được kiểm tra.
- Làm rõ RoPE và pre/post-norm trong bài Transformer cũ; sửa cách khái quát VAE/GAN/diffusion. Sửa Markdown của lời giải quiz LoRA để `*` trong phép nhân không vô tình biến chữ thành emphasis.
- Thư viện dataset: tách giấy phép dữ liệu khỏi giấy phép phần mềm; ghi rõ UCI CC BY 4.0 của Iris/BCW, khác biệt phiên bản Iris, và giới hạn chưa xác minh license riêng của Diabetes/Digits.

## Database và bảo toàn dữ liệu

`npm run content:update` dùng importer add-only, kiểm tra đường dẫn SQLite thực nằm trong dự án, **VACUUM INTO** backup trước khi ghi, không reset/migrate schema hay tạo admin. So sánh đầy đủ 59 lesson row, các module/quiz cũ trước/sau và số bản ghi dữ liệu người dùng. Kết quả [lần thêm](neuralclone-content-import.json) và [lần chạy lặp](neuralclone-content-idempotency.json): thêm đúng 8 bài/24 câu; chạy lại không thêm gì. Các ID/order cũ giữ nguyên.

Backup nội bộ lần thêm: `.local/backups/neuralclone-content-1793113440819.db`. Không đưa backup database vào Git hoặc public assets. DB local tại thời điểm kiểm tra có 0 user/progress/note/attempt/bookmark; không có dữ liệu người dùng thật để chứng minh giữ nguyên một lịch sử học có sẵn. Kiểm thử persistence/E2E dùng fixture riêng để kiểm tra luồng có dữ liệu.

`npm run content:repair` chỉ sửa các giá trị metadata lỗi đã biết bằng điều kiện khớp giá trị cũ (dataset source/license và lời giải LoRA), có backup riêng và transaction. Không ghi đè chỉnh sửa khác của admin; không đổi question ID, đáp án, attempt hoặc tiến độ. [Kết quả repair](neuralclone-metadata-repair.json), [chạy lặp](neuralclone-metadata-idempotency.json). Không đọc password hash để kiểm tra bảo toàn dữ liệu. Các backup nằm trong `.local/backups`.

## Kiểm thử thực tế

| Kiểm tra | Kết quả |
| --- | --- |
| `npm run verify` | **TypeScript đạt, 59/59 unit/integration**, 0 skipped. |
| `npm run build` | **Đạt**, compile và TypeScript thành công, tạo 28 static pages; lesson routes dynamic. |
| `npm run e2e` với Chrome | **25/25 đạt** trên build và DB riêng cổng 3100. Có luồng tất cả 67 bài/quiz, auth/progress/security/search/UI/typography. |
| `python -X utf8 scripts/check_content.py` | **67 records, 0 lỗi cấu trúc**, prerequisite order, links, quiz và asset hợp lệ. Không coi validator là chứng nhận nội dung học thuật. |
| `python -X utf8 scripts/check_modern_content.py` | **11/11 Python fences** của bài mới khớp kết quả, [stdout thực tế](neuralclone-modern-execution.json). Python 3.14.7/NumPy hiện có. |
| Hai lab mới trên CPU | **2/2**, notebook có source hash/stdout thật, [báo cáo](neuralclone-new-lab-execution.json). |
| Pyodide trong Chrome | **14/14 biến thể browser đạt**, gồm hai lab mới, [báo cáo](neuralclone-content-pyodide.json). |
| HTTP nguồn ngoài | **104/104 URL đạt**, [báo cáo](neuralclone-content-links.json). HTTP 200 không tự chứng minh mọi anchor hoặc nội dung khoa học đúng. |
| Console local/live | 26 lượt mở trang đều HTTP 200, không page exception. Local không console error; live có **12 lỗi WebSocket HMR 502**, xem [báo cáo nguyên trạng](neuralclone-content-console.json). Đây là giới hạn chưa xử lý của đường phục vụ development qua domain, không gộp thành “console sạch”. |
| Typography | **384 mẫu**, không fallback sau tải font; NFC/NFD cùng chiều rộng; [báo cáo riêng](neuralclone-typography-fix.md). |
| Hình học/UI | 17 màn hình chính × 4 chiều rộng × 2 theme; thêm 8 bài mới × 8 điều kiện = **64 trang kiểm tra mới**, không overflow/KaTeX error/heading fallback, [JSON](neuralclone-content-visuals.json). |

Lượt E2E đầu phát hiện selector “Ngưỡng quyết định” khớp cả slider lẫn SVG và phép nhân `*` trong lời giải quiz bị Markdown diễn giải. Đã sửa selector theo role và bọc phép nhân trong code literal; chạy lại đầy đủ 25 E2E đạt. Một lỗi TypeScript ở script repair mới và bốn URL dataset thiếu dấu `#` cũng đã được công cụ kiểm tra phát hiện và sửa. Không giữ kết quả pass của lượt cũ để che các lỗi này.

Repo không có ESLint script/config, nên không ghi “lint pass”. Kiểm tra TypeScript bổ sung `--noUnusedLocals --noUnusedParameters` và `git diff --check` được ghi trong bằng chứng QA cuối.

[Tổng hợp QA có số liệu thực](neuralclone-content-final-qa.json) đối chiếu thêm quiz mới và dataset metadata trong DB với source, xác nhận các link file trong ba báo cáo tồn tại. Build/verify log đầy đủ giữ nội bộ trong `.local`; E2E ghi `test-results/.last-run.json` là `passed`.

## Ảnh và đối chiếu website

- [Typography trước/sau cùng điều kiện](neuralclone-typography-fix.md#bằng-chứng-trướcsau-cùng-điều-kiện).
- [Heading LLM dark/375](screenshots/new-content/llm-foundations-dark-375-heading.png), [RAG light/1440](screenshots/new-content/rag-vector-search-light-1440-figure.png), [LoRA dark/375](screenshots/new-content/efficient-finetuning-dark-375-figure.png).
- Ảnh UI cốt lõi ở `docs/screenshots/content-update`; ảnh tám bài ở `docs/screenshots/new-content`, đủ 375/768/1440/1920 và hai theme. Đã mở ảnh thật để đánh giá dấu, khoảng cách, line-break và sơ đồ; kiểm tra tự động bổ sung cho việc xem ảnh.
- [Kiểm tra nội dung local/live](neuralclone-live-content-check.json) ghi status/heading của từng bài mới và các font preload. Ảnh [local](screenshots/new-content/local-evaluation-1440.png)/[live](screenshots/new-content/live-evaluation-1440.png). Không thay đổi DNS/tunnel và không dùng trang lỗi làm mẫu thiết kế.

## File thay đổi và cách chạy

[Manifest từng file](neuralclone-content-change-manifest.json) liệt kê file tạo/sửa cùng screenshot và asset. Không xóa/di chuyển bài cũ; không thay package dependency hoặc lockfile trong đợt này. File tạm, virtualenv FontTools và backup nằm dưới `.local`, được ignore. Manifest chỉ mô tả đợt typography/nội dung, không gom công việc redesign có trước thành thay đổi mới.

```powershell
# Với database dự án đã có schema hợp lệ, thêm phần thiếu rồi sửa metadata cũ đã biết:
npm run content:update
npm run content:repair

# Chỉ khởi động khi chưa có server tương ứng:
npm run local
```

Server cổng 3000 đang chạy được giữ nguyên trong phiên này. Tab development nhận thay đổi từ source; production cần build mới và restart process ứng dụng có kiểm soát. Nếu neuralclone.site trỏ qua tunnel tới chính server local, nội dung sẽ theo process đó; nếu trỏ tới bản triển khai khác thì phải cập nhật artifact và database của bản đó trong phạm vi quyền được cấp. Không chạy hai server trên cùng cổng, không tự sửa Cloudflare/DNS. Font mới có URL `v2`; hard reload nếu tab còn giữ HTML/CSS cũ. Nội dung production được cache nên cần restart sau khi import bài.

## Giới hạn còn lại

Website công khai hiện phục vụ Next **development**. Trong lần duyệt console cuối, WebSocket `wss://neuralclone.site/_next/hmr` nhận 502 dù 26 lượt mở trang local/live đều HTTP 200, tám bài khớp catalog và không có page exception. Local không ghi nhận lỗi socket này; build production và E2E production đã đạt. Chưa xác định cấu hình proxy/tunnel cụ thể gây lỗi, vì không thay đổi hay kiểm tra cấu hình dịch vụ ngoài phạm vi cho phép. Vì vậy chỉ xác định đây là lỗi kết nối HMR trên đường public, không quy lỗi cho typography/nội dung và không khẳng định đã sửa deployment. Giữ server đang chạy; nếu cần phục vụ production, dùng build production trong một lần chuyển process có kiểm soát theo runbook. Không cần HMR cho người học trên production.

Chưa thử thiết bị Safari/iOS/Android vật lý, GPU/LLM fine-tuning, dịch vụ vector DB hoặc diffusion training. Không chạy lại toàn bộ lab PyTorch CPU cũ trong Python hiện tại thiếu Torch; không đánh đồng kết quả browser với chứng nhận CPU/GPU. Không thử triển khai mới ở dịch vụ ngoài. Audit không thay thế peer review học thuật độc lập hoặc kiểm tra dữ liệu người dùng thực có lịch sử. Các khoảng trống cần mở rộng được ghi trong [bảng audit](neuralclone-content-audit.md).
