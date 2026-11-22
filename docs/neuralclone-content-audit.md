# Kiểm toán nội dung NeuralClone

> Rà soát sâu tiếp ngày **28/10/2026**: không thêm bài hoặc quiz chỉ để tăng số lượng. Đã làm rõ bốn điều kiện còn thiếu: tổng chi phí FP/FN phải dương khi dùng công thức ngưỡng; NLL cần ít nhất một target hợp lệ; Recall không xác định khi không có nguồn relevant; định nghĩa differential privacy lượng hóa trên mọi cặp dataset kề nhau và mọi tập đầu ra đo được. Cả tám bài/24 câu mới đã được đọc lại; 11 Python fences được chạy lại. Xem [final polish](neuralclone-final-polish.md) cho kết quả mới, tách khỏi baseline ngày 27/10 dưới đây.

Ngày đối chiếu nguồn: **27/10/2026**. Phạm vi gồm catalog, toàn bộ Markdown đang đăng ký, quiz, lab Python/notebook, dự án, dataset, tài liệu và nội dung database local. Đây là đánh giá giáo trình hiện có, không phải tuyên bố đã khảo sát mọi công trình ML/DL đến tháng 10/2026.

## Baseline và phương pháp

Trước đợt này: **3 track, 59 bài, 133 câu quiz, 13 lab, 27 notebook, 8 dự án, 4 dataset, 8 tài liệu**. [Inventory trước sửa](neuralclone-content-inventory-before.json) lưu slug, tên, prerequisites, headings, công thức, hash, số quiz của từng bài. Đọc nội dung và điều kiện áp dụng, không chỉ đếm tên chủ đề. Đối chiếu DB/schema với catalog, kiểm tra các ví dụ và liên kết; không đọc/xuất mật khẩu, session secret hay `.env` ra báo cáo.

59 bài đã có bao phủ tốt phần nhập môn: Python/NumPy/pandas, toán, ML cổ điển, quy trình đánh giá, mạng neural và một số lab CPU thực sự. Không cần viết lại những phần này. Tuy vậy, “có một mục giới thiệu” không đồng nghĩa đã đào tạo đầy đủ một chuyên môn. Ví dụ diffusion là bài khái niệm/noising; không có bằng chứng đã train một diffusion model.

## Bảng đối chiếu nhóm A–E

| Nhóm/chủ đề cần đối chiếu | Bài đã có trước đợt này | Đánh giá và hành động |
| --- | --- | --- |
| A · Python, NumPy, pandas, trực quan hóa | `python-ml`, `numpy-pandas` | Đủ làm nền cho lab; giữ. Chưa phải khóa Python/pandas toàn diện. |
| A · Vector, ma trận, eigen/SVD | `vectors-matrices`, `linear-algebra-decompositions` | Đã có ví dụ số và điều kiện phân rã; giữ. |
| A · Đạo hàm, gradient, chain rule | `derivatives`, `backpropagation`, `autograd` | Tiến trình từ tay đến autograd hợp lý; giữ. |
| A · Xác suất/thống kê/Bayes/tối ưu lồi | `probability`, `statistics`, `bayesian-estimation`, `convex-optimization` | Có nền tảng và giới hạn; chưa thay được môn suy luận thống kê đầy đủ. |
| A · Preprocessing, feature engineering | `data-preparation`, `feature-leakage`, `tabular-pipeline` | Đã có fit trên train/Pipeline; giữ và dùng làm prerequisite bài mới. |
| B · Linear/Logistic Regression, GD | `linear-regression`, `logistic-regression`, `gradient-descent`, `loss-functions` | Có công thức, code và demo; không tạo bài trùng. |
| B · KNN, Naive Bayes, cây, RF, SVM | `knn`, `naive-bayes`, `decision-tree`, `random-forest`, `svm` | Đã có nền tảng. Khoảng trống quan trọng là boosting, bổ sung `gradient-boosting`. |
| B · K-Means, PCA, GMM, LDA, anomaly | `k-means`, `pca`, `gmm`, `lda`, `anomaly-detection` | Đã có bài và ví dụ; giữ. Không đồng nhất density thấp với “gian lận”. |
| B · CV, tuning, regularization, bias/variance | `cross-validation`, `hyperparameter-tuning`, `ridge-lasso`, `polynomial-regression`, `bias-variance` | Đã có; bài mới tiếp tục giữ test độc lập. |
| B · Metrics, imbalance, leakage | `metrics`, `feature-leakage` | Metrics/leakage có; thiếu phân biệt ranking/calibration/ngưỡng/cost. Thêm `imbalanced-learning`, lab và demo tính thật. |
| C · Perceptron/MLP/activation/backprop/loss | `perceptron`, `activations`, `mlp`, `backpropagation`, `loss-functions` | Có cấu trúc nền tảng; giữ. |
| C · SGD/Momentum/Adam, initialization | `optimizers`, `training-diagnostics` | Có điều kiện áp dụng và gradient diagnostics; chưa cần thêm một bài optimizer trùng. |
| C · Dropout/BN/LN | `dl-regularization`, `training-diagnostics`, `transformer-architecture` | Đã phân biệt batch/feature và train/eval; giữ. |
| C · CNN, transfer learning | `cnn`, `cnn-practice`, `cnn-cpu`, `transfer-learning`, `pytorch-practice` | Có lab phân biệt filter cố định với CNN được train. Không gộp accuracy khác split để tuyên bố ưu thế. |
| C · RNN/LSTM/GRU | `rnn-lstm`, `sequence-models-cpu` | Đã có GRU và split thời gian; giữ. Cần lưu ý convention reset gate giữa công thức và PyTorch. |
| C · Attention/Transformer/embeddings | `attention-transformer`, `transformer-architecture`, `embeddings` | Chia cơ chế với kiến trúc có lý do; bổ sung phân biệt sinusoidal/RoPE và post/pre-norm vào bài kiến trúc. |
| C · Autoencoder/generative/diffusion | `autoencoder`, `gan-vae-diffusion` | Mức nhập môn. Sửa khái quát sắc/mờ/tốc độ thành nhận xét phụ thuộc mô hình, likelihood và sampler. Chưa có lab diffusion end-to-end. |
| D · Tokenization/contextual embedding/LLM | `embeddings`, `text-classification`, `transformer-architecture` | Chưa nối thành chu trình tokenizer → causal loss → inference. Thêm `llm-foundations`. |
| D · Pretraining/SFT/PEFT/LoRA/quantization | Chưa có bài chuyên biệt | Thêm `efficient-finetuning`; kiểm chứng số tham số/merge/quantization toy. Không giả là đã fine-tune model thật. |
| D · RAG/vector search | Chưa có bài chuyên biệt | Thêm `rag-vector-search`: cosine, lexical/dense/hybrid/ANN, recall, ACL, citation. Lab thực thi TF-IDF, không mô phỏng một LLM trả lời. |
| D · Hallucination/evaluation/prompt injection | Chưa có bài chuyên biệt | Thêm `llm-evaluation-security`: rubric, coverage, support, trust boundary, server authorization. Không hứa chống injection tuyệt đối. |
| D · Multimodal | Chưa có bài độc lập | Bổ sung giới thiệu giới hạn ở nền tảng LLM. Hoãn lab/image-language encoder vì chưa có dữ liệu và runtime kiểm chứng phù hợp. |
| E · Tracking/reproducibility/data versioning | `ml-project-workflow`, `pytorch-practice` có seed/quy trình | Thiếu manifest, fingerprint, drift và vận hành. Thêm `mlops-reproducibility`. Không lắp thêm dịch vụ tracking bên ngoài. |
| E · Deployment/inference/monitoring | `model-deployment`, `ml-project-workflow` | Giữ hướng dẫn inference; bổ sung drift khác quality drift, rollout/rollback trong bài MLOps. |
| E · Responsible AI/fairness/privacy/security | Có lưu ý rải rác | Thêm `responsible-ai`: DP/TPR, mẫu số, privacy, model cards/datasheets; nối bài bảo mật LLM. |

## Tám nội dung được ưu tiên

Các bài mới lấp khoảng trống của chính nền tảng, dùng được kiến thức đã học và có ví dụ kiểm chứng nhẹ. Thứ tự này bảo đảm prerequisites có trước trong catalog.

| Bài mới | Vị trí | Lý do chọn |
| --- | --- | --- |
| [Gradient Boosting](../content/lessons/gradient-boosting.md) | Track B → Ensemble và ML có trách nhiệm | Mảnh thiếu giữa cây/RF và thực hành tabular. |
| [Imbalance/calibration/ngưỡng](../content/lessons/imbalanced-learning.md) | Track B, sau metrics/CV/leakage | Ngăn dùng accuracy/ngưỡng 0,5 máy móc; demo và lab có số thật. |
| [MLOps/tái lập/drift](../content/lessons/mlops-reproducibility.md) | Track B, sau workflow/deployment | Nối notebook sang thí nghiệm có nguồn gốc và theo dõi. |
| [Responsible AI](../content/lessons/responsible-ai.md) | Track B, sau metrics/ML workflow | Dạy trade-off bằng ví dụ nhóm nhỏ và quyền dữ liệu. |
| [Nền tảng LLM](../content/lessons/llm-foundations.md) | Track C → LLM: nền tảng, thích nghi và ứng dụng | Phân biệt token/ký tự/byte, causal loss và generation. |
| [LoRA/quantization](../content/lessons/efficient-finetuning.md) | Track C, sau LLM | Kỹ thuật phổ biến nhưng dễ hiểu sai về số tham số/bộ nhớ. |
| [RAG/vector search](../content/lessons/rag-vector-search.md) | Track C, sau LLM/embeddings | Dạy retrieval/evaluation/ACL trước khi thêm generation. |
| [Đánh giá và an toàn LLM](../content/lessons/llm-evaluation-security.md) | Track C, sau RAG/metrics/leakage | Ngăn đồng nhất câu trả lời trôi chảy với đúng/an toàn. |

Mỗi bài có mục tiêu, kiến thức trước, trực giác, công thức, ví dụ, code hoặc pseudocode, hiểu lầm/giới hạn, bài tập, đáp án và nguồn. Đã thêm 24 câu quiz, 8 SVG gốc, 2 lab/notebook. Không thêm số liệu người dùng, benchmark mô hình hoặc thống kê thành tích giả.

## Trùng lặp và nội dung cần cập nhật

Không phát hiện hai Markdown có hash trùng hoàn toàn trong baseline. Vẫn có giao nhau có chủ đích: attention → kiến trúc Transformer → LLM; CNN filter cố định → CNN train CPU; metrics → ngưỡng/calibration. Giữ các URL và phân biệt mục tiêu, không xóa bài chỉ vì cùng thuật ngữ. Đây không phải kiểm tra ngữ nghĩa toàn diện bằng một plagiarism engine.

Đã sửa hai điểm dễ tạo hiểu lầm trong bài cũ: kiến trúc Transformer gốc không đại diện mọi decoder hiện đại; chất lượng/tốc độ VAE/GAN/diffusion không là định luật cố định. Chưa có bằng chứng một API cũ cụ thể đang hỏng trong các lab browser hiện có: 14 biến thể đã chạy thật bằng Pyodide. Các lab PyTorch CPU cũ chưa chạy lại trong interpreter hiện tại vì chưa có Torch; không tuyên bố tương thích mọi phiên bản PyTorch/TensorFlow mới.

## Dự án, dữ liệu, tài liệu và thực hành

| Khu vực | Kiểm tra | Kết quả/hành động |
| --- | --- | --- |
| 8 dự án | Steps, baseline, metric, dataset liên kết và notebook status | Giữ. Các dự án so sánh classifier có giao nhau nhưng khác dataset/mục tiêu. Không đổi URL hay giả trạng thái notebook đã có. Dùng CV/validation chọn cấu hình trước lần test cuối như các bài đánh giá. |
| 4 dataset | Rows/features, loader, nguồn và license | Iris 150×4, BCW 569×30, Diabetes 442×10, Digits 1797×64 phù hợp loader. Sửa lỗi gán BSD-3 của thư viện cho dữ liệu. UCI Iris/BCW có CC BY 4.0; nêu khác biệt bản Iris scikit-learn/UCI. Với Diabetes/Digits chưa xác minh được license riêng, ghi rõ giới hạn thay vì suy đoán. |
| 8 tài liệu thư viện | URL, mô tả, chủ đề | Giữ thư viện gốc; nguồn cập nhật ở cuối bài và catalog. Không thêm mục chỉ để tăng số lượng. |
| Code Lab | Source, expected output, source notebook, runtime | 13 → 15 lab; 14 biến thể browser. Hai lab mới chạy stdlib, không cần tải NumPy. Các lab CPU vẫn chỉ dẫn chạy ngoài browser. |
| Playground | Tính toán và liên kết nội dung | Giữ 6 demo; thêm demo ngưỡng dùng cùng tám điểm, quy tắc `score >= threshold` và công thức cost như lesson/Python. Precision/recall vô định được hiển thị có chủ đích. |
| Tìm kiếm/roadmap/sitemap | DB source và route mới | Thêm hai module ở cuối track, không sắp lại ID/order cũ. Nội dung mới tìm thấy theo LoRA/RAG/calibration/fairness; prerequisites, quiz và sitemap được E2E kiểm tra. |

## Nguồn đối chiếu và mức độ ổn định

- **Nền tảng ổn định:** [Google ML Crash Course](https://developers.google.com/machine-learning/crash-course), [scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html), [common pitfalls](https://scikit-learn.org/stable/common_pitfalls.html). Dùng để đối chiếu các nhóm toán, mô hình, đánh giá và data leakage.
- **Thực hành phổ biến:** [PyTorch tutorials](https://docs.pytorch.org/tutorials/), [TensorFlow tutorials](https://www.tensorflow.org/tutorials), [Hugging Face Learn](https://huggingface.co/learn), [Transformers docs](https://huggingface.co/docs/transformers/index). Đọc cấu trúc hiện hành; không nâng framework hoặc sao chép training script chưa chạy.
- **Công trình gốc/phương pháp:** [LoRA](https://arxiv.org/abs/2106.09685), [QLoRA](https://arxiv.org/abs/2305.14314), [RAG](https://arxiv.org/abs/2005.11401), [RoPE](https://arxiv.org/abs/2104.09864). Nội dung viết lại bằng tiếng Việt với ví dụ tự xây, không trích benchmark làm kết quả của NeuralClone.
- **Lĩnh vực tiếp tục phát triển:** [indirect prompt injection](https://arxiv.org/abs/2302.12173), [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework), [PEFT main docs](https://huggingface.co/docs/peft/main/en/conceptual_guides/lora). Kỹ thuật phòng thủ, rubric và API thay đổi; bài nêu giới hạn và cần test theo threat model cụ thể. URL PEFT stable khảo sát không có trang tương ứng, vì vậy dùng main, không coi API main là cam kết ổn định.

Thêm [Model Cards](https://arxiv.org/abs/1810.03993), [Datasheets](https://arxiv.org/abs/1803.09010), [Dwork–Roth](https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf) cho trách nhiệm/privacy. Giấy phép dataset đối chiếu trực tiếp [UCI Iris](https://archive.ics.uci.edu/dataset/53/iris), [UCI BCW](https://archive.ics.uci.edu/dataset/17/breast+cancer+wisconsin+diagnostic) và [scikit-learn toy datasets](https://scikit-learn.org/stable/datasets/toy_dataset.html). Trang UCI Digits không tải được bằng công cụ web trong lượt này; không gán giấy phép suy đoán.

## Phần còn thiếu có chủ đích

Chưa mở rộng thành khóa RL, causal inference, GNN, time-series chuyên sâu, distributed training, training diffusion hay multimodal end-to-end. Đây là phạm vi bổ sung cần dữ liệu, notebook, phần cứng và evaluation riêng. Cũng chưa có benchmark LLM thực tế, GPU fine-tuning, semantic embedding checkpoint hoặc dịch vụ vector DB. Lab TF-IDF là baseline lexical được ghi rõ, không được quảng bá thành semantic search.

Xem [báo cáo triển khai và kết quả thực chạy](neuralclone-content-update.md) cùng phụ lục inventory bên dưới.

<!-- INVENTORY_APPENDIX -->

## Phụ lục: 59 bài baseline đã rà soát

Không đổi slug, ID, thứ tự và tiến độ của các bài này. “Giữ” nghĩa là tiếp tục dùng trong phạm vi nhập môn đã mô tả, không phải khẳng định chủ đề đã đầy đủ ở mọi cấp độ.

| Track | Bài | Prerequisites | Quiz | Xử lý đợt này |
| --- | --- | --- | --- | --- |
| python-math | [Python cho ML](../content/lessons/python-ml.md) | — | 2 | Giữ |
| python-math | [NumPy, pandas và Matplotlib](../content/lessons/numpy-pandas.md) | python-ml | 2 | Giữ |
| python-math | [Vector và ma trận](../content/lessons/vectors-matrices.md) | numpy-pandas | 2 | Giữ |
| python-math | [Không gian vector, trị riêng và SVD](../content/lessons/linear-algebra-decompositions.md) | vectors-matrices | 3 | Giữ |
| python-math | [Đạo hàm và gradient](../content/lessons/derivatives.md) | vectors-matrices | 2 | Giữ |
| python-math | [Xác suất cơ bản](../content/lessons/probability.md) | python-ml | 2 | Giữ |
| python-math | [Thống kê mô tả và ước lượng tham số](../content/lessons/statistics.md) | probability | 2 | Giữ |
| python-math | [Bayes, Maximum Likelihood và MAP](../content/lessons/bayesian-estimation.md) | probability, statistics | 3 | Giữ |
| python-math | [Tập lồi, hàm lồi và điều kiện tối ưu](../content/lessons/convex-optimization.md) | derivatives, linear-algebra-decompositions | 3 | Giữ |
| python-math | [Chuẩn bị dữ liệu: train/validation/test và dữ liệu thiếu](../content/lessons/data-preparation.md) | numpy-pandas, statistics | 2 | Giữ |
| python-math | [Metrics đánh giá mô hình](../content/lessons/metrics.md) | probability | 2 | Giữ |
| ml-fundamentals | [AI, Machine Learning và Deep Learning](../content/lessons/ml-intro.md) | python-ml | 2 | Giữ |
| ml-fundamentals | [Linear Regression](../content/lessons/linear-regression.md) | vectors-matrices, derivatives, ml-intro | 2 | Giữ |
| ml-fundamentals | [Loss Functions: MSE, MAE, Huber, Cross-Entropy](../content/lessons/loss-functions.md) | linear-regression, probability | 3 | Giữ |
| ml-fundamentals | [Gradient Descent](../content/lessons/gradient-descent.md) | linear-regression, loss-functions, derivatives | 3 | Giữ |
| ml-fundamentals | [Ridge và Lasso](../content/lessons/ridge-lasso.md) | linear-regression, gradient-descent | 2 | Giữ |
| ml-fundamentals | [Polynomial Regression](../content/lessons/polynomial-regression.md) | ridge-lasso | 2 | Giữ |
| ml-fundamentals | [Bias-Variance và Overfitting](../content/lessons/bias-variance.md) | linear-regression, statistics | 2 | Giữ |
| ml-fundamentals | [Logistic Regression](../content/lessons/logistic-regression.md) | gradient-descent, probability, loss-functions | 2 | Giữ |
| ml-fundamentals | [Softmax Regression](../content/lessons/softmax-regression.md) | logistic-regression | 2 | Giữ |
| ml-fundamentals | [KNN](../content/lessons/knn.md) | vectors-matrices, data-preparation, metrics | 3 | Giữ |
| ml-fundamentals | [Decision Tree](../content/lessons/decision-tree.md) | metrics, data-preparation | 2 | Giữ |
| ml-fundamentals | [Naive Bayes](../content/lessons/naive-bayes.md) | bayesian-estimation | 2 | Giữ |
| ml-fundamentals | [SVM](../content/lessons/svm.md) | logistic-regression, convex-optimization | 2 | Giữ |
| ml-fundamentals | [Random Forest](../content/lessons/random-forest.md) | decision-tree | 3 | Giữ |
| ml-fundamentals | [K-Means](../content/lessons/k-means.md) | vectors-matrices | 3 | Giữ |
| ml-fundamentals | [PCA](../content/lessons/pca.md) | linear-algebra-decompositions, data-preparation | 2 | Giữ |
| ml-fundamentals | [Linear Discriminant Analysis: giảm chiều có giám sát](../content/lessons/lda.md) | pca, bayesian-estimation | 3 | Giữ |
| ml-fundamentals | [Gaussian Mixture Models](../content/lessons/gmm.md) | k-means, bayesian-estimation | 2 | Giữ |
| ml-fundamentals | [Anomaly Detection](../content/lessons/anomaly-detection.md) | pca, statistics | 2 | Giữ |
| ml-fundamentals | [Cross-validation](../content/lessons/cross-validation.md) | data-preparation, metrics, linear-regression | 2 | Giữ |
| ml-fundamentals | [Feature Engineering và Data Leakage](../content/lessons/feature-leakage.md) | cross-validation | 2 | Giữ |
| ml-fundamentals | [Thực hành dữ liệu bảng: EDA, encoding và pipeline](../content/lessons/tabular-pipeline.md) | feature-leakage, logistic-regression | 3 | Giữ |
| ml-fundamentals | [Recommendation Systems](../content/lessons/recommendation.md) | knn, linear-algebra-decompositions | 2 | Giữ |
| ml-fundamentals | [Hyperparameter Tuning](../content/lessons/hyperparameter-tuning.md) | cross-validation, svm | 2 | Giữ |
| ml-fundamentals | [Quy trình dự án Machine Learning](../content/lessons/ml-project-workflow.md) | tabular-pipeline, hyperparameter-tuning | 2 | Giữ |
| ml-fundamentals | [Lưu mô hình và triển khai](../content/lessons/model-deployment.md) | ml-project-workflow | 2 | Giữ |
| deep-learning | [Perceptron](../content/lessons/perceptron.md) | logistic-regression | 2 | Giữ |
| deep-learning | [Activation Functions](../content/lessons/activations.md) | perceptron, derivatives | 3 | Giữ |
| deep-learning | [MLP](../content/lessons/mlp.md) | perceptron, activations | 2 | Giữ |
| deep-learning | [Backpropagation](../content/lessons/backpropagation.md) | mlp, derivatives | 2 | Giữ |
| deep-learning | [Automatic Differentiation (Autograd)](../content/lessons/autograd.md) | backpropagation | 2 | Giữ |
| deep-learning | [Optimizers](../content/lessons/optimizers.md) | gradient-descent, backpropagation | 2 | Giữ |
| deep-learning | [Chẩn đoán huấn luyện: khởi tạo, gradient và normalization](../content/lessons/training-diagnostics.md) | autograd, optimizers | 3 | Giữ |
| deep-learning | [Regularization và Learning Rate Scheduling](../content/lessons/dl-regularization.md) | training-diagnostics, optimizers | 2 | Giữ |
| deep-learning | [Thực hành PyTorch: MLP và CNN](../content/lessons/pytorch-practice.md) | dl-regularization, autograd | 2 | Giữ |
| deep-learning | [Embeddings và biểu diễn văn bản](../content/lessons/embeddings.md) | vectors-matrices, knn | 2 | Giữ |
| deep-learning | [CNN](../content/lessons/cnn.md) | mlp, training-diagnostics | 2 | Giữ |
| deep-learning | [Thực hành CNN: bộ lọc tích chập làm đặc trưng](../content/lessons/cnn-practice.md) | cnn, logistic-regression | 2 | Giữ |
| deep-learning | [Thực hành CNN thật trên CPU với Digits](../content/lessons/cnn-cpu.md) | cnn, pytorch-practice | 3 | Giữ |
| deep-learning | [RNN và LSTM](../content/lessons/rnn-lstm.md) | mlp, backpropagation | 2 | Giữ |
| deep-learning | [Thực hành GRU: dự báo chuỗi trên CPU](../content/lessons/sequence-models-cpu.md) | rnn-lstm, pytorch-practice | 3 | Giữ |
| deep-learning | [Attention và Transformer](../content/lessons/attention-transformer.md) | softmax-regression, mlp | 2 | Giữ |
| deep-learning | [Kiến trúc Transformer](../content/lessons/transformer-architecture.md) | attention-transformer, embeddings, training-diagnostics | 2 | Làm rõ RoPE/kiến trúc hiện đại |
| deep-learning | [Autoencoder](../content/lessons/autoencoder.md) | pca, mlp, backpropagation | 2 | Giữ |
| deep-learning | [Transfer Learning](../content/lessons/transfer-learning.md) | cnn-cpu, optimizers | 2 | Giữ |
| deep-learning | [GAN, VAE và Diffusion](../content/lessons/gan-vae-diffusion.md) | autoencoder, bayesian-estimation | 2 | Sửa khái quát chất lượng/tốc độ |
| deep-learning | [Phân loại cảm xúc văn bản](../content/lessons/text-classification.md) | embeddings, logistic-regression | 2 | Giữ |
| deep-learning | [Thực hành recommender với embedding học được](../content/lessons/neural-recommendation.md) | embeddings, recommendation, optimizers | 3 | Giữ |
