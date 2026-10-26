**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Quy trình dự án Machine Learning.
**Mục tiêu:** lưu mô hình đã huấn luyện, nạp lại để suy luận và hiểu các bước đưa mô hình vào dịch vụ.

## Vấn đề thực tế
Huấn luyện xong, ta cần dùng mô hình mà không phải huấn luyện lại: lưu xuống file (checkpoint), nạp lên ở nơi khác và trả dự đoán qua một dịch vụ.

## Nguyên tắc
Lưu **cả pipeline** (tiền xử lý và mô hình) để suy luận dùng đúng phép chuẩn hóa như khi huấn luyện. Ghi lại phiên bản thư viện, vì file lưu của scikit-learn có thể không nạp được ở phiên bản khác. Không nạp file `joblib`/`pickle` từ nguồn không tin cậy vì chúng có thể thực thi mã tùy ý. Với PyTorch, thường lưu `state_dict` thay vì cả đối tượng, và đặt `model.eval()` khi suy luận.

![Quy trình lưu và triển khai mô hình](/img/model-deployment.svg)

## Code và cách chạy
```python
import os, tempfile, joblib
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
X, y = load_iris(return_X_y=True)
m = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)).fit(X, y)
f = os.path.join(tempfile.mkdtemp(), "m.joblib"); joblib.dump(m, f); m2 = joblib.load(f)
print(int(m2.predict([[5.1, 3.5, 1.4, 0.2]])[0]), bool((m.predict_proba(X) == m2.predict_proba(X)).all()))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0 True`: mô hình nạp lại cho đúng cùng dự đoán.

Khung dịch vụ web bằng FastAPI (**chưa được chạy trong môi trường phát triển**; cần `pip install fastapi uvicorn`):
```python snippet
from fastapi import FastAPI
import joblib
app = FastAPI(); model = joblib.load("m.joblib")
@app.post("/predict")
def predict(features: list[float]):
    return {"class": int(model.predict([features])[0])}
```
Chạy bằng `uvicorn tên_file:app`. Khi triển khai thật cần thêm kiểm tra đầu vào, ghi log, giới hạn tốc độ và theo dõi chất lượng mô hình theo thời gian.

## Lỗi thường gặp
Chỉ lưu mô hình mà quên bộ chuẩn hóa; nạp file từ nguồn lạ; không ghi phiên bản thư viện; không theo dõi dữ liệu thay đổi sau triển khai (data drift).

## Bài tập
1. (Dễ) Lưu và nạp một mô hình KNN. 2. (Vừa) Thêm kiểm tra độ dài đặc trưng vào API. 3. (Khó) Lưu `state_dict` của một mạng PyTorch và nạp lại vào kiến trúc mới.

## Tóm tắt
Lưu cả pipeline, kiểm tra kết quả sau khi nạp lại, và chỉ nạp file từ nguồn tin cậy.

## Điều kiện áp dụng và kiểm tra kết luận
Một artifact tái lập cần tên/thứ tự feature, dtype, đơn vị, preprocessing và phiên bản mô hình, không chỉ một file trọng số. Với PyTorch, tạo lại kiến trúc đúng rồi load_state_dict, map_location CPU và weights_only=True cho checkpoint mình tạo; dùng eval và inference_mode. Không mở artifact không tin cậy chỉ vì định dạng đã hỗ trợ weights-only. Schema đầu vào API phải kiểm tra số feature, kiểu, finite/range và trả lỗi có ý nghĩa, không dùng default imputation che lỗi hệ thống. Mẫu FastAPI ở trên là minh họa API chưa được kiểm chứng trong suite nội dung, không phải dịch vụ đã triển khai.

## Đáp án và tiêu chí chấm
1. Lưu pipeline KNN cùng scaler, reload trong môi trường cùng version và assert predictions/probabilities phù hợp trước/sau. (2 điểm).
2. Với Iris cần đúng 4 feature số hữu hạn và đúng thứ tự. Pydantic/request validation phải xử lý input sai bằng 4xx trước khi gọi predict; không trả một class tùy ý. (3 điểm).
3. Tạo kiến trúc giống checkpoint, load state_dict với weights_only và map_location CPU; chuyển eval, chạy cùng input và so output. Giữ artifact trong thư mục thử nghiệm riêng và kiểm tra phiên bản. (5 điểm).

## Nguồn tham khảo
- [scikit-learn: Model persistence](https://scikit-learn.org/stable/model_persistence.html).
- [FastAPI documentation](https://fastapi.tiangolo.com/).

## Serving CPU hoàn chỉnh để kiểm tra hợp đồng
Ví dụ dưới đây tự fit một Pipeline trên Iris train, lưu/nạp lại artifact do chính nó tạo rồi gọi endpoint HTTP thật ở loopback bằng client Python. Không cần FastAPI hoặc mở dịch vụ bên ngoài; cổng do hệ điều hành cấp, đóng ngay sau kiểm tra. Đây là **smoke test serving**, không phải web server production: triển khai thật còn cần authentication theo môi trường, TLS ở reverse proxy, giới hạn tải/concurrency, versioning, monitoring và rollback. Không dùng `http.server` này làm dịch vụ công khai.

```python
import json, tempfile, threading
from pathlib import Path
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import joblib
import numpy as np
from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
X, y = load_iris(return_X_y=True)
tr, te = train_test_split(np.arange(len(y)), test_size=.3,
                         random_state=42, stratify=y)
model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))
model.fit(X[tr], y[tr])
with tempfile.TemporaryDirectory() as tmp:
    artifact = Path(tmp) / 'iris.joblib'
    joblib.dump(model, artifact)
    serving = joblib.load(artifact)  # chỉ artifact đáng tin do mình vừa tạo
    assert np.array_equal(model.predict(X[te]), serving.predict(X[te]))
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args): pass
        def do_POST(self):
            try:
                if self.path != '/predict': raise ValueError('route')
                size = int(self.headers.get('Content-Length', '0'))
                if not 0 < size <= 4096: raise ValueError('body size')
                features = np.asarray(json.loads(self.rfile.read(size))['features'], float)
                if features.shape != (1, 4) or not np.isfinite(features).all():
                    raise ValueError('expected one row, four finite features')
                payload = {'class': int(serving.predict(features)[0])}
                status = 200
            except (ValueError, KeyError, TypeError):
                payload, status = {'error': 'invalid input'}, 400
            data = json.dumps(payload).encode()
            self.send_response(status)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers(); self.wfile.write(data)
    server = HTTPServer(('127.0.0.1', 0), Handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    def predict(features):
        req = Request(f'http://127.0.0.1:{server.server_port}/predict',
                      json.dumps({'features': features}).encode(),
                      {'Content-Type': 'application/json'})
        return urlopen(req, timeout=5)
    try:
        with predict([[5.1, 3.5, 1.4, .2]]) as response:
            assert response.status == 200 and json.load(response)['class'] == 0
        try:
            predict([[1., 2.]])
            raise AssertionError('bad shape must be rejected')
        except HTTPError as error:
            assert error.code == 400
        print('reload=True valid=200 invalid_shape=400')
    finally:
        server.shutdown(); server.server_close(); thread.join(timeout=5)
```
Kết quả kỳ vọng: `reload=True valid=200 invalid_shape=400`.

Một HTTP 200 chỉ xác nhận request hợp lệ và model inference chạy, không chứng minh dự đoán đúng ngoài miền. Thứ tự bốn cột phải đúng như training contract. Ví dụ này kiểm tra reload/shape/error response; chưa đo latency/load hoặc drift ngoài dữ liệu Iris.
