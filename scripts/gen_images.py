"""Sinh các hình minh họa SVG (tự vẽ từ số liệu thật, không dùng ảnh bên ngoài) vào public/img/."""
import math, os, numpy as np
os.makedirs("public/img", exist_ok=True)
CL = ["#2f5bea", "#e8590c", "#2b8a3e", "#ae3ec9"]
def save(name, w, h, body, title):
    open(f"public/img/{name}.svg", "w", encoding="utf-8").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}"><title>{title}</title><rect width="{w}" height="{h}" rx="12" fill="#f5f7fb"/><g style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:13px;fill:#1a1a1a">{body}</g></svg>')
def T(x, y, s, a="middle", sz=13, f="#1a1a1a", w="normal"): return f'<text x="{x:.1f}" y="{y:.1f}" text-anchor="{a}" font-size="{sz}" fill="{f}" font-weight="{w}">{s}</text>'
def C(x, y, r, f, e=""): return f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{f}" {e}/>'
def L(a, b, c, d, s="#8a93a6", w=1.2, e=""): return f'<line x1="{a:.1f}" y1="{b:.1f}" x2="{c:.1f}" y2="{d:.1f}" stroke="{s}" stroke-width="{w}" {e}/>'
def R(x, y, w, h, f, s="none", e=""): return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w}" height="{h}" rx="4" fill="{f}" stroke="{s}" {e}/>'
def P(pts, s, w=2.2, e=""): return f'<polyline fill="none" stroke="{s}" stroke-width="{w}" points="{" ".join(f"{x:.1f},{y:.1f}" for x, y in pts)}" {e}/>'
def mp(x0, x1, y0, y1, W=440, H=290, l=44, r=20, t=34, b=34):
    return (lambda x: l + (x - x0) / (x1 - x0) * (W - l - r)), (lambda y: H - b - (y - y0) / (y1 - y0) * (H - t - b))
# 1. activations
fx, fy = mp(-4, 4, -1.2, 2.2); xs = np.linspace(-4, 4, 80)
b = L(fx(-4), fy(0), fx(4), fy(0)) + L(fx(0), fy(-1.2), fx(0), fy(2.2))
for nm, fn, col in (("sigmoid", lambda x: 1 / (1 + math.exp(-x)), CL[0]), ("tanh", math.tanh, CL[1]), ("ReLU", lambda x: max(0, x), CL[2])): b += P([(fx(x), fy(fn(x))) for x in xs], col)
b += T(220, 22, "Các hàm kích hoạt phổ biến", sz=15, w="600") + "".join(T(70 + i * 90, 280, n, f=c) for i, (n, c) in enumerate((("sigmoid", CL[0]), ("tanh", CL[1]), ("ReLU", CL[2]))))
save("activations", 440, 290, b, "Đồ thị sigmoid, tanh và ReLU")
# 2. gradient descent (động)
fx, fy = mp(-4.5, 4.5, 0, 20.5); th = [4 * 0.8 ** t for t in range(14)]
b = L(fx(-4.5), fy(0), fx(4.5), fy(0)) + P([(fx(x), fy(x * x)) for x in np.linspace(-4.5, 4.5, 60)], "#8a93a6") + P([(fx(t), fy(t * t)) for t in th], CL[1], 1.5, 'stroke-dasharray="4 3"')
path = "M" + " L".join(f"{fx(t):.1f},{fy(t*t):.1f}" for t in th)
b += C(0, 0, 7, CL[1], f'><animateMotion dur="5s" repeatCount="indefinite" path="{path}"/></circle') .replace("/>><", "><") if False else f'<circle r="7" fill="{CL[1]}"><animateMotion dur="5s" repeatCount="indefinite" path="{path}"/></circle>'
b += T(220, 22, "Gradient Descent trên L(θ)=θ² (θ₀=4, η=0.1)", sz=14, w="600") + T(220, 282, "mỗi bước nhân θ với 0,8 nên tiến dần về cực tiểu θ=0", sz=12)
save("gradient-descent", 440, 290, b, "Hoạt ảnh Gradient Descent trên parabol")
# 3. knn
fx, fy = mp(0, 6, 0, 6); pts = [(1, 1, 0), (2, 1, 0), (4, 4, 1), (5, 4, 1)]
b = L(fx(0), fy(0), fx(6), fy(0)) + L(fx(0), fy(0), fx(0), fy(6)) + C(fx(3), fy(3), (fx(3 + 2.24) - fx(3)), "none", 'stroke="#8a93a6" stroke-dasharray="5 4"')
for x, y, c in pts: b += C(fx(x), fy(y), 7, CL[c]) + T(fx(x), fy(y) - 11, "ABCD"[pts.index((x, y, c))])
b += f'<path d="M{fx(3):.1f},{fy(3)-9:.1f} l8,9 l-8,9 l-8,-9z" fill="#1a1a1a"/>' + T(fx(3) + 14, fy(3) + 4, "q", "start") + T(220, 22, "KNN: q=(3,3), K=3 → 2 phiếu lớp 1", sz=14, w="600")
save("knn", 440, 290, b, "Minh họa KNN với K bằng 3")
# 4. kmeans
rg = np.random.default_rng(42); Xk = np.vstack([rg.normal(c, 0.6, (40, 2)) for c in ([0, 0], [5, 0], [2.5, 5])]); Cn = Xk[rg.choice(len(Xk), 3, replace=False)]
for _ in range(20):
    a = np.argmin(((Xk[:, None] - Cn[None]) ** 2).sum(-1), axis=1); Cn = np.array([Xk[a == k].mean(0) if (a == k).any() else Cn[k] for k in range(3)])
fx, fy = mp(-2, 7, -2, 7); b = "".join(C(fx(p[0]), fy(p[1]), 3.5, CL[a[i] % 3], 'opacity="0.8"') for i, p in enumerate(Xk))
b += "".join(R(fx(c[0]) - 6, fy(c[1]) - 6, 12, 12, CL[k], "#000", 'stroke-width="2"') for k, c in enumerate(Cn)) + T(220, 22, f"K-Means (K=3): inertia = {((Xk - Cn[a]) ** 2).sum():.2f}", sz=14, w="600")
save("kmeans", 440, 290, b, "Kết quả phân cụm K-Means với ba cụm")
# 5. bias-variance
fx, fy = mp(0, 3, 0, 0.3); tr = [.218, .029, .022, .018]; te = [.253, .056, .049, .056]
b = L(fx(0), fy(0), fx(3), fy(0)) + P([(fx(i), fy(v)) for i, v in enumerate(tr)], CL[0]) + P([(fx(i), fy(v)) for i, v in enumerate(te)], CL[1])
for i, d in enumerate((1, 3, 9, 15)): b += C(fx(i), fy(tr[i]), 4, CL[0]) + C(fx(i), fy(te[i]), 4, CL[1]) + T(fx(i), 262, f"bậc {d}")
b += T(220, 22, "Lỗi train và test theo bậc đa thức (số liệu thật của bài)", sz=13, w="600") + T(300, 60, "test", f=CL[1], a="start") + T(300, 76, "train", f=CL[0], a="start")
save("bias-variance", 440, 290, b, "Lỗi train và test theo độ phức tạp mô hình")
# 6. mlp
ly = [(70, 2), (220, 3), (370, 1)]; ys = lambda n: [145 + (i - (n - 1) / 2) * 60 for i in range(n)]; b = ""
for (x1, n1), (x2, n2) in zip(ly, ly[1:]):
    for y1 in ys(n1):
        for y2 in ys(n2): b += L(x1, y1, x2, y2, "#aab2c5", 1)
for (x, n), col in zip(ly, CL): b += "".join(C(x, y, 14, col) for y in ys(n))
b += T(70, 255, "đầu vào x (2)") + T(220, 255, "lớp ẩn h = ReLU(xW₁+b₁) (3)") + T(370, 255, "đầu ra ŷ (1)") + T(220, 24, "MLP 2-3-1: mỗi mũi nối là một trọng số", sz=14, w="600")
save("mlp", 440, 290, b, "Sơ đồ mạng MLP 2-3-1")
# 7. conv (động)
b = T(220, 24, "Tích chập: kernel 2×2 trượt trên ảnh 3×3", sz=14, w="600")
for i in range(3):
    for j in range(3): b += R(40 + j * 44, 60 + i * 44, 42, 42, "#fff", "#8a93a6") + T(61 + j * 44, 87 + i * 44, i * 3 + j + 1)
b += f'<rect width="86" height="86" rx="4" fill="none" stroke="{CL[1]}" stroke-width="3"><animate attributeName="x" values="40;84;40;84" dur="4s" repeatCount="indefinite" calcMode="discrete"/><animate attributeName="y" values="60;60;104;104" dur="4s" repeatCount="indefinite" calcMode="discrete"/></rect>'
b += T(200, 120, "∗", sz=28) + R(230, 80, 46, 46, "#fff", "#8a93a6") + R(276, 80, 46, 46, "#fff", "#8a93a6") + R(230, 126, 46, 46, "#fff", "#8a93a6") + R(276, 126, 46, 46, "#fff", "#8a93a6") + T(253, 108, "1") + T(299, 108, "0") + T(253, 154, "0") + T(299, 154, "−1") + T(276, 70, "kernel") + T(340, 120, "=", sz=28)
for i in range(2):
    for j in range(2): b += R(360 + j * 36, 92 + i * 36, 34, 34, "#fff2e6", CL[1]) + T(377 + j * 36, 115 + i * 36, "−4")
b += T(220, 240, "mỗi ô ra = x[i,j] − x[i+1,j+1] = −4", sz=12)
save("conv", 440, 290, b, "Hoạt ảnh phép tích chập")
# 8. attention
fx, fy = mp(0, 2, 0, 1); b = T(220, 24, "Attention: trọng số softmax(q·k/√d)", sz=14, w="600")
for i, (w, nm) in enumerate(((0.6698, "k₁=(1,0)"), (0.3302, "k₂=(0,1)"))): b += R(110, 70 + i * 70, 280 * w / 0.6698 * 0.7, 40, CL[i]) + T(100, 96 + i * 70, nm, "end") + T(120 + 280 * w / 0.6698 * 0.7, 96 + i * 70, f"{w:.4f}", "start")
b += T(220, 230, "với q=(1,0), V=[[1,2],[3,4]] ⇒ đầu ra ≈ (1.6605, 2.6605)", sz=12)
save("attention", 440, 290, b, "Trọng số attention giữa query và hai key")
# 9. decision tree
b = T(220, 22, "Cây quyết định: giảm Gini từ 0,5 xuống 0,25", sz=14, w="600") + L(220, 90, 120, 170) + L(220, 90, 320, 170)
b += R(140, 50, 160, 44, "#fff", CL[0]) + T(220, 69, "Nút gốc: 3A, 3B", w="600") + T(220, 86, "Gini = 0,5", sz=12)
b += R(40, 170, 160, 44, "#fff", CL[1]) + T(120, 189, "Trái: 3A, 1B") + T(120, 206, "Gini = 0,375", sz=12) + R(240, 170, 160, 44, "#fff", CL[2]) + T(320, 189, "Phải: 2B") + T(320, 206, "Gini = 0 (thuần)", sz=12)
b += T(220, 252, "Gini sau chia = (4/6)·0,375 + (2/6)·0 = 0,25", sz=12)
save("decision-tree", 440, 290, b, "Cây quyết định và độ giảm Gini")
# 10. confusion matrix
b = T(220, 22, "Ma trận nhầm lẫn: TP=40, FP=10, FN=20, TN=30", sz=14, w="600") + T(220, 60, "Dự đoán", sz=12) + T(70, 160, "Thực tế", sz=12)
for (i, j, nm, v, col) in ((0, 0, "TP", 40, "#d3f9d8"), (0, 1, "FN", 20, "#ffe3e3"), (1, 0, "FP", 10, "#ffe3e3"), (1, 1, "TN", 30, "#d3f9d8")): b += R(130 + j * 100, 80 + i * 70, 98, 68, col, "#8a93a6") + T(179 + j * 100, 110 + i * 70, nm, w="600") + T(179 + j * 100, 132 + i * 70, v, sz=18)
b += T(180, 74, "dương", sz=12) + T(280, 74, "âm", sz=12) + T(112, 118, "dương", "end", 12) + T(112, 188, "âm", "end", 12) + T(220, 250, "Accuracy 0,70 · Precision 0,80 · Recall 0,667 · F1 0,727", sz=12) 
save("confusion-matrix", 440, 290, b, "Ma trận nhầm lẫn và các chỉ số")
# 11. kfold
b = T(220, 22, "5-fold cross-validation", sz=14, w="600")
for k in range(5):
    b += T(40, 83 + k * 40, f"Lần {k+1}", "end", 12)
    for j in range(5): b += R(50 + j * 68, 62 + k * 40, 66, 30, CL[1] if j == k else "#cfd8ee", "#fff") + T(83 + j * 68, 82 + k * 40, "test" if j == k else "train", sz=12, f="#fff" if j == k else "#1a1a1a")
save("kfold", 440, 290, b, "Sơ đồ chia 5 fold")
# 12. pca
rg = np.random.default_rng(4); a0 = math.pi / 6; u = rg.normal(0, 2.2, 60); v = rg.normal(0, .7, 60)
X = np.c_[5 + u * math.cos(a0) - v * math.sin(a0), 5 + u * math.sin(a0) + v * math.cos(a0)]; m = X.mean(0); ev, evec = np.linalg.eigh(np.cov((X - m).T)); p1 = evec[:, 1]
fx, fy = mp(0, 10, 0, 10); b = "".join(C(fx(p[0]), fy(p[1]), 3.5, CL[0], 'opacity="0.8"') for p in X)
b += L(fx(m[0] - 4 * p1[0]), fy(m[1] - 4 * p1[1]), fx(m[0] + 4 * p1[0]), fy(m[1] + 4 * p1[1]), CL[1], 2.5) + L(fx(m[0] + 1.5 * p1[1]), fy(m[1] - 1.5 * p1[0]), fx(m[0] - 1.5 * p1[1]), fy(m[1] + 1.5 * p1[0]), CL[2], 2.5)
b += T(220, 22, f"PCA: PC1 giữ {ev[1]/ev.sum()*100:.1f}% phương sai", sz=14, w="600") + T(330, 60, "PC1", f=CL[1], a="start") + T(330, 76, "PC2", f=CL[2], a="start")
save("pca", 440, 290, b, "Các thành phần chính của một đám mây điểm")

# ---- Đợt 2: hình cho các bài còn lại ----
def save(name, w, h, body, title):
    open(f"public/img/{name}.svg", "w", encoding="utf-8").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" role="img" aria-label="{title}"><title>{title}</title><defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0L10,5L0,10z" fill="#8a93a6"/></marker></defs><rect width="{w}" height="{h}" rx="12" fill="#f5f7fb"/><g style="font-family:system-ui,Segoe UI,Arial,sans-serif;font-size:13px;fill:#1a1a1a">{body}</g></svg>')
def BX(x, y, w, h, s, f="#fff", st="#8a93a6", sz=12):
    ls = s.split("|"); o = R(x, y, w, h, f, st)
    for i, l in enumerate(ls): o += T(x + w / 2, y + h / 2 + (i - (len(ls) - 1) / 2) * 15 + 4, l, sz=sz)
    return o
def AR(a, b, c, d, col="#8a93a6"): return L(a, b, c, d, col, 1.6, 'marker-end="url(#ar)"')
def H(s): return T(220, 22, s, sz=14, w="600")
def axes(fx, fy, x0, x1, y0, y1): return L(fx(x0), fy(y0), fx(x1), fy(y0)) + L(fx(x0), fy(y0), fx(x0), fy(y1))
# linear regression
rg = np.random.default_rng(7); x = rg.uniform(0, 10, 30); y = 2.5 * x + 4 + rg.normal(0, 2, 30); w1, b1 = np.polyfit(x, y, 1)
fx, fy = mp(0, 10, 0, 34); b = axes(fx, fy, 0, 10, 0, 34) + "".join(L(fx(a), fy(c), fx(a), fy(w1 * a + b1), "#e8590c", 1) for a, c in list(zip(x, y))[:10]) + "".join(C(fx(a), fy(c), 3.5, CL[0]) for a, c in zip(x, y)) + L(fx(0), fy(b1), fx(10), fy(10 * w1 + b1), CL[1], 2.5)
save("linear-regression", 440, 290, b + H(f"Hồi quy tuyến tính: ŷ = {w1:.2f}x + {b1:.2f}") + T(220, 282, "đoạn cam: sai số (residual) của từng điểm", sz=12), "Đường hồi quy và sai số")
# logistic
fx, fy = mp(-6, 6, -0.1, 1.1); sg = lambda z: 1 / (1 + math.exp(-z)); b = axes(fx, fy, -6, 6, -0.1, 1.1) + L(fx(-6), fy(.5), fx(6), fy(.5), "#8a93a6", 1, 'stroke-dasharray="4 3"') + L(fx(0), fy(-0.1), fx(0), fy(1.1), CL[1], 1.5, 'stroke-dasharray="4 3"') + P([(fx(z), fy(sg(z))) for z in np.linspace(-6, 6, 80)], CL[0])
b += "".join(C(fx(z), fy(0), 5, CL[0]) for z in (-4.5, -3.5, -2, -1)) + "".join(C(fx(z), fy(1), 5, CL[1]) for z in (1, 2.2, 3.5, 4.5)) + T(fx(0) + 6, fy(.5) - 8, "ranh giới z=0", "start", 12, CL[1]) + H("Logistic Regression: p = σ(z)")
save("logistic-regression", 440, 290, b, "Đường sigmoid và ranh giới quyết định")
# perceptron
rg = np.random.default_rng(0); Xp = np.vstack([rg.normal(-3, .8, (20, 2)), rg.normal(3, .8, (20, 2))]); yp = np.array([-1] * 20 + [1] * 20); wv = np.zeros(2); bv = 0.0
for _ in range(100):
    e = 0
    for xi, ti in zip(Xp, yp):
        if ti * (xi @ wv + bv) <= 0: wv += ti * xi; bv += ti; e += 1
    if e == 0: break
fx, fy = mp(-6, 6, -6, 6); b = "".join(C(fx(p[0]), fy(p[1]), 4, CL[0] if t < 0 else CL[1]) for p, t in zip(Xp, yp)) + L(fx(-6), fy(-(wv[0] * -6 + bv) / wv[1]), fx(6), fy(-(wv[0] * 6 + bv) / wv[1]), "#1a1a1a", 2.2) + H("Perceptron: siêu phẳng w·x+b=0 tách hai lớp")
save("perceptron", 440, 290, b, "Đường phân tách của Perceptron")
# svm
fx, fy = mp(-4, 4, -4, 4); b = ""
for k, d in ((0, "#1a1a1a"), (2, "#8a93a6"), (-2, "#8a93a6")):
    xa, xb = max(-4, k - 4), min(4, k + 4)  # cắt đường x+y=k trong khung [-4,4]
    b += L(fx(xa), fy(k - xa), fx(xb), fy(k - xb), d, 2 if k == 0 else 1.2, "" if k == 0 else 'stroke-dasharray="5 4"')
for (a, c) in ((-2, -2), (-3, -1), (-1, -3), (-1, -1)): b += C(fx(a), fy(c), 5, CL[0])
for (a, c) in ((2, 2), (3, 1), (1, 3), (1, 1)): b += C(fx(a), fy(c), 5, CL[1])
b += C(fx(-1), fy(-1), 10, "none", 'stroke="#1a1a1a"') + C(fx(1), fy(1), 10, "none", 'stroke="#1a1a1a"') + T(fx(2.1), fy(-1.8), "lề = 2/‖w‖", "start", 12) + H("SVM: siêu phẳng có lề lớn nhất") + T(220, 282, "vòng tròn đen: support vector", sz=12)
save("svm", 440, 290, b, "Siêu phẳng và lề của SVM")
# random forest
b = H("Random Forest: bỏ phiếu đa số")
for i, (v, col) in enumerate((("A", CL[0]), ("A", CL[0]), ("B", CL[1]))): b += f'<polygon points="{70+i*110},70 {40+i*110},140 {100+i*110},140" fill="#dfe7fb" stroke="#8a93a6"/>' + T(70 + i * 110, 162, f"cây {i+1}", sz=12) + AR(70 + i * 110, 168, 70 + i * 110, 198) + BX(48 + i * 110, 200, 44, 26, f"dự đoán {v}", "#fff", col, 11)
b += BX(110, 244, 220, 30, "Kết quả: lớp A (2/3 phiếu)", "#e6f7ea", CL[2])
save("random-forest", 440, 290, b, "Ba cây bỏ phiếu")
# naive bayes
b = axes(*mp(0, 2, 0, 1)[:2], 0, 2, 0, 1) if False else ""
fx, fy = mp(0, 3, 0, 1)
for i, (v, nm, col) in enumerate(((0.4, "P(spam) tiên nghiệm", CL[0]), (0.8696, "P(spam | có từ 'free')", CL[1]))): b += R(fx(0.4 + i * 1.3), fy(v), 70, fy(0) - fy(v), col) + T(fx(0.4 + i * 1.3) + 35, fy(v) - 6, f"{v:.4f}".rstrip("0") if i else "0.4") + T(fx(0.4 + i * 1.3) + 35, 268, nm, sz=11)
save("naive-bayes", 440, 290, b + H("Định lý Bayes cập nhật niềm tin: 0,4 → 0,87"), "Xác suất spam trước và sau khi thấy từ")
# ridge-lasso
fx, fy = mp(0, 28, 0, 2.2); ls = np.linspace(0, 28, 60); b = axes(fx, fy, 0, 28, 0, 2.2) + P([(fx(l), fy(28 / (14 + l))) for l in ls], CL[0]) + P([(fx(l), fy(max(0, (28 - l) / 14))) for l in ls], CL[1])
b += H("Hệ số w theo λ (dữ liệu ví dụ của bài)") + T(300, 60, "Ridge: co dần, không về 0", "start", 12, CL[0]) + T(300, 78, "Lasso: về đúng 0 khi λ ≥ 28", "start", 12, CL[1]) + T(220, 282, "λ", sz=12)
save("ridge-lasso", 440, 290, b, "Hệ số Ridge và Lasso theo lambda")
# softmax
z = np.array([2., 1., 0.]); pr = np.exp(z) / np.exp(z).sum(); b = H("Softmax: logits → xác suất")
for i in range(3): b += T(40, 90 + i * 55, f"z{i}={z[i]:.0f}", "start") + R(110, 70 + i * 55, 90 * 3 * pr[i] / pr[0], 30, CL[i]) + T(120 + 270 * pr[i] / pr[0] * 0.9 + 4, 90 + i * 55, f"{pr[i]:.4f}", "start")
save("softmax-regression", 440, 290, b + T(220, 252, "z = (2, 1, 0) → p = (0,6652; 0,2447; 0,0900)", sz=12), "Logits và xác suất softmax")
# optimizers
th, v = 4.0, 0.0; gd = [4.0]; mo = [4.0]
for _ in range(14): gd.append(gd[-1] - 0.1 * 2 * gd[-1])
for _ in range(14): v = 0.9 * v + 2 * mo[-1]; mo.append(mo[-1] - 0.1 * v)
fx, fy = mp(0, 14, -2, 4.5); b = axes(fx, fy, 0, 14, -2, 4.5) + L(fx(0), fy(0), fx(14), fy(0), "#8a93a6", 1, 'stroke-dasharray="4 3"') + P([(fx(i), fy(t)) for i, t in enumerate(gd)], CL[0]) + P([(fx(i), fy(t)) for i, t in enumerate(mo)], CL[1])
save("optimizers", 440, 290, b + H("θ theo bước: GD thuần và Momentum (β=0,9)") + T(300, 70, "GD: giảm đều", "start", 12, CL[0]) + T(300, 88, "Momentum: vượt qua 0 rồi dao động", "start", 12, CL[1]), "Quỹ đạo GD và Momentum")
# backprop + autograd graphs
def graph(name, title, nodes, grads):
    b = H(title)
    for i, t in enumerate(nodes):
        x0 = 9 + i * 88; b += BX(x0, 70, 70, 44, t, "#fff", CL[0], 11)
        if i: b += AR(x0 - 18, 92, x0, 92)
    for i, g in enumerate(grads): b += T(9 + i * 88 + 35, 150, g, sz=11, f=CL[1])
    save(name, 440, 230 if False else 290, b + T(220, 200, "mũi tên xanh: tính tiến · số cam: gradient lan truyền ngược", sz=12), title)
graph("backpropagation", "Đồ thị tính toán: forward và backward", ["x = 1", "a = w₁x|= 2", "h = ReLU(a)|= 2", "ŷ = w₂h|= 6", "L = ½(ŷ−5)²|= 0,5"], ["", "∂L/∂w₁ = 3", "∂L/∂h = 3", "∂L/∂ŷ = 1  (∂L/∂w₂ = 2)", "∂L/∂L = 1"])
graph("autograd", "Autograd: f = a·b + c", ["a=2, b=−3", "a·b|= −6", "+ c (c=10)", "f = 4", ""], ["∂f/∂a=−3, ∂f/∂b=2", "∂f/∂(ab)=1", "∂f/∂c=1", "∂f/∂f=1", ""])
# rnn
b = H("RNN: cùng trọng số, trạng thái ẩn truyền theo thời gian")
for i, (hv, xv) in enumerate((("0,7616", "1"), ("−0,5506", "−1"))): b += BX(110 + i * 150, 90, 90, 56, f"RNN|h{i+1} = {hv}", "#fff", CL[0]) + AR(155 + i * 150, 200, 155 + i * 150, 148) + T(155 + i * 150, 218, f"x{i+1} = {xv}")
b += BX(10, 100, 60, 36, "h₀ = 0", "#fff", "#8a93a6") + AR(70, 118, 110, 118) + AR(200, 118, 260, 118) + AR(350, 118, 400, 118)
save("rnn-lstm", 440, 290, b + T(220, 262, "hₜ = tanh(0,5·hₜ₋₁ + 1·xₜ)", sz=12), "RNN trải theo thời gian")
# transfer
b = H("Transfer Learning: đóng băng thân, huấn luyện đầu ra mới") + BX(20, 90, 150, 70, "Thân mạng pretrained|(đóng băng)", "#e9ecef", "#8a93a6") + AR(170, 125, 215, 125) + BX(215, 90, 90, 70, "đặc trưng|512 chiều", "#fff", "#8a93a6") + AR(305, 125, 340, 125) + BX(340, 90, 90, 70, "Linear 512→10|5130 tham số|(huấn luyện)", "#fff2e6", CL[1], 11)
save("transfer-learning", 440, 290, b + T(220, 220, "chỉ lớp cam được cập nhật gradient", sz=12), "Đóng băng thân và huấn luyện lớp mới")
# autoencoder
cols = [(50, 4), (140, 6), (220, 2), (300, 6), (390, 4)]; ys = lambda n: [150 + (i - (n - 1) / 2) * 30 for i in range(n)]; b = H("Autoencoder: nén rồi khôi phục")
for (x1, n1), (x2, n2) in zip(cols, cols[1:]):
    for y1 in ys(n1):
        for y2 in ys(n2): b += L(x1, y1, x2, y2, "#c5ccdb", .7)
for (xx, n), col in zip(cols, (CL[0], CL[0], CL[1], CL[2], CL[2])): b += "".join(C(xx, yy, 8, col) for yy in ys(n))
save("autoencoder", 440, 290, b + T(95, 250, "encoder") + T(220, 250, "mã z (2)") + T(345, 250, "decoder"), "Cấu trúc autoencoder")
# gan/vae/diffusion
b = H("Ba họ mô hình sinh") + BX(15, 60, 130, 90, "GAN|G tạo mẫu giả|D phân biệt thật/giả", "#fff", CL[0], 11) + BX(155, 60, 130, 90, "VAE|encoder → z=μ+σε|decoder + KL", "#fff", CL[1], 11) + BX(295, 60, 130, 90, "Diffusion|thêm nhiễu dần|rồi khử nhiễu", "#fff", CL[2], 11)
b += T(80, 180, "D* = 0,5 khi p_g=p_data", sz=11) + T(220, 180, "KL(μ=1,σ²=1)=0,5", sz=11) + T(360, 180, "x_t=0,8·1+0,6·0,5=1,1", sz=11)
save("gan-vae-diffusion", 440, 290, b, "GAN, VAE và Diffusion")
# embeddings
M = [[1, .634, 0], [.634, 1, 0], [0, 0, 1]]; b = H("Độ tương đồng cosine TF-IDF giữa 3 câu")
for i in range(3):
    for j in range(3): v = M[i][j]; b += R(130 + j * 70, 60 + i * 60, 66, 56, f"rgb({245-int(120*v)},{247-int(80*v)},255)", "#8a93a6") + T(163 + j * 70, 94 + i * 60, f"{v:.3f}".rstrip("0").rstrip(".") if v not in (0, 1) else str(int(v)))
b += "".join(T(163 + j * 70, 52, f"câu {j+1}", sz=11) + T(120, 92 + j * 60, f"câu {j+1}", "end", 11) for j in range(3))
save("embeddings", 440, 290, b + T(220, 262, "câu 1, 2 chung 'học', 'rất', 'hay'; câu 3 không chung từ nào", sz=11), "Ma trận tương đồng TF-IDF")
# hyperparameter grid
b = H("Grid Search 3×2 (5-fold CV): chọn C=10, gamma=scale")
for i, cv in enumerate((0.1, 1, 10)):
    for j, g in enumerate(("scale", "0,01")): best = cv == 10 and j == 0; b += BX(110 + j * 120, 60 + i * 60, 114, 52, f"C={cv}, gamma={g}" + ("|điểm CV 0,967" if best else ""), "#e6f7ea" if best else "#fff", CL[2] if best else "#8a93a6", 11)
save("hyperparameter-tuning", 440, 290, b + T(220, 260, "6 tổ hợp × 5 fold = 30 lần huấn luyện", sz=12), "Lưới siêu tham số")
# workflow
st = ["Bài toán|và metric", "Dữ liệu|khám phá", "Chia|train/test", "Baseline", "Pipeline|+ CV", "Tinh chỉnh", "Test|1 lần", "Triển khai|theo dõi"]; b = H("Quy trình một dự án ML")
for i, t in enumerate(st):
    r, c = divmod(i, 4); b += BX(14 + c * 108, 70 + r * 90, 96, 54, f"{i+1}. " + t.replace("|", "|"), "#fff", CL[0], 11)
    if c < 3: b += AR(110 + c * 108, 97 + r * 90, 122 + c * 108, 97 + r * 90)
save("ml-project-workflow", 440, 290, b, "Các bước của dự án ML")
# derivatives
fx, fy = mp(-1, 3, -0.5, 6); b = axes(fx, fy, -1, 3, -0.5, 6) + P([(fx(t), fy(t * t)) for t in np.linspace(-1, 2.4, 60)], CL[0]) + L(fx(0), fy(-1), fx(2.5), fy(4), CL[1], 2) + C(fx(1), fy(1), 5, "#1a1a1a")
save("derivatives", 440, 290, b + H("Tiếp tuyến của f(x)=x² tại x=1 có độ dốc f′(1)=2") + T(fx(1) + 8, fy(1) + 16, "(1, 1)", "start", 12), "Tiếp tuyến của parabol")
# vectors
fx, fy = mp(-0.5, 2, -0.5, 2); b = axes(fx, fy, -0.5, 2, -0.5, 2) + AR(fx(0), fy(0), fx(1.6), fy(0), CL[0]) + AR(fx(0), fy(0), fx(1.2), fy(1.2), CL[1]) + f'<path d="M{fx(.5):.1f},{fy(0):.1f} A{fx(.5)-fx(0):.1f},{fx(.5)-fx(0):.1f} 0 0 0 {fx(.35):.1f},{fy(.35):.1f}" fill="none" stroke="#1a1a1a"/>'
save("vectors-matrices", 440, 290, b + H("a=(1,0), b=(1,1): cos θ = 1/√2 ≈ 0,7071 (θ=45°)") + T(fx(1.6), fy(0) - 8, "a", sz=13) + T(fx(1.2) + 10, fy(1.2), "b", "start", 13), "Hai vector và góc giữa chúng")
# probability
fx, fy = mp(-3.5, 3.5, 0, 0.45); nd = lambda t: math.exp(-t * t / 2) / math.sqrt(2 * math.pi); xs2 = np.linspace(-1, 1, 40)
b = f'<polygon fill="#cfdcff" points="{fx(-1):.1f},{fy(0):.1f} ' + " ".join(f"{fx(t):.1f},{fy(nd(t)):.1f}" for t in xs2) + f' {fx(1):.1f},{fy(0):.1f}"/>' + axes(fx, fy, -3.5, 3.5, 0, .45) + P([(fx(t), fy(nd(t))) for t in np.linspace(-3.5, 3.5, 80)], CL[0])
save("probability", 440, 290, b + H("Phân phối chuẩn: khoảng μ±σ chứa ≈ 68,27%") + T(fx(0), fy(.15), "68,27%", sz=14, w="600"), "Phân phối chuẩn và khoảng một sigma")
# numpy broadcasting
b = H("Broadcasting: (3,1) + (1,4) → (3,4)")
for i in range(3):
    b += BX(20, 70 + i * 40, 34, 34, str(i), "#dfe7fb", CL[0])
    for j in range(4): b += BX(150 + j * 40, 70 + i * 40, 36, 36, str(i + j), "#fff", "#8a93a6")
for j in range(4): b += BX(150 + j * 40, 24 + 0, 36, 0.1, "", "none", "none") if False else ""
b += T(37, 62, "(3,1)", sz=11) + T(110, 130, "+", sz=22) + T(230, 210, "kết quả (3,4)", sz=12) + "".join(BX(150 + j * 40, 235, 36, 28, str(j), "#ffe9d9", CL[1]) for j in range(4)) + T(110, 254, "(1,4):", "end", 11)
save("numpy-pandas", 440, 290, b, "Quy tắc broadcasting")
# gmm
fx, fy = mp(-3, 7, 0, 0.45); g = lambda t, m: math.exp(-(t - m) ** 2 / 2) / math.sqrt(2 * math.pi)
b = axes(fx, fy, -3, 7, 0, .45) + P([(fx(t), fy(g(t, 0))) for t in np.linspace(-3, 7, 90)], CL[0]) + P([(fx(t), fy(g(t, 4))) for t in np.linspace(-3, 7, 90)], CL[1]) + L(fx(1), fy(0), fx(1), fy(.45), "#1a1a1a", 1.2, 'stroke-dasharray="4 3"')
save("gmm", 440, 290, b + H("GMM: điểm x=1 thuộc thành phần 1 với r ≈ 0,982") + T(fx(1) + 6, fy(.4), "x = 1", "start", 12), "Hai thành phần Gauss")
# anomaly
fx, fy = mp(0, 55, 0, 1); b = L(fx(0), 150, fx(55), 150, "#1a1a1a", 1.5) + L(fx(14.375), 80, fx(14.375), 190, CL[1], 1.8, 'stroke-dasharray="5 4"') + T(fx(14.375) + 6, 90, "ngưỡng IQR = 14,375", "start", 12, CL[1])
for v in (9, 10, 10, 11, 12): b += C(fx(v), 150 - 0, 5, CL[0], 'opacity="0.8"')
b += C(fx(50), 150, 7, CL[1]) + T(fx(50), 130, "50: bất thường", sz=12) + "".join(T(fx(t), 175, str(t), sz=11) for t in (0, 10, 20, 30, 40, 50))
save("anomaly-detection", 440, 290, b + H("Phát hiện ngoại lai bằng IQR") + T(220, 240, "z-score của 50 chỉ ≈ 2,23 nên ngưỡng |z|>3 bỏ sót", sz=12), "Ngoại lai trên trục số")
# recommendation
b = H("Ma trận người dùng × mục: dự đoán ô trống"); vals = [[5, 4, "?"], [4, 5, 2], [1, 2, 5]]
for i in range(3):
    b += T(110, 112 + i * 52, f"U{i+1}", "end")
    for j in range(3): q = vals[i][j] == "?"; b += BX(124 + j * 80, 82 + i * 52, 74, 44, "3,446 (dự đoán)" if q else str(vals[i][j]), "#fff2e6" if q else "#fff", CL[1] if q else "#8a93a6", 12)
b += "".join(T(161 + j * 80, 72, f"mục {j+1}", sz=11) for j in range(3))
save("recommendation", 440, 290, b + T(220, 262, "trung bình có trọng số theo độ tương đồng với U2 (0,9756) và U3 (0,908)", sz=11), "Dự đoán đánh giá còn thiếu")
# data prep
b = H("Chia 1000 mẫu theo 70/15/15") + R(20, 100, 400 * .7, 50, CL[0]) + R(20 + 280, 100, 60, 50, CL[1]) + R(20 + 340, 100, 60, 50, CL[2]) + T(160, 130, "train: 700", f="#fff", w="600") + T(330, 130, "val: 150", f="#fff", sz=11) + T(390, 130, "test: 150", f="#fff", sz=11)
save("data-preparation", 440, 290, b + T(220, 200, "μ và σ để chuẩn hóa chỉ tính từ train", sz=12) + T(220, 222, "rồi áp dụng cho val và test", sz=12), "Chia train/validation/test")
# dropout
b = H("Dropout (p=0,8): kỳ vọng được giữ nguyên nhờ nhân 1/p = 1,25")
for i in range(5): off = i == 2; b += C(50 + i * 80, 120, 22, "#fff", 'stroke="#8a93a6"' if off else f'stroke="{CL[0]}"') + T(50 + i * 80, 125, "0" if off else "1.25", sz=12) + (L(32 + i * 80, 105, 68 + i * 80, 135, CL[1], 2) if off else "") + T(50 + i * 80, 170, "tắt" if off else "giữ", sz=11)
save("dl-regularization", 440, 290, b + T(220, 230, "BatchNorm: (1,2,3,4) → (−1,34; −0,45; 0,45; 1,34)", sz=12), "Dropout và BatchNorm")
# ml intro
b = H("AI ⊃ Machine Learning ⊃ Deep Learning") + C(220, 160, 118, "#dfe7fb", 'stroke="#8a93a6"') + C(220, 190, 80, "#ffe3cf", f'stroke="{CL[1]}"') + C(220, 215, 42, "#d3f0da", f'stroke="{CL[2]}"') + T(220, 96, "AI", w="600") + T(220, 146, "Machine Learning", w="600") + T(220, 220, "Deep", sz=12, w="600") + T(220, 234, "Learning", sz=12, w="600")
save("ml-intro", 440, 290, b, "Quan hệ giữa AI, ML và DL")
# leakage
b = H("Rò rỉ dữ liệu và cách tránh") + BX(20, 56, 400, 24, "SAI: chọn đặc trưng trên TOÀN BỘ dữ liệu → chia fold → accuracy 0,85 (giả tạo)", "#ffe3e3", "#e03131", 11) + BX(20, 100, 400, 24, "ĐÚNG: Pipeline(chọn đặc trưng + mô hình) trong cross-validation → 0,57", "#d3f9d8", CL[2], 11)
b += BX(30, 150, 110, 44, "Fold train|fit bước học", "#fff", CL[0], 11) + AR(140, 172, 170, 172) + BX(170, 150, 110, 44, "Áp dụng|cho fold test", "#fff", CL[1], 11) + AR(280, 172, 310, 172) + BX(310, 150, 100, 44, "Điểm số|đáng tin", "#fff", CL[2], 11)
save("feature-leakage", 440, 290, b + T(220, 230, "dữ liệu nhãn ngẫu nhiên: điểm hợp lý quanh 0,5", sz=12), "Rò rỉ dữ liệu so với pipeline đúng")
# pytorch shapes
b = H("Shape của CNN trên ảnh 28×28 (PyTorch: N,C,H,W)")
for i, (t, col) in enumerate((("Ảnh|1×28×28", "#fff"), ("Conv 3×3|8×28×28", "#fff"), ("MaxPool 2×2|8×14×14", "#fff"), ("Flatten|1568", "#fff"), ("Linear|10", "#fff"))): b += BX(8 + i * 86, 100, 76, 52, t, col, CL[i % 3], 11) + (AR(84 + i * 86, 126, 94 + i * 86, 126) if i < 4 else "")
save("pytorch-practice", 440, 290, b + T(220, 200, "Linear: 1568×10 + 10 = 15 690 tham số", sz=12), "Shape qua các lớp của CNN")
# deployment
b = H("Từ huấn luyện đến dịch vụ")
for i, (t, col) in enumerate((("Huấn luyện|Pipeline", CL[0]), ("joblib.dump|→ m.joblib", CL[1]), ("joblib.load|(nguồn tin cậy)", CL[1]), ("API /predict|→ dự đoán", CL[2]))): b += BX(12 + i * 106, 100, 94, 52, t, "#fff", col, 11) + (AR(106 + i * 106, 126, 118 + i * 106, 126) if i < 3 else "")
save("model-deployment", 440, 290, b + T(220, 200, "lưu cả bộ tiền xử lý · ghi phiên bản thư viện · theo dõi sau triển khai", sz=11), "Quy trình lưu và triển khai mô hình")
# statistics
d = [2, 4, 4, 4, 5, 5, 7, 9]; fx, fy = mp(0, 10, 0, 5); b = L(fx(0), fy(0), fx(10), fy(0), "#1a1a1a", 1.5); cnt = {}
for v in d: cnt[v] = cnt.get(v, 0) + 1; b += C(fx(v), fy(0) - 12 * cnt[v], 8, CL[0])
b += L(fx(5), 50, fx(5), fy(0), CL[1], 2) + T(fx(5) + 6, 62, "trung bình = 5", "start", 12, CL[1]) + L(fx(4.5), 80, fx(4.5), fy(0), CL[2], 2, 'stroke-dasharray="4 3"') + T(fx(4.5) - 6, 96, "trung vị = 4,5", "end", 12, CL[2]) + "".join(T(fx(t), fy(0) + 18, str(t), sz=11) for t in range(0, 11, 2))
save("statistics", 440, 290, b + H("Dữ liệu (2,4,4,4,5,5,7,9): σ = 2, s ≈ 2,138"), "Biểu đồ chấm với trung bình và trung vị")
# text classification
b = H("Phân loại cảm xúc: TF-IDF + Logistic Regression")
for i, (t, col) in enumerate((("Câu văn|bản", "#fff"), ("TF-IDF|vector", "#fff"), ("Logistic|Regression", "#fff"), ("p(tích cực)|0,60 / 0,42", "#fff2e6"))): b += BX(14 + i * 106, 100, 94, 52, t, col, CL[i % 3], 11) + (AR(108 + i * 106, 126, 120 + i * 106, 126) if i < 3 else "")
save("text-classification", 440, 290, b + T(220, 200, "tập đồ chơi 8 câu: chỉ minh họa cơ chế, độ tin cậy thấp", sz=12), "Pipeline phân loại văn bản")
print(len(os.listdir("public/img")), "hình")
# ---- Đợt 3 ----
fx, fy = mp(-4, 4, 0, 8.5); es = np.linspace(-4, 4, 80); hub = lambda e, d=1: .5 * e * e if abs(e) <= d else d * (abs(e) - .5 * d)
b = axes(fx, fy, -4, 4, 0, 8.5) + P([(fx(e), fy(min(e * e / 2, 8.5))) for e in es], CL[0]) + P([(fx(e), fy(abs(e))) for e in es], CL[1]) + P([(fx(e), fy(hub(e))) for e in es], CL[2])
save("loss-functions", 440, 290, b + H("Hàm mất mát theo sai số e") + T(300, 50, "½·MSE: tăng rất nhanh", "start", 12, CL[0]) + T(300, 66, "MAE: tăng đều", "start", 12, CL[1]) + T(300, 82, "Huber (δ=1): dung hòa", "start", 12, CL[2]), "So sánh MSE, MAE và Huber")
xs3 = np.arange(5.0); fx, fy = mp(0, 4, 0, 18); b = axes(fx, fy, 0, 4, 0, 18) + P([(fx(t), fy(t * t + 1)) for t in np.linspace(0, 4, 60)], CL[1]) + P([(fx(t), fy(np.polyval(np.polyfit(xs3, xs3 ** 2 + 1, 1), t))) for t in (0, 4)], CL[0]) + "".join(C(fx(t), fy(t * t + 1), 5, "#1a1a1a") for t in xs3)
save("polynomial-regression", 440, 290, b + H("Bậc 1 (xanh) không khớp, bậc 2 (cam) khớp đúng y = x² + 1") + T(220, 282, "mô hình vẫn tuyến tính theo tham số w", sz=12), "Đường thẳng và parabol trên cùng dữ liệu")
b = H("Một khối Transformer (encoder)") + BX(120, 232, 200, 30, "Embedding + Positional encoding", "#fff", CL[0], 11)
for i, t in enumerate(("Multi-head attention", "Add & LayerNorm", "Feed-forward", "Add & LayerNorm")): b += BX(120, 180 - i * 44, 200, 32, t.replace("&", "và"), "#fff" if i % 2 == 0 else "#eef2ff", CL[1] if i % 2 == 0 else "#8a93a6", 11) + AR(220, 232 - i * 44 if i else 232, 220, 214 - i * 44)
save("transformer-architecture", 440, 290, b + T(380, 150, "×N lớp", sz=12), "Sơ đồ khối Transformer")
print(len(os.listdir("public/img")), "hình (sau đợt 3)")
