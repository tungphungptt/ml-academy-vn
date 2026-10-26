# Thực hành curriculum trên CPU

Chạy tại gốc repository. Phần Python phục vụ học tập, không được cài vào Docker web service và không cần GPU hoặc dịch vụ tính phí.

```bash
python3.12 -m venv .local/curriculum-venv
. .local/curriculum-venv/bin/activate
python -m pip install -r requirements-curriculum.txt
# Chỉ cho lab PyTorch; CPU wheel từ index chính thức, giữ kiểm tra TLS:
python -m pip install torch==2.14.1+cpu --index-url https://download.pytorch.org/whl/cpu
export OMP_NUM_THREADS=1 OPENBLAS_NUM_THREADS=1 MPLBACKEND=Agg
export XDG_CACHE_HOME="$PWD/.local/cache"
export MPLCONFIGDIR="$PWD/.local/cache/matplotlib"
python scripts/run_lesson_code.py
python scripts/gen_labs.py
python scripts/gen_project_notebooks.py
python scripts/check_content.py
python scripts/audit_spec.py
# Cần một web server fixture đang chạy và Chromium đã cài:
# E2E_BASE_URL=http://localhost:3127 node scripts/check_pyodide.mjs
```

Đã chạy trên Python 3.12.14, NumPy 2.3.5, pandas 2.2.3, Matplotlib 3.10.8, scikit-learn 1.8.0, PyTorch 2.14.1+cpu, một CPU thread. Không hứa bitwise giống mọi OS/phiên bản. CPU PyTorch wheel tải trong phiên kiểm tra khoảng 196,3 MB; đây là download thư viện, không phải dataset. Phiên bản package JavaScript và schema Prisma không thay đổi trong audit này.

`gen_labs.py` chạy toàn bộ biến thể trong registry, dừng khi có lỗi và chỉ ghi expected stdout/notebook sau khi tất cả đạt. `gen_project_notebooks.py` thực thi từng ô notebook dự án trong process riêng cho từng notebook; source cell là nguồn chính, không còn generator tĩnh bỏ sót dự án thứ tám. Các notebook lab có code giống file Python và stdout thực đo. Notebook transfer gọi script CNN trong repository nên phải mở từ gốc checkout; tải riêng một notebook đó không chứa toàn bộ dependencies. Các runner không phải sandbox cho code không đáng tin; chỉ chạy source đã review trong repository.

Code PyTorch không có nút Run giả trên web. Sáu lab NumPy/scikit-learn có Web Worker/Pyodide thật, cần Internet tải CDN và WASM; thư viện trong Pyodide khác bản native pin ở trên nên stdout tham khảo có thể lệch. Không có hệ thống tự chấm bài tập Python. Quiz trắc nghiệm được chấm bằng API hiện có; lời giải tự luận/rubric nằm trong Markdown.

## Dữ liệu và đầu ra

| Thực nghiệm | Dữ liệu | Tải dataset lúc chạy | Phân chia/giới hạn |
|---|---|---:|---|
| Softmax, LDA, autoencoder | Iris, 150 mẫu × 4; [UCI](https://archive.ics.uci.edu/dataset/53/iris), tích hợp sklearn | 0 byte | Softmax/LDA 105/45; AE 90/30/30; scaler chỉ train |
| CNN, transfer | Digits, 1.797 ảnh xám 8×8, 10 lớp; [UCI optical digits](https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits), tích hợp sklearn | 0 byte | 1.149/288/360; transfer cùng miền, nhiệm vụ parity |
| Notebook Breast Cancer | 569 × 30; [UCI](https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic), tích hợp sklearn | 0 byte | Ác tính đổi thành positive=1; thực hành, không chẩn đoán |
| Notebook diabetes | 442 × 10; tích hợp sklearn | 0 byte | Holdout; không chọn mô hình bằng test |
| Pipeline bảng | 500 hàng hỗn hợp tự sinh seed 7 | 0 byte | 375 train/125 test; CV/pipeline bên trong train |
| GRU | 960 điểm sin+nhiễu tự sinh seed 23 | 0 byte | 628/160/160 cửa sổ theo thời gian; one-step rolling |
| Recommender | 30 user × 24 item, rating tổng hợp seed 31 | 0 byte | 504/108/108 cặp; warm start, không phải MovieLens |
| Notebook văn bản | 40 câu tự biên soạn | 0 byte | F1 CV rất yếu; không gọi là benchmark NLP |

Các URL UCI ở trên ghi nguồn gốc để người học tra cứu; license upstream của dataset chưa được kiểm chứng trực tiếp trong phiên này. Không gán license phần mềm scikit-learn cho dataset, không đưa bản sao CSV/ảnh vào repository. Dữ liệu tổng hợp không chứa thông tin cá nhân. Những toy example XOR/attention/shape kiểm tra cơ chế, không được mô tả như chất lượng mô hình trên dữ liệu thật.

Lab ghi checkpoint/learning curves/plot vào `.local/curriculum-output` mặc định (được gitignore); có thể đặt `ML_ACADEMY_OUTPUT_DIR=/tmp/my-experiment` để tách các lần chạy. Chỉ nạp checkpoint do chính lab tạo; `weights_only=True` cho PyTorch. Không dùng checkpoint/joblib không đáng tin. Matplotlib dùng backend Agg trong runner; plot pipeline lưu `missing-train.png`. Các con số quan sát được ghi trong registry và [audit](curriculum-audit.md); không dùng test để tiếp tục tune hyperparameter.

Hai block `python snippet` không chạy độc lập: API FastAPI cần model đã huấn luyện, torchvision cần package/weights bên ngoài. Runner compile cú pháp và báo `context-only`, không tính chúng là đã thực thi. Transformer có forward, padding/causal mask và backward CPU, chưa có thí nghiệm huấn luyện ngôn ngữ. VAE/GAN/diffusion ở mức giới thiệu Advanced, chưa có benchmark huấn luyện.

Trong cloud này Chromium thiếu CA proxy nên truy cập CDN trực tiếp báo `ERR_CERT_AUTHORITY_INVALID`. Lượt kiểm tra thành công dùng `scripts/check_pyodide.mjs --trusted-proxy-download`: Python tải nguyên bản tài nguyên CDN chính thức với TLS và platform CA, rồi test fixture chuyển nguyên bytes cho browser; không tắt kiểm tra chứng chỉ và không sửa code/WASM. Cả 12 biến thể của 6 lab Pyodide đã chạy và khớp expected stdout. Bằng chứng asset SHA-256 và stdout nằm trong `curriculum-pyodide-execution.json`; đây không phải kiểm tra CDN/TLS trực tiếp từ Chromium.

Hai ví dụ Transformer CPU kiểm tra encoder và encoder–decoder/cross-attention với target shift và masks, có backward và invariant không nhìn token tương lai. Ví dụ serving Iris trong `model-deployment.md` đã gọi HTTP loopback thật, xác minh input hợp lệ 200/input sai shape 400 và artifact reload. Chúng không phải mô hình ngôn ngữ hay server public production.

## Kiểm tra notebook bằng kernel thật

Generator lưu output từ Python CLI, không thay thế việc mở notebook trong IPython. Independent final review đã tìm và sửa lỗi argparse đọc nhầm tham số `-f` của kernel ở CNN/transfer. Trong notebook, CNN dùng mặc định không augmentation; để chạy biến thể augmentation dùng lệnh terminal đã ghi ở bài CNN.

```bash
python -m pip install -r requirements-curriculum-test.txt
python scripts/check_curriculum_math.py
python scripts/check_notebooks.py --report docs/curriculum-notebook-execution.json
```

Runner dùng interpreter hiện tại để khởi động kernel riêng cho mỗi notebook, kiểm tra schema và thứ tự cell, so stdout với bản ghi hiện có rồi đóng kernel. Nó không sửa notebook/expected output. Output/checkpoint/cache nằm trong thư mục tạm; source transfer vẫn cần repository root. Bộ dependency test này không được cài vào Docker web service. Xem [final review](curriculum-final-review.md) về lỗi đã sửa và kết quả thực tế.
