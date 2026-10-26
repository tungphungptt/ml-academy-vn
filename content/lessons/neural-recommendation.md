**Cấp độ:** Advanced · **Tầng:** Advanced · **Tiên quyết:** Embeddings và biểu diễn văn bản, Recommendation Systems, Optimizers.
**Mục tiêu:** học embedding người dùng/mục trên các rating đã quan sát; phân biệt rating regression, ranking và cold start.

## Từ bảng thưa tới tham số học được
Ma trận user×item thường thiếu nhiều ô. Một ô thiếu không có nghĩa người dùng ghét mục đó, và không được thay bằng rating 0 rồi huấn luyện như dữ liệu có nhãn. Matrix factorization biểu diễn mỗi user/item bằng vector ngắn; tích vô hướng mô tả tương tác. Đây là một mô hình embedding học bằng gradient, không phải mạng sâu nhiều tầng và không mặc định vượt mô hình đơn giản.

$$
\hat r_{ui}=\mu+b_u+c_i+p_u^\top q_i,\qquad L_{\mathrm{data}}=\frac1{|\Omega|}\sum_{(u,i)\in\Omega}(r_{ui}-\hat r_{ui})^2.
$$
$\Omega$ chỉ chứa rating train quan sát, $\mu$ là trung bình train, bias user/item mô tả xu hướng chấm cao/thấp. $p_u,q_i$ là các hàng trong `nn.Embedding`. Với implicit feedback cần định nghĩa exposure, positive/negative sampling và ranking loss khác; không biến lab regression này thành bằng chứng ranking.

Có thể định nghĩa objective có penalty $L_{\mathrm{data}}+\lambda R(\theta)$ trong một mô hình khác. **Lab bên dưới chỉ backpropagate $L_{\mathrm{data}}$ và dùng AdamW với decay tách riêng**; không có hạng $\lambda R$ được cộng vào `loss` trong code.

## Dữ liệu và split của lab
Tự sinh 30 user, 24 item bằng latent rank 3 cộng nhiễu nhỏ. Toàn bộ 720 cặp được sinh để biết ground truth; chỉ 504 cặp đi vào fit, 108 validation và 108 test bị giữ lại. Assert mỗi user/item có mặt trong train: đây là **warm-start rating completion**, không đo khả năng dự đoán cho user mới. Không download dữ liệu, không dùng đánh giá của người thật, và không tự gán metric cho MovieLens.

Split ngẫu nhiên theo cặp phù hợp kiểm tra khôi phục cấu trúc low-rank của dữ liệu tự sinh này. Với sản phẩm thực, phải kiểm tra thời gian/exposure và cách cùng user xuất hiện giữa các tập; đánh giá phải phản ánh yêu cầu triển khai, không áp dụng split này một cách máy móc.

## Chạy thực nghiệm
[Mở lab embedding recommender](/lab?lab=neural_recommendation).
```bash
python labs/neural_recommendation/library.py
```
Mô hình có hai embedding rank 3 và hai embedding bias, tối ưu MSE bằng AdamW, chọn checkpoint theo validation. Regularization AdamW là decoupled weight decay, không tuyên bố tương đương chính xác objective L2 ở mọi optimizer. Baseline là trung bình train, metric RMSE trên test chưa dùng để chọn epoch.

## Kết quả thực đo
Với seed 31 và PyTorch 2.14.1+cpu, RMSE baseline **0,8339**, embedding **0,0392** trên 108 rating test. Kết quả rất tốt vì cơ chế sinh dữ liệu đúng gần như giả định của mô hình và nhiễu thấp; không suy rộng sang sở thích thật, nội dung mới hoặc chất lượng top-k. Rating tự sinh không bị chặn 1–5; không ghi rằng đây là thang sao 1–5 rồi báo dự đoán ngoài khoảng như thể hợp lệ.

## Cold start, ranking và representation
User/item ID chưa có embedding phải có fallback (global mean, bias, đặc trưng nội dung hoặc quy trình thu thập tương tác), không tra bảng với ID ngoài range. Khi khuyến nghị top-k cần lọc item đã thấy, xác định candidate set và báo Recall@k/NDCG@k phù hợp; RMSE thấp không bảo đảm ranking tốt. Dùng metadata có thời điểm quan sát hợp lệ để xử lý cold start, không lén dùng rating tương lai.

Các vector embedding là biểu diễn tiềm ẩn, không có ý nghĩa duy nhất từng chiều: phép biến đổi giữ tích vô hướng có thể đổi tọa độ. Không gán chiều 1 là “thích hài” chỉ vì nhìn một vài ví dụ.

## Bài tập tự đánh giá
1. User/item embedding kích thước 30×3 và 24×3 có bao nhiêu tham số (chưa bias)?
2. Vì sao không điền mọi rating thiếu bằng 0?
3. Thiết kế một evaluation riêng cho cold start và một evaluation ranking, nêu baseline.

## Đáp án và tiêu chí chấm
1. $30\cdot3+24\cdot3=162$ (2 điểm).
2. Ô thiếu là chưa quan sát, không phải nhãn âm; exposure và missingness có thể không ngẫu nhiên. Chỉ loss trên $\Omega$ đã chọn (3 điểm).
3. Giữ riêng user/item chưa gặp khi fit, dùng fallback/metadata; ranking dùng candidate set hợp lý, lọc mục đã thấy, metric top-k và baseline popularity. Phân biệt rõ hai protocol và tránh thông tin tương lai (5 điểm).

## Tổng kết
Embedding làm gọn ma trận tương tác; objective, dữ liệu quan sát và cách chia quyết định mô hình thực sự đang giải bài toán nào.

## Nguồn tham khảo
- [ML cơ bản: Matrix Factorization](https://machinelearningcoban.com/2017/05/31/matrixfactorization/), đọc snapshot nguồn.
- [TabML: embedding](https://machinelearningcoban.com/tabml_book/ch_embedding/embedding.html); phạm vi nguồn Git được ghi trong audit.
- [PyTorch: optimization tutorial](https://pytorch.org/tutorials/beginner/basics/optimization_tutorial.html).
- [PyTorch 2.14: AdamW và decoupled weight decay](https://docs.pytorch.org/docs/2.14/generated/torch.optim.AdamW.html).
