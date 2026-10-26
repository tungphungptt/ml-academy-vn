**Cấp độ:** Beginner · **Tầng:** Core · **Tiên quyết:** không yêu cầu bài trước.
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

## Điều kiện áp dụng và kiểm tra kết luận
Hàm số học nên tách khỏi việc đọc/ghi file để kiểm thử bằng input nhỏ. List là vùng nhớ có thể thay đổi; tham số mặc định được tạo khi định nghĩa hàm, không phải mỗi lần gọi. Với `def f(a=[])`, hai lần gọi có thể dùng chung danh sách. Dùng `None` rồi tạo list bên trong. Type hint không tự kiểm tra dtype, shape hoặc giá trị lúc runtime. Với ví dụ số, luôn kiểm tra tập rỗng và tránh chia cho 0; với dữ liệu học máy, shape và đơn vị cũng là một phần hợp đồng.

## Đáp án và tiêu chí chấm
1. Bình phương số chẵn từ 0 đến 10 là `[0,4,16,36,64,100]`; comprehension cần lọc trước khi bình phương. (2 điểm).
2. Trung bình dùng tổng chia số phần tử; độ lệch chuẩn phải nói rõ chia N hay N−1. Kiểm thử với `[1,2,3]` và báo lỗi hợp lý cho list rỗng, không âm thầm trả NaN. (3 điểm).
3. Môi trường riêng cần Python đúng phiên bản, `python -m pip` trỏ đúng interpreter và file phiên bản dependency. Chạy một import/test ngắn, không chỉ chụp output “Successfully installed”. (5 điểm).

## Nguồn tham khảo
- [Python Tutorial (docs.python.org)](https://docs.python.org/3/tutorial/).
