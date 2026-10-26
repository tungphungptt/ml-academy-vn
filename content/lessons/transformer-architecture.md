**Cấp độ:** Advanced · **Tầng:** Advanced · **Tiên quyết:** Attention và Transformer, Embeddings và biểu diễn văn bản, Chẩn đoán huấn luyện: khởi tạo, gradient và normalization.
**Mục tiêu:** hiểu các thành phần của một khối Transformer: multi-head attention, positional encoding, feed-forward, kết nối tắt và chuẩn hóa.

## Vấn đề thực tế
Attention thuần không biết thứ tự từ, và một "đầu" attention chỉ nhìn một kiểu quan hệ. Transformer bổ sung các thành phần để khắc phục.

## Các thành phần
- **Multi-head attention:** chia $d_{\text{model}}$ thành $h$ đầu, mỗi đầu có $d_k=d_{\text{model}}/h$ chiều, chạy attention song song rồi ghép lại và chiếu bằng $W_O$. Mỗi đầu có thể học một kiểu quan hệ khác nhau.
- **Positional encoding:** cộng vào embedding một vector biểu diễn vị trí, ví dụ dạng sin/cos:
$$
PE(pos,2i)=\sin\!\Big(\frac{pos}{10000^{2i/d}}\Big),\qquad PE(pos,2i+1)=\cos\!\Big(\frac{pos}{10000^{2i/d}}\Big)
$$
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
Ví dụ encoder bên dưới kiểm tra cấu trúc/mask/backward trên CPU; chưa phải thí nghiệm huấn luyện một language model. Bài dự đoán chuỗi GRU cung cấp ví dụ sequence training hoàn chỉnh riêng.

## Bài tập
1. (Dễ) Tính $d_k$ khi $d_{\text{model}}=768,h=12$. 2. (Vừa) Tính $PE(2,0)$ với $d=4$. 3. (Khó) Cài multi-head attention bằng NumPy cho chuỗi 4 phần tử.

## Tóm tắt
Transformer = multi-head attention + positional encoding + feed-forward, được ổn định bằng residual và LayerNorm.

## Điều kiện áp dụng và kiểm tra kết luận
Encoder self-attention hai chiều thích hợp biểu diễn input; decoder tự hồi quy dùng causal self-attention và thường cross-attention tới encoder. Decoder-only không có encoder riêng nhưng vẫn cần causal mask khi học next-token. LayerNorm hoạt động theo feature từng token, khác BatchNorm qua batch. Residual giữ đường truyền cộng, feed-forward dùng cùng phép biến đổi cho mỗi vị trí. Positional encoding phá đối xứng về vị trí; causal mask ngăn tương lai nhưng tự nó không tương đương cung cấp đầy đủ khoảng cách/vị trí. Mã bên dưới kiểm tra encoder, position, padding, causal mask và backward; nó không được trình bày như một Transformer đã huấn luyện hiểu ngôn ngữ.

## Đáp án và tiêu chí chấm
1. $768/12=64$ chiều mỗi head. (2 điểm).
2. $PE(2,0)=\sin(2)\approx0.9093$ theo công thức đã nêu; tọa độ lẻ tương ứng cos. (3 điểm).
3. Tách từng head đúng shape, causal mask trước softmax, concat rồi chiếu WO. Kiểm tra equivariance khi bỏ position (nếu không mask làm thay đổi đối xứng) và invariant prefix khi thay future token trong cấu hình causal. (5 điểm).

## Nguồn tham khảo
- [Attention Is All You Need (Vaswani và cộng sự)](https://arxiv.org/abs/1706.03762).
- [Dive into Deep Learning: Transformer](https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html).

## Kiểm tra encoder, position, padding và causal mask bằng PyTorch
Đây là kiểm tra cấu trúc/gradient, không có metric ngôn ngữ và không tuyên bố đã train Transformer:
```python
import torch
from torch import nn
torch.manual_seed(61)
tokens = torch.tensor([[1,2,3,0],[4,5,6,7]])
embedding = nn.Embedding(11, 8, padding_idx=0)
position = torch.arange(4).unsqueeze(1) / (10000 ** (torch.arange(0,8,2) / 8))
pe = torch.zeros(4,8); pe[:,0::2] = position.sin(); pe[:,1::2] = position.cos()
encoder = nn.TransformerEncoder(nn.TransformerEncoderLayer(8,2,dim_feedforward=16,dropout=0.,batch_first=True),1)
head = nn.Linear(8,11)
causal = torch.triu(torch.ones(4,4,dtype=torch.bool), diagonal=1)
def forward(ids):
    return head(encoder(embedding(ids)+pe, mask=causal, src_key_padding_mask=(ids==0)))
logits = forward(tokens)
target = torch.tensor([[2,3,1,0],[5,6,7,1]])
loss = nn.CrossEntropyLoss(ignore_index=0)(logits.reshape(-1,11),target.reshape(-1))
loss.backward()
assert torch.isfinite(loss) and torch.isfinite(embedding.weight.grad).all()
changed = tokens.clone(); changed[1,3] = 8
with torch.no_grad():
    assert torch.allclose(forward(tokens)[1,:3],forward(changed)[1,:3],atol=1e-6)
print(tuple(logits.shape), bool(torch.isfinite(loss)))
```
Kết quả kỳ vọng: `(2, 4, 11) True`. Assertion prefix kiểm tra token tương lai không ảnh hưởng các vị trí trước khi dùng mask causal; padding được che riêng. Cấu hình boolean mask của PyTorch dùng True cho vị trí bị chặn.

## Kiểm tra decoder và cross-attention trên CPU
Encoder cung cấp memory của source; decoder nhận **target đã dịch phải** khi teacher forcing, tự attention có causal mask rồi cross-attention vào memory. Mask causal không thay thế padding mask. Ví dụ sau kiểm tra interface encoder–decoder và tính nhân quả, không phải thí nghiệm huấn luyện ngôn ngữ. Khi inference autoregressive, chỉ đưa prefix đã sinh, không đưa target tương lai như lúc teacher forcing.

```python
import torch
from torch import nn
torch.manual_seed(29)
embedding = nn.Embedding(12, 8, padding_idx=0)
model = nn.Transformer(d_model=8, nhead=2, num_encoder_layers=1,
                       num_decoder_layers=1, dim_feedforward=16,
                       dropout=0., batch_first=True)
head = nn.Linear(8, 12)
source = torch.tensor([[2, 3, 4, 0], [5, 6, 0, 0]])
# BOS=1, target input shifted right; PAD=0, EOS=11.
target_in = torch.tensor([[1, 7, 8], [1, 9, 0]])
target_out = torch.tensor([[7, 8, 11], [9, 11, 0]])
position = torch.arange(4, dtype=torch.float32)[:, None]
divisor = torch.exp(torch.arange(0, 8, 2) * (-torch.log(torch.tensor(10000.))/8))
pe = torch.zeros(4, 8)
pe[:, 0::2], pe[:, 1::2] = torch.sin(position*divisor), torch.cos(position*divisor)
causal = nn.Transformer.generate_square_subsequent_mask(3).bool()
def forward(tokens):
    hidden = model(embedding(source)+pe, embedding(tokens)+pe[:3],
                   tgt_mask=causal, src_key_padding_mask=source.eq(0),
                   tgt_key_padding_mask=tokens.eq(0), memory_key_padding_mask=source.eq(0))
    return head(hidden)
model.eval()
logits = forward(target_in)
loss = nn.functional.cross_entropy(logits.reshape(-1, 12),
                                   target_out.reshape(-1), ignore_index=0)
loss.backward()
assert torch.isfinite(loss) and embedding.weight.grad is not None
changed = target_in.clone(); changed[:, -1] = 10
with torch.no_grad():
    # Changing a later target token cannot change logits at the first position.
    invariant = torch.allclose(logits[:, 0], forward(changed)[:, 0], atol=1e-6)
assert invariant
print(tuple(logits.shape), invariant)
```
Kết quả kỳ vọng: `(2, 3, 12) True`.

Để huấn luyện một mô hình sinh hoàn chỉnh còn cần tokenizer/vocabulary chỉ fit train, data protocol, optimizer/checkpoint validation và vòng decode dừng ở EOS. Bài Advanced này xác minh các thành phần và gradient, không gán perplexity/BLEU hay metric chất lượng ngôn ngữ khi chưa có thí nghiệm đó.
