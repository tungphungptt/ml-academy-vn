**Cấp độ:** Advanced · **Tiên quyết:** Attention và Transformer, MLP, Activation Functions.
**Mục tiêu:** hiểu các thành phần của một khối Transformer: multi-head attention, positional encoding, feed-forward, kết nối tắt và chuẩn hóa.

## Vấn đề thực tế
Attention thuần không biết thứ tự từ, và một "đầu" attention chỉ nhìn một kiểu quan hệ. Transformer bổ sung các thành phần để khắc phục.

## Các thành phần
- **Multi-head attention:** chia $d_{\text{model}}$ thành $h$ đầu, mỗi đầu có $d_k=d_{\text{model}}/h$ chiều, chạy attention song song rồi ghép lại và chiếu bằng $W_O$. Mỗi đầu có thể học một kiểu quan hệ khác nhau.
- **Positional encoding:** cộng vào embedding một vector biểu diễn vị trí, ví dụ dạng sin/cos:
$$PE(pos,2i)=\sin\!\Big(\frac{pos}{10000^{2i/d}}\Big),\qquad PE(pos,2i+1)=\cos\!\Big(\frac{pos}{10000^{2i/d}}\Big)$$
- **Feed-forward** áp dụng riêng cho từng vị trí (hai lớp tuyến tính với kích hoạt ở giữa).
- **Kết nối tắt (residual) và LayerNorm** quanh mỗi khối con giúp huấn luyện ổn định khi xếp nhiều lớp.
- Bộ giải mã (decoder) dùng **mặt nạ nhân quả** để vị trí $t$ không nhìn thấy tương lai.

![Sơ đồ khối Transformer](/img/transformer-architecture.svg)

## Ví dụ từng bước
$d=4$, $pos=1$: $PE=(\sin1,\cos1,\sin0.01,\cos0.01)\approx(0.8415,0.5403,0.01,1.0)$ (cặp đầu dao động nhanh, cặp sau chậm). Với $d_{\text{model}}=512$, $h=8$: $d_k=64$; bốn ma trận chiếu $W_Q,W_K,W_V,W_O$ có tổng cộng $4\cdot512^2=1\,048\,576$ tham số (chưa tính bias).

## Code và cách chạy
```python
from math import cos, sin
print([round(sin(1), 4), round(cos(1), 4), round(sin(0.01), 4), round(cos(0.01), 4)])
```
Kết quả kỳ vọng (đã chạy cục bộ): `[0.8415, 0.5403, 0.01, 1.0]`.
```python
d_model, h = 512, 8
print(4 * d_model ** 2, d_model // h)
```
Kết quả kỳ vọng (đã chạy cục bộ): `1048576 64`.

## Lỗi thường gặp
Quên positional encoding (mô hình coi câu như túi từ); quên mặt nạ khi sinh văn bản; nhầm $d_{\text{model}}$ với $d_k$.

## Hạn chế
Bài này chỉ trình bày cấu trúc và phép đếm tham số; chưa có code Transformer chạy được trong giáo trình.

## Bài tập
1. (Dễ) Tính $d_k$ khi $d_{\text{model}}=768,h=12$. 2. (Vừa) Tính $PE(2,0)$ với $d=4$. 3. (Khó) Cài multi-head attention bằng NumPy cho chuỗi 4 phần tử.

## Tóm tắt
Transformer = multi-head attention + positional encoding + feed-forward, được ổn định bằng residual và LayerNorm.
