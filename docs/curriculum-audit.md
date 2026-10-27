# Audit giáo trình ML Academy

**PASS trong phạm vi nội dung và kiểm thử đã xác minh — 2026-10-26.** Chương trình được bổ sung thực chất, không chỉ thêm tiêu đề. Kiểm tra liên kết còn **BLOCKED 7/78** request bị hủy bởi môi trường; không tuyên bố tất cả nguồn/trọng số/dataset đã được xác minh. Các giới hạn học thuật và vận hành nằm cuối báo cáo.

Baseline `5b88b1889456fecfa06fa2c4921f5abe15a72a24`, branch `main`. Tất cả thay đổi ở working tree; không commit/push/merge, không triển khai cloud, không dịch vụ trả phí, không migration production. Database production không được truy cập.

## Phương pháp và nguồn dữ liệu thực tế

Inventory và coverage **trước sửa** đã hoàn tất trước khi ghi nội dung mới. Đã đọc toàn bộ 50 Markdown, 103 câu quiz, catalog, schema, seed, API và frontend; chạy 50 block có output chuẩn và xác minh 50 route ở database riêng. Snapshot có hash và fixture DB ID trong [inventory trước](curriculum-inventory-before.json); stable ID sử dụng slug, không lấy ID Prisma ngẫu nhiên của fixture làm ID production.

`content/catalog.json` đăng ký metadata mặc định. Database giữ course/module/lesson/quiz, publication, tiêu đề/thứ tự do admin sửa và tiến độ người học. Trang course/detail đọc DB; nội dung lấy từ `LESSON_CONTENT_DIR` override trước, bundled Markdown sau. Đầu audit, search đọc catalog và seed bỏ qua course đã có module, nên chỉ thêm file sẽ không hiện ở DB cũ. Nội dung demo trong lab/Playground khác bài học published; mục lục/tiêu đề không được tính thay bài đầy đủ. Trạng thái ẩn của production không suy diễn từ registry: chỉ quan sát ba course published trong fixture.

Tìm kiếm hiện truy vấn bài thuộc course published trong DB, đọc cả override, phản ánh title admin và không quảng bá bài chưa được thêm/đã ẩn. Direct lesson route kiểm tra publication trước khi đọc Markdown. Với `app/loading.tsx`, Next có thể stream HTTP 200 shell rồi `notFound`; E2E xác nhận trang không tìm thấy và không có nội dung/quiz bị ẩn, không dùng riêng status để kết luận phân quyền.

## Inventory trước sửa

| Chỉ tiêu | Trước | Sau |
|---|---:|---:|
| Tổng slug / Markdown | 50 / 50 | 59 / 59 |
| Track A nền tảng | 8 | 11 |
| Trong Track A: Python/công cụ | 2 | 2 |
| Trong Track A: toán/xác suất/thống kê | 4 | 7 |
| Trong Track A: chuẩn bị dữ liệu/metrics | 2 | 2 |
| Track B: ML | 24 | 26 |
| Track C: DL | 18 | 22 |
| Bài practice (tập con, không cộng vào tổng) | 2 | 6 |
| Lab / biến thể script | 6 / 11 | 13 / 19 |
| Project / notebook project | 8 / 8 | 8 / 8 |
| Tổng notebook: lab + project | 19 | 27 |
| Câu quiz | 103 | 133 |
| Bài có lời giải tự luận/rubric | 0 | 59 |
| Bài dưới 400 từ (chỉ số mô tả) | 40 | 0 |
| Markdown trùng byte / orphan | 0 / 0 | 0 / 0 |
| Block Python: đã chạy / chưa bao phủ hoặc contextual | 50 / 6 chưa được runner cũ bao phủ | 62 / 2 syntax-only |

Track A là cách phân nhóm theo registry, không gọi cả 11 bài là toán thuần. Hai practice cũ là PyTorch/CNN; bốn practice mới là pipeline bảng, CNN CPU, GRU CPU và neural recommender. Lab AE/transfer bổ sung cho bài cũ, không đếm thêm hai chương. Không hợp nhất/xóa slug: ba cặp chồng chủ đề được phân vai và liên kết (probability/statistics; attention/Transformer; PyTorch/fixed CNN/CNN học filters). Mốc 400 từ không phải tiêu chí tự động đánh giá độ sâu.

| ID trước | Track | Từ | Python inline | Quiz | Quan sát/thiếu |
|---|---|---:|---:|---:|---|
| python-ml | python-math | 340 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| numpy-pandas | python-math | 365 | 3 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| vectors-matrices | python-math | 324 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| derivatives | python-math | 262 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| probability | python-math | 320 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| metrics | python-math | 257 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| data-preparation | python-math | 319 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| statistics | python-math | 343 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| ml-intro | ml-fundamentals | 347 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| linear-regression | ml-fundamentals | 183 | 0 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| loss-functions | ml-fundamentals | 345 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| gradient-descent | ml-fundamentals | 538 | 0 | 3 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| polynomial-regression | ml-fundamentals | 297 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| ridge-lasso | ml-fundamentals | 286 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| logistic-regression | ml-fundamentals | 268 | 0 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| softmax-regression | ml-fundamentals | 259 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| knn | ml-fundamentals | 475 | 0 | 3 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| decision-tree | ml-fundamentals | 300 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| naive-bayes | ml-fundamentals | 254 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| svm | ml-fundamentals | 313 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| random-forest | ml-fundamentals | 382 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| k-means | ml-fundamentals | 392 | 0 | 3 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| pca | ml-fundamentals | 249 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| gmm | ml-fundamentals | 344 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| anomaly-detection | ml-fundamentals | 336 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| bias-variance | ml-fundamentals | 487 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| cross-validation | ml-fundamentals | 349 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| feature-leakage | ml-fundamentals | 493 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| recommendation | ml-fundamentals | 373 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| hyperparameter-tuning | ml-fundamentals | 346 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| ml-project-workflow | ml-fundamentals | 367 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| model-deployment | ml-fundamentals | 394 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| perceptron | deep-learning | 256 | 0 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| mlp | deep-learning | 249 | 0 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| backpropagation | deep-learning | 250 | 0 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| optimizers | deep-learning | 378 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| autograd | deep-learning | 457 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| pytorch-practice | deep-learning | 386 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| activations | deep-learning | 314 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| dl-regularization | deep-learning | 515 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| cnn | deep-learning | 331 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| cnn-practice | deep-learning | 514 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| rnn-lstm | deep-learning | 302 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| attention-transformer | deep-learning | 331 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| transformer-architecture | deep-learning | 368 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| autoencoder | deep-learning | 436 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| transfer-learning | deep-learning | 410 | 2 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| gan-vae-diffusion | deep-learning | 360 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| embeddings | deep-learning | 393 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |
| text-classification | deep-learning | 461 | 1 | 2 | HTTP 200, title trong HTML; chưa có lời giải tự luận |

## Coverage matrix đối chiếu

Trạng thái trước là đánh giá thủ công theo nội dung thực tế, không suy từ tên bài. “Đã có đầy đủ” sau sửa nghĩa là bao phủ ở mức **nhập môn/Core hoặc Intermediate tương ứng yêu cầu**, có cơ chế/giả định, ví dụ, lỗi/giới hạn, tự đánh giá và nguồn; không có nghĩa chuyên khảo hay benchmark production. Các chủ đề Advanced chỉ yêu cầu giới thiệu có ranh giới rõ. Công cụ `audit_spec.py` chỉ kiểm tra mapping 52 mục registry lịch sử; không còn gọi sự hiện diện slug là đủ học thuật.

| Mục | Chủ đề | Trước | Sau | Bằng chứng sau sửa |
|---|---|---|---|---|
| A1 | AI/ML/DL, supervised/unsupervised/semi-supervised | Có nhưng thiếu | Đã có đầy đủ | AI⊃ML⊃DL, supervised/unsupervised/semi-supervised, pseudo-label và điều kiện label/shift. |
| A2 | Không gian vector, rank, eigen và SVD | Chưa có | Đã có đầy đủ | Không gian con/span/rank, eigen, SVD và nghiệm least-squares; ví dụ số kiểm tra reconstruction. |
| A3 | Đạo hàm đa biến, gradient, chain rule | Có nhưng thiếu | Đã có đầy đủ | Gradient/Jacobian, chain rule, finite difference và PyTorch backward thực thi. |
| A4 | Xác suất có điều kiện, Bayes, MLE/MAP | Có nhưng thiếu | Đã có đầy đủ | Bayes bằng tần suất; likelihood, Beta-Bernoulli MLE/MAP/mode/mean và prior/regularization. |
| A5 | Objective/loss và trực giác tối ưu | Có nhưng thiếu | Đã có đầy đủ | Mean/sum, objective và loss, hình học/Hessian, điều kiện hội tụ và ví dụ ràng buộc KKT. |
| B1 | OLS, nghiệm suy biến và regularization | Có nhưng thiếu | Đã có đầy đủ | Normal equations/full rank/lstsq, nhiễu và regularization; sửa đường dẫn lab; hai cách cài LR đã chạy. |
| B2 | Batch/SGD/mini-batch và Momentum | Có nhưng thiếu | Đã có đầy đủ | Thí nghiệm batch 1/8/64, 25 epoch với số update khác nhau; Momentum, RMSProp và Adam/AdamW. |
| B3 | Perceptron, logistic, binary, softmax | Có nhưng thiếu | Đã có đầy đủ | Binary/multiclass, loss ổn định, giả định separability; Softmax NumPy và sklearn chạy Iris. |
| B4 | KNN và K-means | Đã có đầy đủ | Đã có đầy đủ | Hai bản scratch/library có output; bổ sung scaling, tính cục bộ, n_init, cluster assumptions và rubric. |
| B5 | Feature engineering/scaling/normalization/selection | Có nhưng thiếu | Đã có đầy đủ | Feature engineering, scaler/encoding/imputer/selection đều fit trong CV; unknown category và missing plot thực đo. |
| B6 | Overfit/underfit/bias-variance/regularization | Có nhưng thiếu | Đã có đầy đủ | Learning/validation curves, bias-variance có điều kiện, early stopping và regularization không chọn theo test. |
| B7 | Hard/soft-margin, hinge, kernel và multiclass SVM | Có lỗi kiến thức | Đã có đầy đủ | Sửa canonical scale của margin; slack/hinge/kernel PSD, OVO/OVR và scaling trong GridSearchCV. |
| B8 | Convex sets/functions và tối ưu có ràng buộc | Chưa có | Đã có đầy đủ | Tập/hàm lồi, Hessian PSD, không duy nhất nghiệm, primal/dual/KKT/Slater và ví dụ nghiệm biên. |
| B9 | PCA/SVD/LDA và giảm chiều | Có nhưng thiếu | Đã có đầy đủ | PCA unsupervised vs LDA supervised, generalized scatter, Gaussian covariance chung; LDA transform/test Iris đã chạy. |
| B10 | Naive Bayes và mô hình xác suất | Có nhưng thiếu | Đã có đầy đủ | Conditional independence, log-space, categorical smoothing khác variance smoothing; MLE/MAP có điều kiện. |
| B11 | Decision Trees và ensembles | Có nhưng thiếu | Đã có đầy đủ | Gini/entropy/regression split, pruning/min_samples; bootstrap/feature sampling, OOB; sửa probability averaging sklearn. |
| B12 | Classification/regression metrics, ROC-AUC, CV/leakage | Có nhưng thiếu | Đã có đầy đủ | ROC-AUC/PR/F1/threshold và regression metrics; stratified/group/time CV; sửa positive label notebook Breast Cancer. |
| B13 | Content/neighborhood/matrix-factorization recommendation | Có nhưng thiếu | Đã có đầy đủ | Content profile/cosine, user/item neighborhood, fallback, observed-only factorization; lab embedding warm-start có baseline/test. |
| B14 | EDA, missing/outliers, encoding và pipeline | Có nhưng thiếu | Đã có đầy đủ | EDA train-only, missing, outlier policy, categorical OHE unknown, feature selection và fold-safe pipeline hoàn chỉnh. |
| C1 | Neuron/layers/forward/tensor shapes | Có nhưng thiếu | Đã có đầy đủ | Neuron/hidden/forward và shape batch; XOR huấn luyện thật, random tensor CNN chỉ kiểm tra interface. |
| C2 | Sigmoid/tanh/ReLU/GELU | Có lỗi kiến thức | Đã có đầy đủ | Sigmoid/tanh/ReLU/GELU; sửa điều kiện norm khi suy luận vanishing gradient, He/Xavier và dead ReLU. |
| C3 | Regression/classification losses | Có nhưng thiếu | Đã có đầy đủ | MSE/MAE/BCE/CE, logits/target contracts; sửa khẳng định cấm MSE cho classification. |
| C4 | Graph/chain rule/backprop/autograd | Có nhưng thiếu | Đã có đầy đủ | Đồ thị, tích lũy gradient, zero_grad, detached graph và backward; ví dụ NumPy/PyTorch đã chạy. |
| C5 | Initialization và vanishing/exploding gradients | Có nhưng thiếu | Đã có đầy đủ | He/Xavier theo fan, symmetry breaking, tích Jacobian có trọng số và gradient diagnostics có assertion. |
| C6 | Batch/epoch/LR/learning curves | Có nhưng thiếu | Đã có đầy đủ | Batch/epoch/step, LR và số update; lab ghi learning curves train/val và chọn checkpoint bằng validation. |
| D1 | SGD/Momentum/RMSProp/Adam/AdamW | Có nhưng thiếu | Đã có đầy đủ | Công thức SGD/Momentum/RMSProp/Adam, bias correction và decoupled AdamW vs L2; CPU optimizer đã chạy. |
| D2 | Scheduling và clipping | Có nhưng thiếu | Đã có đầy đủ | StepLR sau optimizer step, norm clipping sau backward; finite assertions, curves và validation checkpoint. |
| D3 | BatchNorm và LayerNorm | Có nhưng thiếu | Đã có đầy đủ | BatchNorm axes/running stats vs LayerNorm per-sample/token; ví dụ kiểm tra means theo đúng axes. |
| D4 | Dropout/early stopping/regularization | Có nhưng thiếu | Đã có đầy đủ | Drop p vs keep p, train/eval, early stopping theo validation; checkpoint deepcopy và restore. |
| D5 | Split, imbalance và reproducibility | Có nhưng thiếu | Đã có đầy đủ | Seed/thread/version, class imbalance/metric/threshold; train-only preprocessing và chronological split. |
| D6 | Debugging loss/NaN/gradients | Chưa có | Đã có đầy đủ | Debug shape/dtype/label, overfit minibatch, NaN origin, finite gradient/loss và hạn chế clipping. |
| E1 | Images/tensors/convolution 2D | Đã có đầy đủ | Đã có đầy đủ | NCHW/kernel, cross-correlation, fixed-filter demo được phân biệt với CNN thật học weights. |
| E2 | Stride/padding/pooling/receptive field | Có nhưng thiếu | Đã có đầy đủ | Stride/padding/dilation/output shape và công thức receptive field; đếm tham số CNN thực nghiệm. |
| E3 | CNN và kiến trúc tiêu biểu | Có nhưng thiếu | Đã có đầy đủ | Giới thiệu LeNet/VGG/ResNet/residual; CNN nhỏ đã huấn luyện. Không báo benchmark huấn luyện các mạng lớn. |
| E4 | Classification/augmentation/evaluation ảnh | Có nhưng thiếu | Đã có đầy đủ | Digits CPU, split train/val/test; augmentation dịch chỉ train; baseline LogisticRegression và checkpoint reload assertion. |
| E5 | Feature extraction/fine-tuning | Có nhưng thiếu | Đã có đầy đủ | Pretrain train-only, freeze backbone assert không đổi, head adaptation rồi LR groups fine-tune; parity cùng miền. |
| E6 | Thực nghiệm ảnh nhỏ CPU | Chưa có | Đã có đầy đủ | 1797 ảnh 8×8 tích hợp, download0; CNN .95 vs linear .9639, augmentation .9222, số thực đo một split. |
| F1 | Embedding và biểu diễn chuỗi | Có nhưng thiếu | Đã có đầy đủ | ID lookup, learned embedding/one-hot relation, cosine/OOV và representation objective; không gán nghĩa cố định từng chiều. |
| F2 | RNN/BPTT/LSTM/GRU | Có nhưng thiếu | Đã có đầy đủ | RNN/BPTT, cell/gates LSTM, GRU convention và hidden detach; dự báo sin one-step CPU với time split. |
| F3 | Attention/self-attention/Transformer | Có nhưng thiếu | Đã có đầy đủ | Q/K/V, scaled attention, multihead/residual/FFN, causal/padding masks; PyTorch forward/backward và future-token invariant. |
| F4 | Position/encoder/decoder/masking | Có nhưng thiếu | Đã có đầy đủ | Position sinusoid, encoder/decoder/cross-attention, target shift, causal/padding masks. Hai ví dụ encoder và encoder–decoder có backward và future-token invariant đã chạy; không huấn luyện language model hoàn chỉnh. |
| F5 | Text classification hoặc sequence prediction có thể chạy | Có nhưng thiếu | Đã có đầy đủ | TF-IDF classification toy có CV trung thực; GRU CPU train/val/test và persistence baseline đã chạy. |
| G1 | Autoencoder/latent/representation learning | Có nhưng thiếu | Đã có đầy đủ | Sửa điều kiện linear AE/PCA; nonlinear AE trên Iris train/val/test, standardized reconstruction và PCA cùng scale. |
| G2 | Neural recommendation/embedding | Chưa có | Đã có đầy đủ | Embedding user/item+bias train bằng PyTorch, observed loss và warm-start assertion; rating vs ranking/cold start. |
| G3 | AE/VAE/GAN/diffusion nhập môn | Có nhưng thiếu | Đã có đầy đủ | Mức giới thiệu Advanced: AE khác VAE/ELBO, GAN minimax/non-saturating, diffusion forward/reverse và numeric toy; không tuyên bố benchmark huấn luyện. |
| G4 | Evaluation/save/load/inference/deployment | Có nhưng thiếu | Đã có đầy đủ | Checkpoint CPU save/load/reload assertion; Pipeline Iris + artifact riêng + HTTP loopback inference thật với valid200/invalid400. FastAPI/torchvision vẫn là contextual snippets, không phải production serving. |

Phân tích thiếu/lỗi ban đầu và nguồn đối chiếu từng mục được giữ trong [coverage JSON](curriculum-coverage.json), không bị ghi đè bởi kết luận sau sửa.

## Thay đổi học thuật và bài mới

Đã mở rộng **cả 50 bài cũ** bằng điều kiện áp dụng/cơ chế, hạn chế và lời giải riêng cho bài tập thực tế, rubric 2/3/5 điểm. Sửa margin SVM cần canonical scale, gradient sigmoid cần norm weights, linear AE/PCA cần tối ưu/centered/squared loss, MSE không bị cấm cho classification, RF sklearn average probability, keep/drop probability, AdamW/L2, normalization axes và positive label Breast Cancer. Tám quiz cũ được sửa hoặc bổ sung ba câu kiểm tra các hiểu nhầm; không xóa câu hỏi/test. Notebook Breast Cancer đổi positive=1 thành ác tính và chạy lại thật; notebook anomaly ghi rõ đánh giá in-sample toy, không gọi là generalization.

| Slug mới | Track | Tầng | Nội dung/thực hành |
|---|---|---|---|
| linear-algebra-decompositions | python-math | Core | Không gian vector, trị riêng và SVD |
| bayesian-estimation | python-math | Core | Bayes, Maximum Likelihood và MAP |
| convex-optimization | python-math | Intermediate | Tập lồi, hàm lồi và điều kiện tối ưu |
| lda | ml-fundamentals | Intermediate | Linear Discriminant Analysis: giảm chiều có giám sát |
| tabular-pipeline | ml-fundamentals | Core | Thực hành dữ liệu bảng: EDA, encoding và pipeline |
| training-diagnostics | deep-learning | Core | Chẩn đoán huấn luyện: khởi tạo, gradient và normalization |
| cnn-cpu | deep-learning | Intermediate | Thực hành CNN thật trên CPU với Digits |
| sequence-models-cpu | deep-learning | Intermediate | Thực hành GRU: dự báo chuỗi trên CPU |
| neural-recommendation | deep-learning | Advanced | Thực hành recommender với embedding học được |

Thêm Softmax scratch/library và sáu lab local: pipeline bảng, CNN học filters, GRU, neural factorization, AE và transfer. Notebook lab được sinh từ code đã chạy với stdout thật; generator dừng khi có lỗi, không ghi null rồi coi đạt. Generator project dùng source cell của cả tám notebook, không làm rơi notebook thứ tám do danh sách tĩnh. Hai block `python snippet` (FastAPI, torchvision weights) được compile cú pháp nhưng không thực thi; runner liệt kê riêng.

Ví dụ độc lập mới còn kiểm tra mini-batch budget, LDA, normalization/finite gradient, Transformer encoder và encoder–decoder với position/masks/teacher forcing/cross-attention/backward và invariant prefix. Serving Iris fit pipeline, lưu/nạp artifact riêng rồi gọi HTTP loopback thật, xác minh valid200/invalid shape400; không mở server public.

Tầng học: **32 Core, 24 Intermediate, 3 Advanced**. `tier` là vai trò ưu tiên, khác `level` độ khó. Tất cả prerequisites duy nhất, hợp lệ, không chu trình và đứng trước bài phụ thuộc trong catalog mới. `minutes` là ước lượng biên soạn, không phải thời gian học đo từ người dùng.

## Tích hợp và bảo toàn dữ liệu

Không thay Prisma schema, migration, authentication/session, dependency JavaScript, Dockerfile hoặc cấu hình triển khai nền tảng cũ. Final review thêm publication guard ở API quiz: hidden/missing quiz trả404; cấu trúc request/response cho quiz public giữ nguyên. Fresh bootstrap tạo đủ 59 bài/133 câu hỏi. Manual seed bây giờ reconcile thiếu theo slug, module stable key/lesson anchors/title; chỉ append mới, không sửa title/order/quiz/module membership/role/password của record cũ. Module admin đổi tên vẫn tìm qua anchors. Startup của database đã tồn tại **không tự seed/migrate**.

Regression 50→59 dùng DB tạm và cây module cũ dựng từ inventory ban đầu: sửa module/lesson, thêm admin/progress/note/bookmark/attempt/override, seed mới hai lần; so toàn bộ 50 lesson records, module records, questions/IDs, users và quan hệ. Không bị nhân bản bài mới hoặc mất chỉnh sửa. Test persistence hiện có tiếp tục kiểm tra startup/restart và database bytes không đổi.

Với DB đang sử dụng, phải backup và thử manual seed trên bản sao trước khi vận hành chủ động áp dụng. Thứ tự admin đã tùy chỉnh được giữ, nên cây DB cũ không tự bị sắp lại theo DAG mới; UI có liên kết tiên quyết. Override Markdown và quiz/source DB cũ **được giữ nguyên**, không tự nhận bản biên soạn mới; cần đối chiếu thủ công qua admin để không ghi đè chỉnh sửa. Tiến độ đã hoàn thành giữ nguyên ID; tỷ lệ phần trăm có thể giảm vì thêm bài vào mẫu số, không phải reset tiến độ.

## Kiểm thử thực tế

| Lệnh/kiểm tra | Kết quả thực tế |
|---|---|
| `npm run verify` (gồm typegen, strict TypeScript, `npm test`) | PASS: 35 test, 0 fail; có regression curriculum/seed/search/publication và bộ persistence/auth có sẵn |
| `python scripts/check_content.py` | PASS: 59 records; metadata, DAG/order, giữ slug cũ, files/quiz/link nội bộ/sections/math delimiter, 46 coverage mappings hợp lệ |
| `python scripts/audit_spec.py` | PASS: 52/52 mapping registry lịch sử; không tự xác nhận chất lượng |
| `python scripts/run_lesson_code.py` bằng môi trường pin CPU | PASS: 62 standalone blocks; 2 contextual compile-only được liệt kê riêng |
| `python scripts/gen_labs.py` | PASS: 13 labs / 19 variants, có stdout + hash/version trong registry, không có expected null |
| `python scripts/gen_project_notebooks.py` | PASS: 8 notebook, mọi code cell thực thi, output lưu từ lần chạy thật |
| `python scripts/check_notebooks.py` | PASS: 27 notebook bằng kernel IPython mới; schema/thứ tự/source/recorded stdout, không regenerate expected |
| `python scripts/check_curriculum_math.py` | PASS: 3 numerical regression về Ridge thiếu hạng, CV/refit và sigmoid full gradient |
| `python labs/cnn_cpu/library.py --augment` | PASS: accuracy .9222, reload assertion; không khẳng định augmentation cải thiện |
| `npx prisma validate`, `npx prisma generate` | PASS: Prisma/client 5.20.0, không bỏ checksum/TLS |
| `npm run build` | PASS: production compile, TypeScript và page generation thành công |
| `npm run e2e` với server production và DB tạm riêng | PASS: 7 test; 59 trang DOM/133 câu quiz chấm đúng và giải thích, course filter/navigation/prerequisites/download, completion mới, hidden pages/search/API quiz404/no leak/no attempt và luồng cũ |
| `node scripts/check_pyodide.mjs --trusted-proxy-download` | PASS: 6 browser labs / 12 variants, WASM thật, khớp expected stdout; giới hạn transport CA bên dưới |
| Docker build từ Dockerfile hiện có | PASS với proxy hostname được resolve + BuildKit CA secret của cloud; không tắt TLS/checksum |
| `python scripts/smoke-container.py ml-academy-vn-independent-review` | PASS: health, đăng ký, Secure cookie, authorization, quiz/progress/note/admin edit/search, DB `/data/app.db`; recreate giữ DB/override/users/quan hệ |
| `npm audit --json` | PASS: 0 vulnerabilities; package/lockfile không đổi |
| `NODE_USE_ENV_PROXY=1 npm run check:links -- --report docs/curriculum-links.json` | BLOCKED: 71/78 URL thành công; 7 request bị hủy không có HTTP response (6 arXiv, FastAPI). Đã sửa 5 permalink/URL lỗi thực sự |
| `git diff --check`, review toàn bộ file mới/sửa, scan artifact/secret | PASS: không whitespace error, DB/checkpoint/log/key/private-token bị đưa vào thay đổi |

E2E đầu tiên thiếu browser mặc định, dùng Chromium hệ thống `/usr/bin/chromium` để chạy thật. Test filter LDA phát hiện course search chưa tìm slug, đã sửa tìm cả slug. Test HTTP404 ban đầu không đúng semantics streaming của Next: sửa assertion kiểm tra trang not-found và không lộ nội dung/quiz, không bỏ kiểm tra publication. Docker lần đầu vướng thư mục home read-only, sau đó DNS `proxy`; dùng Docker config trong `/tmp`, `--add-host` hostname proxy hiện có và CA chính thức. Không quy lỗi môi trường thành lỗi source, không đổi Dockerfile để lách kiểm tra.

Python: 3.12.14; NumPy 2.3.5; pandas 2.2.3; Matplotlib 3.10.8; sklearn 1.8.0; torch 2.14.1+cpu; một thread. Tất cả URL nguồn trong registry và Markdown, resource/dataset được kiểm tra (không chỉ catalog); [link receipts](curriculum-links.json) giữ cả URL thành công và bị chặn.

Công cụ nguồn stable sklearn hiện hiển thị 1.9.1, nhưng code được kiểm tra bằng phiên bản pin 1.8.0. Đầu audit 50/50 block cũ có expected đã chạy; runner mới bao phủ thêm các block không có exact expected, và phân biệt syntax-only.

Bằng chứng có thể kiểm tra: [stdout/hash blocks](curriculum-execution.json), [lab registry](../content/labs.json), [project receipts](curriculum-project-execution.json), [Pyodide assets/stdout](curriculum-pyodide-execution.json), [inventory sau và SHA](curriculum-inventory-after.json). E2E chạy database `/tmp/ml-curriculum-e2e-*`, admin env rỗng; không dùng `.env` làm dữ liệu thử nghiệm. Khi tái lập, khởi tạo DB tạm bằng `node scripts/prepare-db.mjs`, chạy production server với `DATABASE_URL` đó, `COOKIE_SECURE=false` chỉ cho localhost và SESSION_SECRET ngẫu nhiên; truyền cùng URL cho E2E và `E2E_BASE_URL`. Bài kiểm tra ẩn course từ chối mutate DB không thuộc fixture này.

## Kết quả thực nghiệm quan trọng

| Thực nghiệm | Quan sát CPU | Diễn giải |
|---|---|---|
| Softmax scratch / library | accuracy .867 / .911 trên 45 test Iris | Loss regularization/solver khác; không kết luận thư viện luôn thắng |
| LDA | shape (45,2), accuracy .978 | LDA dùng nhãn; fit chỉ train, giới hạn C−1 |
| Pipeline bảng | CV AUC .9855, test AUC .9247, F1 .9048; dummy AUC .5 | 500 hàng tổng hợp; không đại diện dữ liệu doanh nghiệp |
| CNN Digits | accuracy .9500; LogisticRegression .9639 | CNN không thắng baseline trên split này |
| CNN augmentation | accuracy .9222 | Dịch ảnh không mặc nhiên bảo toàn chất lượng |
| GRU | test MSE .001828 vs persistence .004598 | Sin tổng hợp, one-step rolling, không forecast nhiều bước |
| Embedding recommendation | RMSE .0392 vs mean .8339 | Dữ liệu sinh low-rank khớp mô hình, warm-start; không phải MovieLens/ranking |
| AE Iris / PCA | standardized test MSE .0279 / .0257 | Cùng scale/split; AE không mặc nhiên tốt hơn PCA |
| Transfer parity | frozen .9167, fine-tune .9306; backbone unchanged khi freeze | Cùng miền Digits, không phải ImageNet transfer khác miền |
| Breast Cancer pipeline notebook | recall ác tính .962, F1 .981; reload identical | Positive class đổi rõ, toy học thuật, không công cụ chẩn đoán |

Không chọn seed/metric đẹp rồi gọi benchmark; các con số là một protocol đã nêu và có giới hạn sample/split. Mọi dataset thực hành mới đều tích hợp thư viện hoặc tự sinh, download dataset lúc chạy bằng 0. Dataset source/license và hướng dẫn thư viện CPU ở [practice](curriculum-practice.md).

## Nguồn đã đọc và giới hạn xác minh

- Yêu cầu đối chiếu: [trang chính](https://machinelearningcoban.com/), [categories](https://machinelearningcoban.com/categories/), [math](https://machinelearningcoban.com/math/), [index](https://machinelearningcoban.com/index/), [TabML bố cục](https://machinelearningcoban.com/tabml_book/ch_intro/main_contents.html). Đầu audit trả 403 nên dùng nguồn Git chính thức; lượt cuối qua Node proxy đã tải và đọc cả năm trang HTTP200. Không sửa lịch sử lần truy cập thất bại thành thành công.
- Git ML cơ bản `tiepvupsu/tiepvupsu.github.io`, revision `886e72d1118fe3c4e0f7964d4b46b6c63579e92e`, CNAME xác nhận website. Đọc index/categories/math và các nguồn thuật toán, SVD/convex/KKT/MLE-MAP/LDA/SVM/recommendation. Permalink MLE/MAP là **2017/07/17**, khác ngày trong tên file nguồn 2017-07-15; đã đối chiếu frontmatter và sửa citation.
- TabML `tiepvupsu/tabml_book`, revision `7517baf05694abb14f09f2c17c896689e9a6ae6d`: mục lục, main contents, pipeline, missing/outliers/categorical và embedding. Không cài/thay project bằng thư viện tabml chưa xác minh phiên bản.
- [D2L](https://d2l.ai/): đọc nguồn chính thức numerical-stability-and-init, GRU, Transformer từ `d2l-ai/d2l-en`. [PyTorch Tutorials](https://pytorch.org/tutorials/): đọc nguồn optimization/saveload từ `pytorch/tutorials` khi docs canonical bị 403. Không suy từ homepage rằng đã đọc toàn bộ sách.
- [CS231n](https://cs231n.stanford.edu/), [convolution](https://cs231n.github.io/convolutional-networks/), [transfer](https://cs231n.github.io/transfer-learning/) đã mở/đọc HTTP200. Các nguồn sklearn Getting Started/Text feature extraction đã mở để thay tutorial URL bị 404.
- Nội dung viết mới bằng tiếng Việt, ví dụ/lab riêng; không copy prose/code/image của nguồn. Giữ citation theo từng bài. Không vendor website/PDF/dataset/weights vào repository. [Source receipts](curriculum-sources.json) ghi lần truy cập, snapshot và hash.

Giới hạn còn lại:

1. Sáu bài báo arXiv và trang FastAPI bị hủy request trong môi trường; không xác nhận trực tiếp toàn văn của chúng. Hai block contextual FastAPI/torchvision chưa thực thi; serving CPU độc lập và transfer tự pretrain đã kiểm tra, không thay cho triển khai công khai/pretrained ImageNet.
2. Chromium trực tiếp gặp `ERR_CERT_AUTHORITY_INVALID` với CA proxy. Browser test thành công nhận nguyên bytes CDN chính thức qua Python TLS/platform CA trong test fixture. Không bật ignore-certificate-errors, không thay code/WASM; đây **không phải** kiểm tra kết nối CDN/TLS trực tiếp của Chromium. Phiên bản Pyodide khác native; cả 12 biến thể đã khớp trong lượt này.
3. Giấy phép upstream từng dataset/trọng số ngoài chưa được kiểm chứng trực tiếp. Không tải thêm dataset, không tái phân phối CSV/ảnh/weights. Không gán license phần mềm cho dataset. Trước phân phối ngoài dự án cần xác minh quyền sử dụng tương ứng.
4. Transformer/AE/VAE/GAN/diffusion thuộc mức giới thiệu/cơ chế tương ứng. Transformer kiểm tra encoder–decoder/gradient/masks, chưa huấn luyện mô hình ngôn ngữ lớn hoặc benchmark autoregressive. Chưa có benchmark huấn luyện VAE/GAN/diffusion; điều này nằm ngoài phần Core được ưu tiên và đã ghi ngay trong bài Advanced.
5. Các metric là một split/seed nhỏ, chưa có CI/nhiều seed hoặc đánh giá ngoài miền. Transfer cùng miền, recommendation rating completion chưa đánh giá top-k/cold-start, anomaly notebook in-sample chỉ minh họa. Không quảng bá chúng thành hệ thống ML production.
6. DB/admin overrides hiện hữu cần review thủ công khi áp dụng nội dung mới; không tự ghi đè để làm số lượng/độ phủ production trông giống fixture. Chưa có CI/GitHub run mới vì không push trong phạm vi task này.

## Independent final review

Đã đọc/kiểm thử lại độc lập, tìm và sửa lỗi notebook CNN/transfer trong kernel thật, rò đáp án quiz của course ẩn qua API và các diễn giải/quiz thiếu điều kiện. Lượt trước chạy notebook source qua Python CLI chưa đủ chứng minh Jupyter chạy được. Sau sửa, 27 notebook qua kernel IPython mới đều đạt; 35 Node test, 3 numerical regression và E2E kiểm tra đủ59 DOM/133 câu quiz cùng quyền API. Chi tiết file/dòng, cách tái hiện và giới hạn tại [curriculum-final-review.md](curriculum-final-review.md), bằng chứng kernel thật ở [JSON](curriculum-notebook-execution.json).

## File thay đổi

Tổng **151 file** so với baseline: 96 sửa, 55 mới. Bắt đầu independent review là143 file; các file bổ sung là sửa lỗi và regression/evidence được ghi trong final review. Không xóa file. Danh sách đầy đủ có trạng thái ở [curriculum-changes.json](curriculum-changes.json); inventory 59 bài sau sửa ở [JSON](curriculum-inventory-after.json).

Các nhóm chính: toàn bộ 50 Markdown cũ + 9 bài mới; 8 quiz cũ + 9 quiz mới; catalog/lab registry; 8 script lab mới; 27 notebook; seed add-only; search/publication/prerequisites/lab/course filtering; 9 script validation/generation; unit/integration/E2E; README/deployment note và các tài liệu/receipt audit. Các file triển khai/schema/dependency hiện có được giữ nguyên.

<details>
<summary>Danh sách từng file</summary>

- `README.md` — modified
- `content/catalog.json` — modified
- `content/labs.json` — modified
- `content/lessons/activations.md` — modified
- `content/lessons/anomaly-detection.md` — modified
- `content/lessons/attention-transformer.md` — modified
- `content/lessons/autoencoder.md` — modified
- `content/lessons/autograd.md` — modified
- `content/lessons/backpropagation.md` — modified
- `content/lessons/bayesian-estimation.md` — new
- `content/lessons/bias-variance.md` — modified
- `content/lessons/cnn-cpu.md` — new
- `content/lessons/cnn-practice.md` — modified
- `content/lessons/cnn.md` — modified
- `content/lessons/convex-optimization.md` — new
- `content/lessons/cross-validation.md` — modified
- `content/lessons/data-preparation.md` — modified
- `content/lessons/decision-tree.md` — modified
- `content/lessons/derivatives.md` — modified
- `content/lessons/dl-regularization.md` — modified
- `content/lessons/embeddings.md` — modified
- `content/lessons/feature-leakage.md` — modified
- `content/lessons/gan-vae-diffusion.md` — modified
- `content/lessons/gmm.md` — modified
- `content/lessons/gradient-descent.md` — modified
- `content/lessons/hyperparameter-tuning.md` — modified
- `content/lessons/k-means.md` — modified
- `content/lessons/knn.md` — modified
- `content/lessons/lda.md` — new
- `content/lessons/linear-algebra-decompositions.md` — new
- `content/lessons/linear-regression.md` — modified
- `content/lessons/logistic-regression.md` — modified
- `content/lessons/loss-functions.md` — modified
- `content/lessons/metrics.md` — modified
- `content/lessons/ml-intro.md` — modified
- `content/lessons/ml-project-workflow.md` — modified
- `content/lessons/mlp.md` — modified
- `content/lessons/model-deployment.md` — modified
- `content/lessons/naive-bayes.md` — modified
- `content/lessons/neural-recommendation.md` — new
- `content/lessons/numpy-pandas.md` — modified
- `content/lessons/optimizers.md` — modified
- `content/lessons/pca.md` — modified
- `content/lessons/perceptron.md` — modified
- `content/lessons/polynomial-regression.md` — modified
- `content/lessons/probability.md` — modified
- `content/lessons/python-ml.md` — modified
- `content/lessons/pytorch-practice.md` — modified
- `content/lessons/random-forest.md` — modified
- `content/lessons/recommendation.md` — modified
- `content/lessons/ridge-lasso.md` — modified
- `content/lessons/rnn-lstm.md` — modified
- `content/lessons/sequence-models-cpu.md` — new
- `content/lessons/softmax-regression.md` — modified
- `content/lessons/statistics.md` — modified
- `content/lessons/svm.md` — modified
- `content/lessons/tabular-pipeline.md` — new
- `content/lessons/text-classification.md` — modified
- `content/lessons/training-diagnostics.md` — new
- `content/lessons/transfer-learning.md` — modified
- `content/lessons/transformer-architecture.md` — modified
- `content/lessons/vectors-matrices.md` — modified
- `content/quizzes/activations.json` — modified
- `content/quizzes/autoencoder.json` — modified
- `content/quizzes/bayesian-estimation.json` — new
- `content/quizzes/cnn-cpu.json` — new
- `content/quizzes/convex-optimization.json` — new
- `content/quizzes/dl-regularization.json` — modified
- `content/quizzes/feature-leakage.json` — modified
- `content/quizzes/hyperparameter-tuning.json` — modified
- `content/quizzes/lda.json` — new
- `content/quizzes/linear-algebra-decompositions.json` — new
- `content/quizzes/loss-functions.json` — modified
- `content/quizzes/neural-recommendation.json` — new
- `content/quizzes/random-forest.json` — modified
- `content/quizzes/sequence-models-cpu.json` — new
- `content/quizzes/svm.json` — modified
- `content/quizzes/tabular-pipeline.json` — new
- `content/quizzes/training-diagnostics.json` — new
- `docs/curriculum-audit.md` — new
- `docs/curriculum-changes.json` — new
- `docs/curriculum-coverage.json` — new
- `docs/curriculum-execution.json` — new
- `docs/curriculum-final-review.md` — new
- `docs/curriculum-inventory-after.json` — new
- `docs/curriculum-inventory-before.json` — new
- `docs/curriculum-links.json` — new
- `docs/curriculum-notebook-execution.json` — new
- `docs/curriculum-practice.md` — new
- `docs/curriculum-project-execution.json` — new
- `docs/curriculum-pyodide-execution.json` — new
- `docs/curriculum-sources.json` — new
- Runbook triển khai nền tảng cũ — modified (đã thay bằng self-hosted runbook trong đợt tiếp theo).
- `e2e/curriculum.spec.ts` — new
- `labs/autoencoder_cpu/library.py` — new
- `labs/cnn_cpu/library.py` — new
- `labs/neural_recommendation/library.py` — new
- `labs/sequence_cpu/library.py` — new
- `labs/softmax_regression/library.py` — new
- `labs/softmax_regression/scratch.py` — new
- `labs/tabular_pipeline/library.py` — new
- `labs/transfer_cpu/library.py` — new
- `prisma/seed-data.ts` — modified
- `public/notebooks/autoencoder_cpu_library.ipynb` — new
- `public/notebooks/cnn_cpu_library.ipynb` — new
- `public/notebooks/kmeans_library.ipynb` — modified
- `public/notebooks/kmeans_scratch.ipynb` — modified
- `public/notebooks/knn_library.ipynb` — modified
- `public/notebooks/knn_scratch.ipynb` — modified
- `public/notebooks/linear_regression_library.ipynb` — modified
- `public/notebooks/linear_regression_scratch.ipynb` — modified
- `public/notebooks/logistic_regression_library.ipynb` — modified
- `public/notebooks/logistic_regression_scratch.ipynb` — modified
- `public/notebooks/mlp_torch_library.ipynb` — modified
- `public/notebooks/neural_recommendation_library.ipynb` — new
- `public/notebooks/perceptron_library.ipynb` — modified
- `public/notebooks/perceptron_scratch.ipynb` — modified
- `public/notebooks/projects/du-doan-chi-so-tieu-duong.ipynb` — modified
- `public/notebooks/projects/nhan-dang-chu-so.ipynb` — modified
- `public/notebooks/projects/phan-cum-khach-hang.ipynb` — modified
- `public/notebooks/projects/phan-loai-cam-xuc.ipynb` — modified
- `public/notebooks/projects/phan-loai-ung-thu-vu.ipynb` — modified
- `public/notebooks/projects/phat-hien-bat-thuong-log.ipynb` — modified
- `public/notebooks/projects/pipeline-hoan-chinh.ipynb` — modified
- `public/notebooks/projects/so-sanh-mo-hinh.ipynb` — modified
- `public/notebooks/sequence_cpu_library.ipynb` — new
- `public/notebooks/softmax_regression_library.ipynb` — new
- `public/notebooks/softmax_regression_scratch.ipynb` — new
- `public/notebooks/tabular_pipeline_library.ipynb` — new
- `public/notebooks/transfer_cpu_library.ipynb` — new
- `requirements-curriculum-test.txt` — new
- `requirements-curriculum.txt` — new
- `scripts/audit_spec.py` — modified
- `scripts/check_content.py` — modified
- `scripts/check_curriculum_math.py` — new
- `scripts/check_links.mjs` — modified
- `scripts/check_notebooks.py` — new
- `scripts/check_pyodide.mjs` — new
- `scripts/gen_labs.py` — modified
- `scripts/gen_project_notebooks.py` — modified
- `scripts/run_lesson_code.py` — modified
- `src/app/api/quiz/route.ts` — modified
- `src/app/courses/page.tsx` — modified
- `src/app/lab/page.tsx` — modified
- `src/app/learn/[slug]/page.tsx` — modified
- `src/app/search/page.tsx` — modified
- `src/components/lab/CodeLab.tsx` — modified
- `src/lib/content.ts` — modified
- `src/lib/publishedContent.ts` — new
- `tests/curriculum.test.ts` — new
- `tests/persistence.test.ts` — modified

</details>

## Bổ sung: math rendering và trải nghiệm đọc (2026-10-26)

Lượt mới bắt đầu từ commit `19596bc`, giữ 59 bài, 133 quiz, 13 lab và 27 notebook. Đã chuẩn hóa 49 Markdown và 42 file quiz; có 56 display equations thật thay cho cách viết delimiter cùng dòng trước đó. Renderer dùng chung cho bài học/quiz/lời giải/mô tả lab, có MathML và kiểm thử SSR/browser. Sửa/làm rõ convention MSE, AdamW/data loss, giả định scale attention, giới hạn PCA/K-means và ý nghĩa penalty SVM. Không thay schema/seed hoặc tự ghi đè dữ liệu admin.

Kết quả và giới hạn của lượt này ở [math-rendering-audit.md](math-rendering-audit.md); [SSR inventory](math-rendering-content.json), [link receipts](math-rendering-links.json) và mục `math_rendering_review_access` trong [source registry](curriculum-sources.json). Các bảng kiểm thử và inventory trước đó ở tài liệu này là snapshot lịch sử, không tự trở thành bằng chứng của lượt mới. Lần hiện tại: 42 Node test, 6 numerical regression, 9 E2E, 63 standalone blocks (2 contextual compile-only), 27 kernel notebook; TypeScript/Prisma/build đạt. Link check còn 7/80 request bị môi trường hủy; không ghi nhận PASS cho URL chưa xác minh.
