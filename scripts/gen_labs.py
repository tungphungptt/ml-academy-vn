"""Chạy từng file lab bằng Python cục bộ và ghi stdout thật vào content/labs.json (expected = null nếu thiếu thư viện)."""
import json, subprocess, sys, pathlib, os
META = [
 ("linear_regression","Linear Regression","Hồi quy tuyến tính bằng Gradient Descent trên dữ liệu y = 2x.","pyodide"),
 ("knn","K-Nearest Neighbors","Phân loại 2 lớp bằng KNN, đánh giá trên tập test.","pyodide"),
 ("kmeans","K-Means","Phân cụm 3 nhóm, báo cáo inertia.","pyodide"),
 ("logistic_regression","Logistic Regression","Phân loại nhị phân: sigmoid, cross-entropy và gradient descent.","pyodide"),
 ("perceptron","Perceptron","Luật cập nhật Perceptron trên dữ liệu khả tách tuyến tính.","pyodide"),
 ("mlp_torch","MLP với PyTorch (XOR)","Forward, loss, backward, optimizer. Cần PyTorch nên chỉ chạy local/Colab.","local")]
os.makedirs("public/notebooks", exist_ok=True)
def notebook(id_, title, desc, v, code):
    cells = [{"cell_type": "markdown", "metadata": {}, "source": [f"# {title} ({v})\n", desc + "\n", "\nNguồn: ML Academy VN. Chạy từng ô theo thứ tự."]}]
    if id_ == "mlp_torch": cells.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": ["# Chỉ cần nếu môi trường chưa có PyTorch (Colab đã có sẵn)\n", "# !pip install torch"]})
    cells.append({"cell_type": "code", "metadata": {}, "execution_count": None, "outputs": [], "source": code.splitlines(True)})
    nb = {"cells": cells, "metadata": {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}, "language_info": {"name": "python"}}, "nbformat": 4, "nbformat_minor": 4}
    path = f"public/notebooks/{id_}_{v}.ipynb"; json.dump(nb, open(path, "w"), ensure_ascii=False, indent=1); return "/notebooks/" + os.path.basename(path)
out = []
for id_, title, desc, rt in META:
    d = pathlib.Path("labs") / id_; variants = {}; expected = {}; nbs = {}
    for v in ("scratch", "library"):
        f = d / f"{v}.py"
        if not f.exists(): continue
        variants[v] = True; nbs[v] = notebook(id_, title, desc, v, f.read_text())
        r = subprocess.run([sys.executable, str(f)], capture_output=True, text=True, timeout=120)
        expected[v] = r.stdout.strip() if r.returncode == 0 else None
    out.append(dict(id=id_, title=title, description=desc, runtime=rt, variants=list(variants), expected=expected, notebooks=nbs))
json.dump(out, open("content/labs.json", "w"), ensure_ascii=False, indent=1)
for o in out: print(o["id"], o["expected"])
