**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Metrics, Dữ liệu mất cân bằng và calibration, MLOps và tái lập.
**Mục tiêu:** đặt câu hỏi về tác động trước metric; tính hai tiêu chí fairness khác nhau; nhận diện giới hạn privacy và ghi lại mục đích/giới hạn của mô hình.

## Bắt đầu từ ai chịu tác động
Một hệ thống gợi ý tài nguyên học tập có thể phục vụ tốt nhóm đông nhưng kém ở nhóm ít dữ liệu. Điểm trung bình toàn bộ không cho biết ai bị bỏ sót, dữ liệu nào bị thu thập không cần thiết hay người dùng có thể sửa một quyết định sai không. Responsible AI là công việc xuyên vòng đời, không phải nhãn “công bằng” gắn sau khi model đạt accuracy cao.

Xác định mục đích, phạm vi không dùng, người chịu trách nhiệm, nhóm có thể bị ảnh hưởng và cơ chế khiếu nại/chuyển người duyệt. Nhãn lịch sử phản ánh cách thu thập và quyết định trước đó; không mặc nhiên là một định nghĩa khách quan về năng lực hoặc nhu cầu.

## Fairness có nhiều định nghĩa
Với nhóm $A=a$, **demographic parity** xét $P(\hat Y=1\mid A=a)$ giữa các nhóm. **Equal opportunity** xét true-positive rate $P(\hat Y=1\mid Y=1,A=a)$. Equalized odds xét cả TPR và FPR. Calibration theo nhóm lại hỏi ý nghĩa của score khi điều kiện trên nhóm/điểm.

Các tiêu chí đo điều khác nhau và có thể xung đột, đặc biệt khi base rates khác nhau và predictor không hoàn hảo. Không chọn tiêu chí chỉ vì nó tạo con số đẹp. Cần quyết định theo tác động, chất lượng nhãn và người liên quan; một metric parity không chứng minh hệ thống công bằng về mọi mặt.

![Hai nhóm có cùng tỷ lệ chọn nhưng khác tỷ lệ phát hiện dương tính](/img/responsible-ai.svg)

## Ví dụ: cùng selection rate, khác TPR
Hai nhóm A/B bên dưới đều có bốn mẫu, mỗi nhóm hai mẫu dương thật. Nhóm A chọn nhầm một âm tính và bỏ sót một dương tính; nhóm B chọn đúng cả hai. Đây là **confusion counts tự tạo để minh họa**, không mô tả cộng đồng thực tế:

```python
groups = {
    "A": {"tp": 1, "fp": 1, "fn": 1, "tn": 1},
    "B": {"tp": 2, "fp": 0, "fn": 0, "tn": 2},
}
for name, c in groups.items():
    selection = (c["tp"] + c["fp"]) / sum(c.values())
    tpr = c["tp"] / (c["tp"] + c["fn"])
    print(name, selection, tpr)
```

Kết quả: `A 0.5 0.5` và `B 0.5 1.0`. Demographic parity của bảng này không kéo theo equal opportunity. Với nhóm ít mẫu, phải báo mẫu số, uncertainty và độ ổn định; với mẫu số 0, metric có thể không xác định. Kiểm tra cả các nhóm giao nhau khi dữ liệu và quyền sử dụng cho phép, tránh công khai bảng nhỏ làm lộ người.

## Bỏ cột nhạy cảm không tự xóa bias
Các feature khác có thể là proxy; nhãn hoặc cách lấy mẫu cũng có thể mang thiên lệch. Mặt khác, đánh giá disparity có thể cần thông tin nhóm với mục đích, quyền truy cập và cơ chế quản trị rõ ràng. Không thu thập thêm dữ liệu nhạy cảm vô hạn chỉ để dễ tính metric.

Các biện pháp có thể gồm sửa dữ liệu/nhãn, thay objective, điều chỉnh chính sách hoặc giới hạn phạm vi dùng. Mỗi biện pháp cần đánh giá lại hiệu quả, tác động và trade-off. Không coi explanation/feature importance là bằng chứng nhân quả hoặc chứng nhận fairness.

## Privacy và model security
Tối thiểu hóa dữ liệu, phân quyền, giới hạn thời gian lưu, bảo vệ artifact/log và kiểm tra nguồn dữ liệu là những bước cơ bản. Mã hóa ID hoặc xóa tên không tự ngăn liên kết ngược. Model có thể ghi nhớ hoặc tiết lộ thông tin qua output; chia dữ liệu theo người dùng giúp đánh giá đúng hơn nhưng không tự tạo bảo đảm privacy.

Differential privacy là một định nghĩa định lượng: với mọi cặp dataset $D,D'$ kề nhau theo đơn vị bảo vệ đã định nghĩa và mọi tập đầu ra đo được $S$, cơ chế $M$ thỏa

$$
P[M(D)\in S]\le e^\epsilon P[M(D')\in S]+\delta.
$$

Xác suất ở đây lấy theo ngẫu nhiên của cơ chế, không phải xác suất một người “an toàn”. Tham số $\epsilon\ge0$ giới hạn độ thay đổi theo hệ số nhân; $0\le\delta<1$ là phần nới lỏng cộng trong bất đẳng thức. Khi giữ các điều kiện khác như nhau, giá trị nhỏ hơn đòi hỏi bảo đảm chặt hơn. Cần nói rõ “kề nhau” là thêm/bớt một bản ghi hay toàn bộ dữ liệu của một người; bảo đảm ở mức bản ghi không tự trở thành bảo đảm ở mức người dùng có nhiều bản ghi.

Không thể gọi một training run là “DP” chỉ vì đã thêm nhiễu. Cần cơ chế, adjacency, clipping/sensitivity và accounting phù hợp; nhiều lần sử dụng có thể tiêu ngân sách privacy. Bài này giải thích khái niệm, không triển khai DP-SGD hoặc chứng minh privacy cho một sản phẩm. Threat model còn cần xem xét data poisoning, membership inference, artifact không tin cậy và các ranh giới quyền của ứng dụng.

## Tài liệu hóa để người khác đánh giá được
Dataset datasheet ghi động cơ, thành phần, thu thập/nhãn, giới hạn và cách dùng phù hợp. Model card ghi phiên bản, mục đích, phạm vi không dùng, protocol/metric theo nhóm, giới hạn và người liên hệ. Số liệu phải đến từ thí nghiệm thực, kèm mẫu số; không điền benchmark giả để mẫu biểu trông đầy đủ.

Một bản phát hành có trách nhiệm cần review thay đổi, giám sát tác động và đường phản hồi. Model card là phương tiện minh bạch, không bảo đảm mọi rủi ro đã được giải quyết. Khi không đủ chứng cứ cho một nhóm hoặc một bối cảnh mới, giới hạn phạm vi hoặc chuyển người duyệt có thể là quyết định đúng.

## Lỗi thường gặp khi kết luận fairness và privacy
Hai tỷ lệ bằng nhau trong tám mẫu tự tạo không chứng minh một chính sách phù hợp với mọi nhóm. Trước khi kết luận từ dữ liệu thật, kiểm tra cách định nghĩa nhóm, sai lệch nhãn, mẫu số nhỏ và các trường hợp bị bỏ khỏi thống kê. Nếu không được phép thu thập một thuộc tính nhóm, cần nêu giới hạn đánh giá và tìm quy trình quản trị phù hợp; không suy “không đo được chênh lệch” thành “không có chênh lệch”.

## Bài tập tự đánh giá
1. Hai nhóm cùng selection rate có chắc cùng recall không? Dùng bảng ví dụ để trả lời.
2. Nêu ba thông tin cần có trong model card trước phát hành.
3. Vì sao thay tên người dùng bằng ID ngẫu nhiên chưa đủ chứng minh privacy?

## Đáp án và tiêu chí chấm
1. Không: selection đều 0.5, TPR lần lượt 0.5 và 1.0; giải thích mẫu số khác nhau của hai metric (2 điểm).
2. Mục đích/phạm vi, version/protocol, metric có mẫu số/slice, giới hạn và owner; các số phải có bằng chứng (3 điểm).
3. Có thể liên kết qua thuộc tính khác hoặc output model; cần threat model, tối thiểu hóa dữ liệu, kiểm soát truy cập và biện pháp có kiểm chứng (5 điểm).

## Tổng kết
Fairness có nhiều tiêu chí với mẫu số và trade-off khác nhau. Privacy cần threat model và biện pháp kiểm chứng; datasheet/model card giúp minh bạch nhưng không tự loại bỏ rủi ro.

## Nguồn tham khảo
- [Google MLCC: Demographic parity](https://developers.google.com/machine-learning/crash-course/fairness/demographic-parity).
- [NIST: AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework).
- [Model Cards for Model Reporting](https://arxiv.org/abs/1810.03993).
- [Datasheets for Datasets](https://arxiv.org/abs/1803.09010).
- [The Algorithmic Foundations of Differential Privacy](https://www.cis.upenn.edu/~aaroth/Papers/privacybook.pdf).

Đối chiếu ngày 27/10/2026. Các định nghĩa là nền tảng; lựa chọn fairness và trade-off cần bối cảnh, không có một tiêu chí phù hợp mọi ứng dụng.
