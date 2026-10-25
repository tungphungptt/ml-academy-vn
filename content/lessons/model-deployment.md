**Cấp độ:** Intermediate · **Tiên quyết:** Quy trình dự án ML, Pipeline.
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
```python
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
