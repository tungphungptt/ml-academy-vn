**Cấp độ:** Beginner · **Tiên quyết:** không.
**Mục tiêu:** nắm phần Python cần cho ML: hàm, list comprehension, generator, môi trường ảo.

## Vấn đề thực tế
Mọi bài thực hành trong giáo trình này viết bằng Python. Bạn cần đọc được code gọn kiểu Python và cài đặt môi trường đúng cách.

## Khái niệm chính
- **List comprehension:** `[biểu_thức for x in dãy if điều_kiện]` tạo danh sách trong một dòng.
- **Generator expression:** `sum(x * x for x in dãy)` không tạo danh sách trung gian, tiết kiệm bộ nhớ.
- **Hàm và type hint:** `def f(x: float) -> float:` giúp code dễ đọc và kiểm tra.
- **Môi trường ảo:** mỗi dự án nên có môi trường riêng để tránh xung đột phiên bản thư viện.

## Ví dụ từng bước
$\sum_{i=0}^{4}i^2=0+1+4+9+16=30$. Các số từ 0 đến 9 chia hết cho 3 là $0,3,6,9$.

## Code và cách chạy
```python
print(sum(i * i for i in range(5)), [i for i in range(10) if i % 3 == 0])
```
Kết quả kỳ vọng (đã chạy cục bộ): `30 [0, 3, 6, 9]`.

Cài môi trường (chạy trong terminal, chưa kiểm tra trên mọi hệ điều hành):
```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install numpy pandas matplotlib scikit-learn
```

## Lỗi thường gặp
Dùng tham số mặc định có thể thay đổi như `def f(a=[])`; cài thư viện vào Python hệ thống thay vì môi trường ảo; nhầm `=` (gán) với `==` (so sánh).

## Ưu điểm, hạn chế
Cú pháp gọn, hệ sinh thái ML phong phú. Vòng lặp thuần Python chậm, nên dùng NumPy vector hóa cho tính toán số.

## Bài tập
1. (Dễ) Viết comprehension tạo bình phương các số chẵn từ 0 đến 10. 2. (Vừa) Viết hàm tính trung bình và độ lệch chuẩn không dùng NumPy. 3. (Khó) Tạo môi trường ảo mới và cài scikit-learn.

## Tóm tắt
Comprehension và generator giúp code ngắn gọn; luôn dùng môi trường ảo cho mỗi dự án.
