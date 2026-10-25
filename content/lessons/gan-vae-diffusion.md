**Cấp độ:** Advanced · **Tiên quyết:** Autoencoder, Xác suất cơ bản.
**Mục tiêu:** nắm ý tưởng chính của GAN, VAE và Diffusion ở mức nhập môn. Bài này không có bài thực hành huấn luyện.

## Vấn đề thực tế
Mô hình sinh (generative model) học phân phối của dữ liệu để tạo mẫu mới: ảnh, âm thanh, văn bản.

## Ba hướng tiếp cận
**GAN:** bộ sinh $G$ tạo mẫu giả, bộ phân biệt $D$ phân biệt thật/giả; hai mạng huấn luyện đối kháng với hàm giá trị $\min_G\max_D\ \mathbb E[\ln D(x)]+\mathbb E[\ln(1-D(G(z)))]$. Với $G$ cố định, $D^*(x)=\frac{p_{\text{data}}}{p_{\text{data}}+p_g}$; khi $p_g=p_{\text{data}}$ thì $D^*=0.5$.
**VAE:** autoencoder xác suất. Encoder cho $\mu,\sigma^2$; lấy mẫu $z=\mu+\sigma\varepsilon$ với $\varepsilon\sim\mathcal N(0,1)$ (mẹo reparameterization để vẫn lan truyền gradient được). Loss gồm lỗi tái tạo cộng KL kéo phân phối mã về $\mathcal N(0,1)$:
$$\text{KL}=\tfrac12\big(\mu^2+\sigma^2-1-\ln\sigma^2\big)\quad\text{(một chiều)}$$
**Diffusion:** quá trình tiến thêm nhiễu dần: $x_t=\sqrt{\bar\alpha_t}\,x_0+\sqrt{1-\bar\alpha_t}\,\varepsilon$; mạng được huấn luyện để dự đoán nhiễu rồi đảo ngược quá trình khử nhiễu.

![GAN, VAE và Diffusion](/img/gan-vae-diffusion.svg)

## Ví dụ từng bước
KL: $\mu=1,\sigma^2=1\Rightarrow0.5$; $\mu=0,\sigma^2=4\Rightarrow\frac12(4-1-\ln4)\approx0.8069$. Diffusion: $\bar\alpha_t=0.64$, $x_0=1$, $\varepsilon=0.5$: $x_t=0.8\cdot1+0.6\cdot0.5=1.1$.

## Code và cách chạy
```python
import numpy as np
kl = lambda mu, s2: 0.5 * (mu ** 2 + s2 - 1 - np.log(s2))
print(round(float(kl(1, 1)), 4), round(float(kl(0, 4)), 4), round(0.8 * 1 + (1 - 0.64) ** 0.5 * 0.5, 3))
```
Kết quả kỳ vọng (đã chạy cục bộ): `0.5 0.8069 1.1`.

## Lỗi thường gặp
GAN: mất cân bằng giữa $G$ và $D$, mode collapse (chỉ sinh vài kiểu mẫu). VAE: ảnh sinh thường mờ. Diffusion: lấy mẫu chậm vì cần nhiều bước.

## Ưu điểm, hạn chế
GAN cho ảnh sắc nét nhưng khó huấn luyện; VAE ổn định và có không gian mã liên tục nhưng ảnh mờ hơn; Diffusion chất lượng cao nhưng tốn tính toán. Mình chưa cung cấp code huấn luyện cho ba mô hình này.

## Bài tập
1. (Dễ) Tính KL với $\mu=2,\sigma^2=1$. 2. (Vừa) Tính $x_t$ với $\bar\alpha_t=0.25$. 3. (Khó) Cài một VAE nhỏ bằng PyTorch trên dữ liệu 2 chiều.

## Tóm tắt
GAN: đối kháng; VAE: tái tạo cộng KL; Diffusion: thêm rồi khử nhiễu.
