**Cấp độ:** Intermediate · **Tầng:** Core · **Tiên quyết:** Quy trình dự án ML, Model deployment, Data leakage.
**Mục tiêu:** tạo manifest thí nghiệm có thể truy vết; phân biệt seed với tái lập; thiết kế monitoring và rollback trước khi cần huấn luyện lại.

## Mô hình là một phần của hệ thống
Hôm qua mô hình cho kết quả tốt, hôm nay output thay đổi dù “không sửa code”. Có thể dữ liệu, thứ tự feature, checkpoint, dependency, dtype hoặc preprocessing đã đổi. MLOps kết nối quy trình dữ liệu, thí nghiệm, triển khai và theo dõi; không đồng nghĩa phải cài một nền tảng lớn ngay từ đầu.

Một dự án nhỏ có thể bắt đầu bằng cấu hình có phiên bản, manifest JSON, thư mục artifact và log có cấu trúc. Tool tracking như MLflow hoặc TensorBoard là lựa chọn triển khai, không thay thế việc định nghĩa cần lưu gì. Không dùng một dòng accuracy cùng file `best.pkl` làm toàn bộ lịch sử thí nghiệm.

## Manifest tối thiểu
Ghi ID thí nghiệm; phiên bản source và dữ liệu; schema/feature order/đơn vị; split và seed; cấu hình; phiên bản thư viện/device; metric theo split/slice; đường dẫn cùng hash artifact. Ghi cả lần thất bại để không chỉ giữ những thí nghiệm đẹp. Giữ test ngoài vòng chọn cấu hình.

Versioning dữ liệu gồm nội dung và cách tạo dữ liệu: truy vấn, cửa sổ thời gian, nhãn, bước loại trùng, preprocessing và quyền sử dụng. Hash giúp phát hiện thay đổi byte theo quy ước serialize, không tự chứng minh dataset đúng, đủ hoặc không có dữ liệu nhạy cảm. Không commit thông tin cá nhân chỉ để có lịch sử phiên bản.

![Vòng đời dữ liệu, thí nghiệm, registry, serving và giám sát](/img/mlops-reproducibility.svg)

## Seed không phải phép màu
Seed kiểm soát một nguồn ngẫu nhiên trong một môi trường. Kernel không tất định, thứ tự xử lý song song, thiết bị và phiên bản vẫn có thể thay kết quả. Cần phân biệt tái lập protocol, kết quả tương đương trong tolerance và bitwise identical. Đừng yêu cầu bằng tuyệt đối nếu bài toán số học chỉ hỗ trợ sai số hữu hạn; cũng đừng dùng tolerance để che thay đổi objective hoặc leakage.

Ví dụ split theo ID dùng SHA-256, không dùng `hash()` của Python vốn có thể đổi giữa process. Đây là dữ liệu **tự tạo**, chỉ kiểm tra tính ổn định với thứ tự input, không bảo đảm stratification hoặc chống trùng người dùng:

```python
import hashlib, json
records = [{"id": "row-1", "value": 1}, {"id": "row-2", "value": 2}]
def split(identifier):
    value = int.from_bytes(hashlib.sha256(identifier.encode()).digest()[:4], "big")
    return "test" if value % 5 == 0 else "train"
first = {r["id"]: split(r["id"]) for r in records}
second = {r["id"]: split(r["id"]) for r in reversed(records)}
payload = json.dumps(records, sort_keys=True, separators=(",", ":")).encode()
changed = json.dumps([{**records[0], "value": 3}, records[1]],
                     sort_keys=True, separators=(",", ":")).encode()
print(first == second, hashlib.sha256(payload).hexdigest() != hashlib.sha256(changed).hexdigest())
```

Kết quả: `True True`. Nếu nhiều dòng thuộc cùng người dùng, hash theo group ID phù hợp. Dữ liệu thời gian cần split theo thời gian; hash ngẫu nhiên hóa không chữa rò rỉ tương lai. Muốn hash không phụ thuộc thứ tự record còn cần quy tắc sắp xếp canonical trước khi serialize.

## Drift và suy giảm chất lượng khác nhau
Data drift thường chỉ thay đổi $P(x)$; concept drift đề cập thay đổi quan hệ $P(y\mid x)$. Phân phối đầu vào khác không chứng minh metric đã giảm, và đầu vào có vẻ giống không chứng minh quan hệ nhãn còn đúng. Với nhãn đến chậm, theo dõi proxy được ghi rõ rồi đánh giá lại khi nhãn xuất hiện.

Độ lệch total variation giữa hai histogram dùng cùng bin là $\tfrac12\sum_b|p_b-q_b|$. Nó không phải xác suất model sai:

```python
baseline = [0.5, 0.3, 0.2]
current = [0.2, 0.3, 0.5]
tv = 0.5 * sum(abs(p-q) for p, q in zip(baseline, current))
print(round(tv, 2))
```

Kết quả: `0.3`. Thực tế cần số mẫu, cửa sổ thời gian, biến động mùa vụ và ngưỡng cảnh báo theo bối cảnh. Không tự động retrain chỉ vì một chỉ số vượt ngưỡng mà chưa điều tra pipeline, nhãn và tác động.

## Từ artifact đến vòng phản hồi
Đóng gói preprocessing và model cùng hợp đồng input/output; kiểm tra load/reload bằng fixtures có nguồn gốc. Tránh training-serving skew: cùng định nghĩa feature, thứ tự và đơn vị online/offline. Theo dõi schema/missing, latency/error rate, phân phối score, chất lượng có nhãn theo slice và model age. Ghi version vào mỗi dự đoán để tra lỗi, nhưng không log raw dữ liệu riêng tư mặc định.

Trước phát hành, có baseline, quality gate, owner, canary/shadow khi phù hợp và rollback tới artifact/config tương thích. Shadow không được âm thầm tạo tác dụng ngoài. Feedback có thể thiên lệch vì chỉ thấy nhãn của nhóm đã được chọn hành động; không coi mọi log tương tác là ground truth độc lập.

## Lỗi thường gặp và hiểu lầm
Seed giống nhau không bảo đảm mọi nền tảng cho cùng bits. “Đã containerize” không đóng băng dữ liệu hoặc dịch vụ bên ngoài. “Drift bằng 0” không bảo đảm chất lượng. “Thêm tracking tool” không sửa split sai hoặc nhãn kém chất lượng.

## Bài tập tự đánh giá
1. Nêu năm mục cần lưu để tái hiện một thí nghiệm.
2. TV giữa $(0.5,0.5)$ và $(0.4,0.6)$ bằng bao nhiêu?
3. Input schema hợp lệ nhưng recall trên một nhóm giảm: thiết kế điều tra và rollback.

## Đáp án và tiêu chí chấm
1. Source/data/split/config/software-artifact versions; metric phải gắn với split và protocol (2 điểm).
2. $\tfrac12(0.1+0.1)=0.1$; không diễn giải thành 10% lỗi dự đoán (3 điểm).
3. Kiểm tra version, nhãn, sample size, skew và drift; so baseline trên cùng nhóm; rollback artifact/config khi cần và giữ bằng chứng, không sửa metric bằng cách bỏ nhóm khó (5 điểm).

## Tổng kết
Tái lập cần provenance dữ liệu/code/split/config/runtime, không chỉ seed. Monitoring có mục tiêu, điều tra nguyên nhân và rollback nối thí nghiệm với hệ thống vận hành.

## Nguồn tham khảo
- [Google MLCC: Monitoring pipelines](https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring).
- [PyTorch: Reproducibility](https://docs.pytorch.org/docs/stable/notes/randomness.html).
- [scikit-learn: Model persistence](https://scikit-learn.org/stable/model_persistence.html).

Đối chiếu ngày 27/10/2026. Các công cụ vận hành thay đổi, nhưng provenance, protocol, monitoring có mục tiêu và rollback là những yêu cầu bền vững.
