**Cấp độ:** Intermediate · **Tầng:** Intermediate · **Tiên quyết:** Đạo hàm và gradient, Không gian vector, trị riêng và SVD.
**Mục tiêu:** nhận ra bài toán lồi, phân biệt lồi/strictly convex và liên hệ điều kiện tối ưu với hồi quy, Logistic Regression, SVM.

## Tập lồi và đoạn thẳng
Một tập $C$ lồi khi với mọi $x,y\in C$, $tx+(1-t)y\in C$ cho mọi $t\in[0,1]$. Quả cầu norm, halfspace và giao các tập lồi là lồi. Một đường tròn chỉ gồm vành không lồi: đoạn nối hai điểm đối diện đi qua tâm không thuộc vành.

Một hàm $f$ trên miền lồi là lồi khi
$$f(tx+(1-t)y)\le tf(x)+(1-t)f(y).$$
Đồ thị nằm dưới dây cung; đây là phát biểu chính xác hơn ví von “hình cái bát”. Lồi không có nghĩa mọi mức hàm chỉ có một nghiệm: hàm hằng là phản ví dụ. Strict convexity bảo đảm tối đa một nghiệm tối ưu nếu nghiệm tồn tại.

## Gradient, Hessian và điều kiện áp dụng
Với hàm khả vi lồi, $f(y)\ge f(x)+\nabla f(x)^\top(y-x)$. Vì vậy $\nabla f(x^*)=0$ đủ cho nghiệm tối ưu toàn cục ở bài toán không ràng buộc. Với hàm khả vi hai lần trên miền mở lồi, Hessian nửa xác định dương ở mọi điểm tương đương tính lồi.

OLS có Hessian tỷ lệ với $X^\top X\succeq0$. Khi các cột phụ thuộc, Hessian có thể suy biến, nghiệm không duy nhất. Thêm phạt L2 cho các tọa độ phù hợp có thể làm Hessian xác định dương. Logistic loss tuyến tính và bài toán SVM lề mềm chuẩn là lồi; mạng nhiều lớp nói chung không lồi.

## Ràng buộc và duality ở mức nhập môn
Viết $\min f(x)$ với $g_i(x)\le0$, $Ax=b$. Bài toán lồi yêu cầu $f,g_i$ lồi và ràng buộc đẳng thức affine. Lagrangian là $f(x)+\sum_i\lambda_i g_i(x)+\nu^\top(Ax-b)$ với $\lambda_i\ge0$. KKT gồm khả thi primal/dual, stationarity và complementary slackness $\lambda_i g_i(x)=0$. Với điều kiện đủ như Slater cho bài toán lồi thích hợp, KKT mô tả nghiệm tối ưu; không khẳng định điều này cho mọi bài toán bất kỳ.

## Ví dụ có thể kiểm tra
Tối thiểu $x^2$ với $x\ge1$ cho $x^*=1$, không có gradient bằng 0 ở nghiệm biên. Dùng $g(x)=1-x$, stationarity $2x-\lambda=0$ cho $\lambda=2$; constraint hoạt động và tích bù bằng 0.
```python
import numpy as np
X = np.array([[1., 1.], [2., 2.]])
H = 2 * X.T @ X
print(np.linalg.eigvalsh(H).round(4).tolist())
x, multiplier = 1., 2.
assert 2*x - multiplier == 0 and multiplier * (1-x) == 0
```
Kết quả kỳ vọng: `[0.0, 20.0]`.

## Cơ chế tối ưu và giới hạn
Gradient descent đi ngược gradient; với gradient Lipschitz hằng $L$, bước phù hợp như $0<\eta\le1/L$ cho các kết quả giảm hàm chuẩn. Không áp dụng learning rate đó khi chưa biết giả định. Với miền ràng buộc, projected gradient lấy bước rồi chiếu về miền khả thi; bài toán lồi vẫn có thể khó nếu dữ liệu lớn hoặc điều kiện số xấu.

## Bài tập tự đánh giá
1. $\{x:x\ge1\}$ có lồi không?
2. Vì sao hàm $f(x,y)=x^2$ có vô số nghiệm?
3. Kiểm tra KKT của ví dụ $\min x^2$ với $x\ge1$ và giải thích vì sao gradient tại nghiệm không bằng 0.

## Đáp án và tiêu chí chấm
1. Có, mọi tổ hợp lồi của hai số ít nhất 1 vẫn ít nhất 1 (2 điểm).
2. Mọi điểm $(0,y)$ đều tối ưu: không strictly convex theo cả hai biến (3 điểm).
3. $x=1$ khả thi, $\lambda=2\ge0$, stationarity bằng 0 và complementary slackness đúng. Nghiệm ở biên bị constraint chặn; đạo hàm theo hướng không khả thi không cần bằng 0 (5 điểm).

## Tổng kết
Tính lồi nối hình học, đạo hàm và bảo đảm toàn cục. Luôn xét miền, tính tồn tại nghiệm và điều kiện của định lý, không chỉ hình dạng minh họa.

## Nguồn tham khảo
- [ML cơ bản: tập lồi và hàm lồi](https://machinelearningcoban.com/2017/03/12/convexity/).
- [Tối ưu lồi](https://machinelearningcoban.com/2017/03/19/convexopt/) và [duality](https://machinelearningcoban.com/2017/04/02/duality/); snapshot nguồn được ghi trong audit.
